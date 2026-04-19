"""
repertukul_scraper/scraper.py
─────────────────────────────────────────────────────────────────────────────
Scrapes all Turkish folk-song (türkü) entries from repertukul.com/TurkuSozleri
and writes them to `output/songs.json` with incremental checkpointing so that
a crash never means starting from scratch.

Navigation flow
───────────────
  1. Index page  → list of <a> links, one per song
  2. Song page   → click "TÜRKÜ DETAYINI GÖSTER" button
  3. Detail page → metadata table (left) + lyrics (right)

The site is heavily JavaScript-driven (AJAX navigation, dynamic rendering),
so we use Playwright (async, Chromium) instead of requests+BS4.

Usage
─────
  python scraper.py                        # scrape everything
  python scraper.py --limit 10             # scrape first 10 songs (dev/test)
  python scraper.py --concurrency 3        # 3 parallel browser contexts

Checkpointing
─────────────
  • `output/progress.json` records every successfully scraped song URL so the
    script can skip already-done songs on restart.
  • `output/songs.json`    is appended atomically after each song so partial
    runs produce a valid (though incomplete) JSON-Lines file.  The final step
    converts it to a proper JSON array.
  • `output/errors.log`    records URLs that failed after all retries.
"""

import argparse
import asyncio
import json
import logging
import os
import random
import sys
import time
from pathlib import Path
from typing import Optional

from playwright.async_api import (
    Browser,
    BrowserContext,
    Page,
    Playwright,
    async_playwright,
    TimeoutError as PlaywrightTimeoutError,
)

# ── Configuration ─────────────────────────────────────────────────────────────

BASE_URL        = "https://www.repertukul.com/TurkuSozleri"
OUTPUT_DIR      = Path("output")
SONGS_JSONL     = OUTPUT_DIR / "songs.jsonl"   # one JSON object per line
SONGS_JSON      = OUTPUT_DIR / "songs.json"    # final merged array
PROGRESS_FILE   = OUTPUT_DIR / "progress.json"
ERROR_LOG       = OUTPUT_DIR / "errors.log"

# Playwright timeouts (milliseconds)
NAV_TIMEOUT     = 30_000   # page.goto / waitForNavigation
CLICK_TIMEOUT   = 15_000   # button click + load
ELEM_TIMEOUT    = 10_000   # single element wait

# Politeness: random sleep between MIN and MAX seconds after each song
SLEEP_MIN       = 1.0
SLEEP_MAX       = 2.5

# Retry attempts for transient failures
MAX_RETRIES     = 3

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(OUTPUT_DIR / "scraper.log" if OUTPUT_DIR.exists() else "scraper.log"),
    ],
)
log = logging.getLogger(__name__)

# ── Progress / checkpoint helpers ─────────────────────────────────────────────

def load_progress() -> set[str]:
    """Return the set of song URLs already scraped successfully."""
    if PROGRESS_FILE.exists():
        data = json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
        return set(data.get("done", []))
    return set()


def save_progress(done: set[str]) -> None:
    """Persist the progress set to disk (atomic write via temp file)."""
    tmp = PROGRESS_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps({"done": sorted(done)}, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(PROGRESS_FILE)


def append_song(song: dict) -> None:
    """Append one song record to the JSON-Lines file."""
    with SONGS_JSONL.open("a", encoding="utf-8") as f:
        f.write(json.dumps(song, ensure_ascii=False) + "\n")


def log_error(url: str, reason: str) -> None:
    with ERROR_LOG.open("a", encoding="utf-8") as f:
        f.write(f"{url}\t{reason}\n")


def merge_jsonl_to_json() -> None:
    """Convert the JSON-Lines file into a pretty JSON array."""
    songs = []
    if SONGS_JSONL.exists():
        for line in SONGS_JSONL.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line:
                try:
                    songs.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    SONGS_JSON.write_text(
        json.dumps(songs, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    log.info("Merged %d songs → %s", len(songs), SONGS_JSON)

# ── Index page – collect all song links ───────────────────────────────────────

async def collect_song_links(page: Page) -> list[str]:
    """
    Navigate to the index page and return every unique song URL found.
    Extracts URLs from custom div onclick attributes instead of standard <a> tags.
    """
    log.info("Loading index page: %s", BASE_URL)
    await page.goto(BASE_URL, timeout=NAV_TIMEOUT)

    # 1. Wait for the custom song divs to load
    try:
        log.info("Waiting for song list to render...")
        await page.wait_for_selector("div.turkulistesi", timeout=ELEM_TIMEOUT)
        
        # Since it says 8526 records found, give the browser a moment to render them all
        await page.wait_for_timeout(3000) 
        log.info("Song list appears to be rendered.")
    except Exception as exc:
        log.warning("Timeout waiting for 'div.turkulistesi': %s", exc)

    links: list[str] = []

    # 2. Grab all the song divs
    song_divs = await page.query_selector_all("div.turkulistesi")
    log.info("Found %d song elements in the DOM.", len(song_divs))

    # 3. Extract the URL from the onclick attribute
    for div in song_divs:
        onclick_attr = await div.get_attribute("onclick")
        # Example: window.open('TurkuSozleri--A-BENIM-BASI-SALLIM-4644','_blank')
        if onclick_attr and "window.open" in onclick_attr:
            try:
                # Split by single quote to isolate the URL path
                extracted_path = onclick_attr.split("'")[1]
                
                # Build the full URL
                full_url = f"https://www.repertukul.com/{extracted_path}"
                if full_url not in links:
                    links.append(full_url)
            except IndexError:
                log.debug("Could not parse onclick: %s", onclick_attr)

    log.info("Collected %d unique song links", len(links))
    return links

# ── Intermediate page – click detail button ───────────────────────────────────

async def click_detail_button(page: Page) -> bool:
    """
    Finds the "TÜRKÜ DETAYINI GÖSTER" button.
    Instead of clicking it (which opens a messy new tab), we extract the target URL 
    from its onclick attribute and navigate the current page to it directly.
    """
    try:
        # Look for a div that has an onclick attribute AND contains the text "TÜRKÜ DETAYINI GÖSTER"
        selector = "div[onclick*='window.open']:has-text('TÜRKÜ DETAYINI GÖSTER')"
        
        btn_div = await page.wait_for_selector(selector, timeout=ELEM_TIMEOUT)
        
        if btn_div:
            onclick_attr = await btn_div.get_attribute("onclick")
            if onclick_attr and "window.open" in onclick_attr:
                # Example: window.open('ZALIM-POYRAZ-GICIM-GICIM-GICILAR-4114','_blank');
                # Slicing by single quote grabs just the URL path
                extracted_path = onclick_attr.split("'")[1]
                detail_url = f"https://www.repertukul.com/{extracted_path}"
                
                log.info("Navigating to detail page: %s", detail_url)
                
                # Navigate our current tab to the new URL
                await page.goto(detail_url, timeout=NAV_TIMEOUT, wait_until="networkidle")
                return True
                
    except PlaywrightTimeoutError:
        pass # It's okay if it times out, maybe we are already on the detail page
    except Exception as exc:
        log.debug("Error handling detail button: %s", exc)
        
    return False

# ── Detail page – extract metadata + lyrics ───────────────────────────────────

def _text(val: Optional[str]) -> str:
    """Normalize extracted text; return '-' for None/empty."""
    if val is None:
        return "-"
    val = val.strip()
    return val if val else "-"


async def extract_detail(page: Page) -> dict:
    """
    Parse the detail page and return a song dict.
    Specifically designed for the vintage table layout and font tags used on repertukul.com.
    """
    song: dict = {
        "song_title":    "-",
        "repertuar_no":  "-",
        "yoresi_ili":    "-",
        "ilcesi_koyu":   "-",
        "kaynak_kisi":   "-",
        "derleyen":      "-",
        "notaya_alan":   "-",
        "icra_eden":     "-",
        "makamsal_dizi": "-",
        "konusu_turu":   "-",
        "karar_sesi":    "-",
        "bitis_sesi":    "-",
        "usul":          "-",
        "en_pes_ses":    "-",
        "en_tiz_ses":    "-",
        "ses_genisligi": "-",
        "lyrics":        "-",
    }

    # --- 1. Extract Song Title ---
    # The title is usually in a bold font tag with class 'normalbuyukbaslik' inside 'tcerceve1'
    try:
        title_el = await page.query_selector("#tcerceve1 font.normalbuyukbaslik b, #tcerceve1 b font.normalbuyukbaslik")
        if title_el:
            t = _text(await title_el.inner_text())
            if t and t != "-":
                song["song_title"] = t
    except Exception as exc:
        log.debug("Error extracting song title: %s", exc)

    # --- 2. Extract Metadata Table ---
    # The metadata is in a layout table where the left <td> has the label and the right <td> has the value.
    LABEL_MAP = {
        "repertuar":        "repertuar_no",
        "yöresi":           "yoresi_ili",
        "ili":              "yoresi_ili",
        "ilçesi":           "ilcesi_koyu",
        "köyü":             "ilcesi_koyu",
        "kaynak":           "kaynak_kisi",
        "derleyen":         "derleyen",
        "notaya":           "notaya_alan",
        "icra":             "icra_eden",
        "makam":            "makamsal_dizi",
        "dizi":             "makamsal_dizi",
        "konu":             "konusu_turu",
        "tür":              "konusu_turu",
        "karar":            "karar_sesi",
        "bitiş":            "bitis_sesi",
        "usul":             "usul",
        "pes":              "en_pes_ses",
        "tiz":              "en_tiz_ses",
        "genişlik":         "ses_genisligi",
        "genişliği":        "ses_genisligi",
    }

    try:
        # Find all table rows inside the specific container div
        rows = await page.query_selector_all("#tcerceve1 table tr")
        for row in rows:
            cells = await row.query_selector_all("td")
            # We expect at least 3 cells (padding, label, value) based on the HTML
            if len(cells) >= 3:
                # The label is usually in the second cell
                label_text = _text(await cells[1].inner_text()).lower()
                # The value is usually in the third cell
                value_text = _text(await cells[2].inner_text())
                
                # Strip out any trailing non-breaking spaces or weird characters
                value_text = value_text.replace('\xa0', ' ').strip()

                for keyword, field in LABEL_MAP.items():
                    if keyword in label_text:
                        # Only set it if it's not empty and hasn't been set yet
                        if value_text and song[field] == "-":   
                            song[field] = value_text
                        break
    except Exception as exc:
        log.debug("Error extracting metadata table: %s", exc)

    # --- 3. Extract Lyrics ---
    # The lyrics are usually in a <font class="normalkucuk"> directly following the "TÜRKÜNÜN SÖZLERİ" header.
    try:
        # We look for the container div first
        container = await page.query_selector("#tcerceve2")
        if container:
            # Grab all inner text from the container
            full_text = await container.inner_text()
            
            # Split the text by the header to isolate the lyrics
            if "TÜRKÜNÜN SÖZLERİ" in full_text:
                lyrics_part = full_text.split("TÜRKÜNÜN SÖZLERİ")[1]
                
                # Clean up the lyrics text
                cleaned_lyrics = lyrics_part.strip()
                if cleaned_lyrics:
                    song["lyrics"] = cleaned_lyrics
    except Exception as exc:
        log.debug("Error extracting lyrics: %s", exc)

    return song

# ── Scrape a single song (with retries) ───────────────────────────────────────

async def scrape_song(context: BrowserContext, url: str) -> Optional[dict]:
    """
    Open a new page, navigate through the two-step flow, extract data.
    Returns the song dict or None on unrecoverable failure.
    """
    for attempt in range(1, MAX_RETRIES + 1):
        page: Optional[Page] = None
        try:
            page = await context.new_page()
            # ── Step 1: load the intermediate song page ──────────────────────
            log.debug("GET %s (attempt %d)", url, attempt)
            await page.goto(url, timeout=NAV_TIMEOUT, wait_until="networkidle")

            # ── Step 2: click "TÜRKÜ DETAYINI GÖSTER" ────────────────────────
            found = await click_detail_button(page)
            if not found:
                # Maybe this page already IS the detail page (direct link)
                log.debug("Detail button not found at %s – treating as detail page", url)

            # ── Step 3: extract ───────────────────────────────────────────────
            song = await extract_detail(page)
            song["source_url"] = url
            return song

        except PlaywrightTimeoutError as exc:
            log.warning("Timeout on %s (attempt %d/%d): %s", url, attempt, MAX_RETRIES, exc)
        except Exception as exc:
            log.warning("Error on %s (attempt %d/%d): %s", url, attempt, MAX_RETRIES, exc)
        finally:
            if page and not page.is_closed():
                await page.close()

        if attempt < MAX_RETRIES:
            await asyncio.sleep(2 ** attempt)   # exponential back-off

    return None   # all retries exhausted

# ── Main orchestrator ─────────────────────────────────────────────────────────

async def main(limit: Optional[int] = None, concurrency: int = 1) -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Re-attach log file handler now that output dir exists
    for h in log.handlers:
        if isinstance(h, logging.FileHandler):
            h.close()
            log.removeHandler(h)
    log.addHandler(logging.FileHandler(OUTPUT_DIR / "scraper.log", encoding="utf-8"))

    done: set[str] = load_progress()
    log.info("Resuming: %d songs already scraped", len(done))

    async with async_playwright() as pw:
        browser: Browser = await pw.chromium.launch(
            headless=True,  # <-- Change this
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )

        # ── Collect links (uses its own context) ──────────────────────────────
        index_context: BrowserContext = await browser.new_context(
            locale="tr-TR",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
        )
        index_page: Page = await index_context.new_page()
        all_links = await collect_song_links(index_page)
        await index_context.close()

        if limit:
            all_links = all_links[:limit]

        todo = [u for u in all_links if u not in done]
        log.info("Songs to scrape: %d  (skipping %d already done)", len(todo), len(done))

        # ── Scraping contexts (one per concurrency slot) ──────────────────────
        semaphore = asyncio.Semaphore(concurrency)

        async def worker(url: str) -> None:
            async with semaphore:
                ctx: BrowserContext = await browser.new_context(
                    locale="tr-TR",
                    user_agent=(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/124.0.0.0 Safari/537.36"
                    ),
                )
                try:
                    song = await scrape_song(ctx, url)
                    if song:
                        append_song(song)
                        done.add(url)
                        save_progress(done)
                        log.info(
                            "✓ [%d/%d] %s",
                            len(done), len(all_links), song.get("song_title", url)
                        )
                    else:
                        log.error("✗ Failed after all retries: %s", url)
                        log_error(url, "all retries exhausted")
                finally:
                    await ctx.close()

                # Politeness delay (randomised)
                await asyncio.sleep(random.uniform(SLEEP_MIN, SLEEP_MAX))

        # Run workers
        tasks = [asyncio.create_task(worker(url)) for url in todo]
        await asyncio.gather(*tasks)

        await browser.close()

    # ── Merge JSON-Lines → final JSON array ───────────────────────────────────
    merge_jsonl_to_json()
    log.info("Done. Total scraped: %d / %d", len(done), len(all_links))

# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Repertukul folk-song scraper")
    parser.add_argument("--limit",       type=int, default=None, help="Max songs to scrape (dev mode)")
    parser.add_argument("--concurrency", type=int, default=1,    help="Parallel browser contexts (default 1)")
    args = parser.parse_args()
    asyncio.run(main(limit=args.limit, concurrency=args.concurrency))

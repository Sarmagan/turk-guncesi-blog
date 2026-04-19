"""
check_regions.py
────────────────
Reads songs.jsonl and reports which yoresi_ili values fall into
the "Diğer" bucket — i.e. not matched to any of the 81 provinces
or the named special regions (Rumeli, Kerkük, Azerbaycan).

Usage:
    python3 check_regions.py songs.jsonl
"""

import json, sys
from collections import Counter

# ── Same sets as app.js ──────────────────────────────────────────────────────

TURKISH_PROVINCES = {
    "ADANA","ADIYAMAN","AFYONKARAHİSAR","AFYON","AĞRI","AKSARAY","AMASYA","ANKARA",
    "ANTALYA","ARDAHAN","ARTVİN","AYDIN","BALIKESİR","BARTIN","BATMAN","BAYBURT",
    "BİLECİK","BİNGÖL","BİTLİS","BOLU","BURDUR","BURSA","ÇANAKKALE","ÇANKIRI",
    "ÇORUM","DENİZLİ","DİYARBAKIR","DÜZCE","EDİRNE","ELAZIĞ","ERZİNCAN",
    "ERZURUM","ESKİŞEHİR","GAZİANTEP","GİRESUN","GÜMÜŞHANE","HAKKARİ","HATAY","IĞDIR",
    "ISPARTA","İSTANBUL","İZMİR","KAHRAMANMARAŞ","K. MARAŞ","KARABÜK","KARAMAN","KARS",
    "KASTAMONU","KAYSERİ","KIRIKKALE","KIRKLARELİ","KIRŞEHİR","KİLİS","KOCAELİ","KONYA",
    "KÜTAHYA","MALATYA","MANİSA","MARDİN","MERSİN","MUĞLA","MUŞ","NEVŞEHİR","NİĞDE",
    "ORDU","OSMANİYE","RİZE","SAKARYA","SAMSUN","SİİRT","SİNOP","SİVAS","ŞANLIURFA",
    "ŞIRNAK","TEKİRDAĞ","TOKAT","TRABZON","TUNCELİ","UŞAK","VAN","YALOVA","YOZGAT","ZONGULDAK",
}

DATA_TO_PROVINCE = {
    "AFYON","AFYONKARAHİSAR","AFYONKARAHISAR",
    "MUS","MUŞ",
    "K. MARAŞ","K.MARAŞ","KAHRAMANMARAŞ","KAHRAMAN MARAŞ",
    "AGRI","AĞRI","IGDIR","IĞDIR","ELAZIG","ELAZIĞ",
    "NEVSEHIR","NEVŞEHİR","SANLIURFA","ŞANLIURFA",
    "DIYARBAKIR","DİYARBAKIR","SIRNAK","ŞIRNAK",
    "USAK","UŞAK","MUGLA","MUĞLA","KUTAHYA","KÜTAHYA",
    "ESKISEHIR","ESKİŞEHİR","TEKIRDAG","TEKİRDAĞ",
    "KIRKLARELI","KIRKLARELİ","KIRSEHIR","KIRŞEHİR",
    "KIRIKKALE","BALIKESIR","BALIKESİR",
    "CANAKKALE","ÇANAKKALE","CANKIRI","ÇANKIRI",
    "CORUM","ÇORUM","AYDIN","ADIYAMAN",
    "GUMUSHANE","GÜMÜŞHANE","NIGDE","NİĞDE",
    "BARTIN","DUZCE","DÜZCE","BINGOL","BİNGÖL",
    "ISTANBUL","İSTANBUL","IZMIR","İZMİR",
}

NAMED_REGIONS = {
    "RUMELİ","RUMELI",
    "KIRKÜK","KERKÜK","KERKUK",
    "AZERBAYCAN",
}

def classify(raw: str) -> str:
    norm = raw.strip().upper()
    if norm in DATA_TO_PROVINCE:
        return "province"
    if norm in TURKISH_PROVINCES:
        return "province"
    if norm in NAMED_REGIONS:
        return "named_region"
    return "diger"

# ── Main ─────────────────────────────────────────────────────────────────────

path = sys.argv[1] if len(sys.argv) > 1 else "songs.jsonl"

ungrouped: Counter = Counter()
total = 0

with open(path, encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            song = json.loads(line)
        except json.JSONDecodeError as e:
            print(f"  ⚠️  Bad JSON line: {e}")
            continue
        total += 1
        yoresi = (song.get("yoresi_ili") or "").strip()
        if classify(yoresi) == "diger":
            ungrouped[yoresi] += 1

print(f"\n📊 Total songs: {total}")
print(f"❓ Ungrouped yoresi_ili values: {len(ungrouped)} distinct, {sum(ungrouped.values())} songs\n")

if ungrouped:
    print(f"{'Yoresi İli':<35} {'Songs':>6}")
    print("─" * 43)
    for yoresi, count in sorted(ungrouped.items(), key=lambda x: -x[1]):
        print(f"  {yoresi:<33} {count:>6}")
else:
    print("✅ All songs are grouped — nothing falls into Diğer.")
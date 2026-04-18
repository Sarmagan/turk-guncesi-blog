# Türk Güncesi — Astro sitesi

[blog.turkguncesi.com](https://blog.turkguncesi.com) için Astro tabanlı, minimalist,
**tamamen statik** bir yayın. Tüm içerik (yazılar, şiirler, yazar listesi
ve görseller) depoya dahildir; derleme ya da çalışma zamanında hiçbir
harici API'ye (WordPress dâhil) bağlanmaz.

---

## İçindekiler

1. [Kurulum](#kurulum)
2. [Geliştirme](#geliştirme)
3. [Derleme ve önizleme](#derleme-ve-önizleme)
4. [Dağıtım](#dağıtım-netlify--vercel)
5. [Proje yapısı](#proje-yapısı)
6. [İçerik modeli](#içerik-modeli)
7. [Yeni yazı / şiir / sayfa ekleme](#yeni-yazı--şiir--sayfa-ekleme)
8. [WordPress'ten bir seferlik içerik taşıma](#wordpressten-bir-seferlik-içerik-taşıma)
9. [SEO, robots.txt, sitemap](#seo-robotstxt-sitemap)
10. [Güvenlik başlıkları](#güvenlik-başlıkları)
11. [Görsel optimizasyonu](#görsel-optimizasyonu)
12. [Katkı akışı](#katkı-akışı)

---

## Kurulum

Gereksinim: **Node.js 18.17+** (tercihen 20+).

```bash
git clone https://github.com/<organizasyon>/turkguncesi.git
cd turkguncesi
npm install
```

## Geliştirme

```bash
npm run dev
```

<http://localhost:4321> üzerinde açılır. Hot-reload aktiftir; içerik ya da
bileşen değiştirdiğinizde sayfa anında güncellenir.

## Derleme ve önizleme

```bash
npm run build     # dist/ altına statik siteyi üretir
npm run preview   # derlenen çıktıyı yerelde denemek için
```

Derleme tamamen yerel olduğundan internet bağlantısı gerektirmez ve tipik
olarak **bir saniyenin altında** tamamlanır.

## Dağıtım (Netlify / Vercel)

Proje saf bir `dist/` klasörü üretir — sunucusuz runtime veya SSR gerekmez.

### Netlify

1. Netlify'da GitHub repo'sunu bağlayın.
2. Build komutu: `npm run build`
3. Publish directory: `dist`
4. `public/_headers` otomatik okunur; güvenlik başlıkları uygulanır.

### Vercel

1. Repo'yu import edin; Astro otomatik algılanır.
2. Build komutu `npm run build`, output `dist`.
3. `vercel.json` güvenlik başlıklarını uygular.

## Proje yapısı

```
.
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── vercel.json
├── scripts/
│   ├── migrate-from-wp.mjs        # tek seferlik WP → yerel migrasyon
│   ├── normalize-content.mjs      # iç linkleri yerel URL'lere çevirir
│   └── optimize-images.mjs        # AVIF + WebP türevleri üretir
├── public/
│   ├── robots.txt
│   ├── _headers
│   ├── favicon.svg
│   ├── og-default.svg
│   └── media/<slug>/...            # migrasyonda indirilen görseller
└── src/
    ├── content.config.ts           # content collection şemaları (posts, poems)
    ├── data/
    │   └── image-manifest.json     # optimize-images tarafından üretilir
    ├── content/
    │   ├── authors.json            # yazar kayıtları
    │   ├── posts/<slug>.json       # her yazı = bir JSON
    │   └── poems/<slug>.md         # her şiir = bir markdown dosyası
    ├── styles/global.css
    ├── layouts/BaseLayout.astro
    ├── components/
    │   ├── Header.astro
    │   ├── Footer.astro
    │   ├── SocialIcons.astro
    │   ├── ThemeToggle.astro
    │   ├── PostCard.astro
    │   ├── Picture.astro           # AVIF/WebP <picture> sarıcı
    │   └── SEO.astro
    ├── lib/
    │   ├── config.ts               # site adı, nav, sosyal linkler
    │   └── content.ts              # koleksiyonlardan okuyan yardımcılar
    └── pages/
        ├── index.astro                      # /
        ├── tum-yazilar/index.astro          # /tum-yazilar/
        ├── siirler/index.astro              # /siirler/
        ├── siirler/[slug].astro             # /siirler/<slug>
        ├── tum-yazilar/index.astro          # /tum-yazilar/ (arşiv)
        ├── tum-yazilar/[slug].astro         # /tum-yazilar/<slug> (yazı + dizi sayfası)
        ├── hakkimizda/index.astro
        ├── yazarlar/index.astro
        ├── gizlilik-politikasi/index.astro
        ├── cerez-politikasi/index.astro
        ├── 404.astro
        └── rss.xml.ts                       # /rss.xml feed
```

## İçerik modeli

Astro **Content Collections** kullanıyoruz. Şemalar `src/content.config.ts`
içinde Zod ile tanımlanmıştır.

- **posts** — WordPress'ten getirilen HTML yazılar. Her yazı
  `src/content/posts/<slug>.json` dosyasıdır; alanlar: `title`, `date`,
  `author`, `categories`, `excerpt`, `featuredImage`, `content` (HTML).
- **poems** — markdown olarak yazılan şiirler
  (`src/content/poems/<slug>.md`). Satır sonları korunur (CSS tarafında
  `white-space: pre-line`), böylece dize yapısı bozulmaz.
- **authors** — `src/content/authors.json`. `/yazarlar/` burada listelenir.

Pages bu koleksiyonlara yalnızca `src/lib/content.ts` üzerinden erişir; yeni
bir veri kaynağına geçmek isterseniz değişiklik yalnızca bu dosyada gerekir.

## Yeni yazı / şiir / sayfa ekleme

### Yeni yazı

1. `src/content/posts/<slug>.json` oluşturun. Minimal örnek:

   ```json
   {
     "slug": "yeni-yazim",
     "title": "Yeni Yazım",
     "date": "2026-04-17T10:00:00Z",
     "author": { "name": "İsim Soyad" },
     "categories": [{ "name": "Uncategorized", "slug": "uncategorized" }],
     "excerpt": "Kısa giriş…",
     "featuredImage": null,
     "featuredImageAlt": "",
     "content": "<p>Yazı gövdesi HTML olarak buraya…</p>"
   }
   ```

2. Görsel kullanacaksanız `public/media/<slug>/kapak.jpg` gibi bir yola
   ekleyip `featuredImage` değerini `"/media/<slug>/kapak.jpg"` yapın.
3. `npm run dev` ile sayfayı `/tum-yazilar/<slug>` yolunda görebilirsiniz.

### Yeni şiir

1. `src/content/poems/<slug>.md` oluşturun:

   ```md
   ---
   title: "Şiir Adı"
   author: "Yazarı"
   order: 6
   excerpt: "İlk birkaç dize…"
   ---

   Birinci dize
   İkinci dize
   Üçüncü dize

   Yeni kıta başlar…
   ```

2. `order` değeri küçük olan şiirler `/siirler/` listesinde üstte görünür.
3. Sayfa otomatik olarak `/siirler/<slug>` yolunda yayımlanır.

### Yeni statik sayfa

`src/pages/<yeni-yol>/index.astro` oluşturun:

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
---
<BaseLayout title="Sayfa Başlığı" description="Kısa açıklama">
  <header class="page-header">
    <span class="page-header__kicker">Bölüm</span>
    <h1>Sayfa Başlığı</h1>
  </header>
  <article class="post-body">
    <p>İçerik…</p>
  </article>
</BaseLayout>
```

Navigasyonda görünmesini istiyorsanız `src/lib/config.ts` içindeki
`NAV_LINKS` dizisine ekleyin.

## WordPress'ten bir seferlik içerik taşıma

Depoda hâlihazırda 29 taşınmış yazı ve 145 görsel bulunuyor. İçerikler,
daha önce `blog.turkguncesi.com` üzerinde yayımlanan WordPress kurulumundan
tek seferde alınmıştır; yeni Astro sitesi aynı alan adında bu eski WordPress
kurulumunun yerini alacaktır.

Cutover öncesinde taze bir WordPress dışa aktarımı yapmak isterseniz
(WordPress henüz aynı alan adında çalışırken) aşağıdaki komut kullanılır:

```bash
npm run migrate
```

Bu komut:

1. `https://blog.turkguncesi.com/wp-json/wp/v2/posts` üzerinden tüm yazıları
   çeker (tekrar denemeler + exponential backoff ile).
2. Öne çıkan ve gövde içi görselleri `public/media/<slug>/` altına indirir.
3. Gövde içindeki WordPress URL'lerini yerel yollarla değiştirir.
4. Sonuçları `src/content/posts/<slug>.json` olarak yazar.
5. Yazar listesini `src/content/authors.json`'a günceller.

> **Not:** Yeni Astro sitesi devreye alındığında (DNS `blog.turkguncesi.com`
> artık Vercel/Netlify'a yönlenince) bu alan adı REST API üretmeyeceği için
> `npm run migrate` artık çalışmaz. Tazeleme gerekiyorsa DNS değişiminden
> önce yapılmalıdır.

İkinci bir komut:

```bash
npm run normalize
```

var olan JSON dosyalarındaki iç linkleri yeniden yerel hale getirir (WP
dışarı aktarmadan içerik elle yapıştırdığınızda faydalı).

> **Not:** Yeni site yazı permalink yapısını eski WordPress düzeniyle
> aynı tutar (`/tum-yazilar/<slug>/`); yeni site aynı alan adında
> (`blog.turkguncesi.com`) yayımlanacağı için indekslenmiş mevcut bağlantılar
> ek bir yönlendirmeye gerek kalmadan doğrudan çalışmaya devam eder.

## SEO, robots.txt, sitemap

- `public/robots.txt` — tüm botlara açık + sitemap referansı.
- `sitemap-index.xml` — `@astrojs/sitemap` tarafından tüm yayımlanan
  sayfaları (yazı, şiir, sabit sayfa) içerecek şekilde otomatik üretilir.
- Her sayfa `title`, `description`, `og:*`, `twitter:*`, `canonical`
  bilgilerini `src/components/SEO.astro` üzerinden alır. Post sayfalarında
  `og:type=article` + `article:published_time` ayarlanır.

## Güvenlik başlıkları

Netlify ve Vercel için eşdeğer yapılandırmalar:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

Netlify: `public/_headers` · Vercel: `vercel.json`.

## Görsel optimizasyonu

Her derleme, `public/` altındaki raster görsellerin (`.jpg`, `.jpeg`,
`.png`, `.webp`) yanına otomatik olarak AVIF ve WebP sürümleri üretir
ve `src/data/image-manifest.json` dosyasına boyut + yol bilgisi yazar.
Tipik olarak orijinal JPG/PNG bayt ağırlığı **%75–%80** azalır
(örn. 53 MiB kaynak → 10 MiB AVIF).

Akış:

1. `scripts/optimize-images.mjs` (sharp tabanlı) tüm kaynakları gezer ve
   her biri için `foo.jpg.avif` + `foo.jpg.webp` türevlerini oluşturur
   (maksimum 1920 piksel uzun kenar, büyütmez). İnkremental çalışır;
   ikinci koşu yalnızca yeni/değişmiş dosyaları işler.
2. `npm run build` ve `npm run dev` otomatik olarak `prebuild` /
   `predev` olarak bu scripti çağırır.
3. `.astro` sayfalarındaki görseller için `src/components/Picture.astro`
   bileşeni kullanılır; bu bileşen manifestoyu okuyarak `<picture>`
   içine AVIF + WebP `<source>` etiketleri yerleştirir, orijinali
   fallback olarak bırakır. `width`/`height` manifestodan otomatik
   yüklenir — CLS=0.
4. WordPress'ten taşınmış yazılarda `<img>` olarak gömülü görseller
   `enhancePostHtml` yardımcısı tarafından aynı `<picture>` yapısına
   sarılır; ayrıca `loading="lazy"` + `decoding="async"` eklenir.

Türev dosyalar `.gitignore` ile takip dışı bırakılır — deploy eden
sunucu (Vercel/Netlify) her derlemede yeniden üretir. Manuel çalıştırma
için:

```bash
npm run optimize-images
```

## Katkı akışı

- Değişiklikler feature branch üzerinde PR ile yapılır.
- `main`'e merge sonrası Netlify/Vercel otomatik dağıtır.
- Metin düzeltmeleri için bile PR tercih edilir; böylece iki eş yazar
  gözden geçirme imkânı bulur.

---

© Türk Güncesi

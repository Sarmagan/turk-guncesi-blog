# Türkiye Türkü Haritası

Türkiye'nin 81 iline ait türküleri gösteren interaktif bir harita. [Türk Güncesi](https://blog.turkguncesi.com/) için geliştirilmiştir.

![Website](website_screenshot.png)

> 🇬🇧 [Read in English](README.md)

## Özellikler

### Harita & Gezinme
- **Üzerine gelme (tooltip)** — herhangi bir ilin üzerine gelince o ile ait türküler görünür
- **Tıklayarak sabitle** — bir ile tıklandığında türküler yan panelde kalıcı olarak listelenir
- **Yakınlaştır & kaydır** — mouse tekerleği ile yakınlaştırma (imleç merkezli), tıklayıp sürükleyerek kaydırma
- **Zoom kontrolleri** — `+`, `−` ve `Reset` butonlarıyla canlı ölçek göstergesi
- **Klavye navigasyonu** — ok tuşlarıyla iller arasında gezinme, `Enter` ile seçme, `Escape` ile kapatma; modal açıkken `←` / `→` ile türküler arasında geçiş
- **Mobil destek** — iki parmakla yakınlaştırma, tek parmakla kaydırma ve küçük ekranlarda alt panel çekmecesi

### Türkü Keşfi
- **Günün Türküsü** — haritanın sol üst köşesinde küçük bir kart olarak gösterilir; türkü, bugünün tarihi veritabanı üzerinden deterministik olarak seçilir; her ziyaretçi aynı günde aynı türküyü görür ve gece yarısı otomatik olarak değişir
- **Rastgele türkü** — tüm veritabanından rastgele bir türkü seçer ve ilgili ili haritada vurgular
- **Bölgeden rastgele** — bir il veya bölge paneli açıkken görünen 🎲 Rastgele butonu, yalnızca o panelin listesinden rastgele bir türkü seçer
- **Ekstra bölgeler** — Rumeli, Kerkük, Azerbaycan, Kıbrıs, Musul ve Kırım türküleri için ayrı butonlar
- **Diğer kategorisi** — Yöre bilgisi olmayan veya hangi yöreye ait olduğu net olmayan türküler burada toplanır

### Türkü Modalı
- **Detay görünümü** — türkü kartına tıklandığında açılır; müzikal özellikler, ses aralığı, kişiler (kaynak, derleyen, icra eden) ve sözler gösterilir
- **Önceki / Sonraki gezinme** — modalın yanındaki ok butonları (masaüstü) ve yatay kaydırma hareketi (mobil) ile aktif il, bölge veya arama sonuçlarındaki türküler arasında gezinme; konum sayacı gösterilir (örn. `3 / 47`)
- **Bağlantı kopyala** — modal altbilgisindeki 🔗 Bağlantı butonu, mevcut türkünün derin bağlantı URL'sini panoya kopyalar; kısa süre `Kopyalandı ✓` olarak değişir
- **Paylaşım kartı** — sosyal medya için (Instagram, WhatsApp vb.) 1080×1080 görsel kartı oluşturur
- **Derin bağlantılar** — her türküye sabit bir URL linki atanır (`#song-1234`), paylaşılabilir ve sayfa yüklendiğinde geri yüklenir

### Arama & Filtreleme
- **Arama** — türkü adı, kaynak kişi, derleyen veya icra edene göre kapsam seçerek arama
- **Filtreler** — makam/dizi, konu/tür ve usul için açılır filtreler; metin aramasıyla birleştirilebilir

### Görünüm Seçenekleri
- **Açık / koyu tema** — başlıkta tema geçiş butonu, `localStorage` ile hatırlanır
- **İl etiketleri** — harita üzerindeki şehir adı etiketleri açılıp kapatılabilir
- **Yoğunluk haritası (choropleth)** — illeri türkü yoğunluğuna göre renklendirir (5 kademe)
- **Veri bazlı vurgu** — türküsü olan iller, boş illerden görsel olarak ayrıştırılır

### Diğer
- **Türkü Öner** — haritanın sağ alt köşesindeki ✉ bağlantısı, `turkguncesi1923@gmail.com` adresine önceden doldurulmuş bir Gmail penceresi açar; ziyaretçiler eksik türküleri önerebilir
- **Favicon** — Türk Güncesi logosu tarayıcı sekmesinde görünür; ekstra dosya gerektirmeden base64 veri URI olarak yerleştirilmiştir
- **Tanıtım turu** — ilk ziyaretçilere temel özellikleri anlatan adım adım bir tur gösterilir

## Dosya Yapısı

```
index.html      # Ana sayfa — SVG harita satır içi gömülü, favicon base64 olarak gömülü
styles.css      # Tüm stiller ve tema değişkenleri (koyu + açık mod)
app.js          # Etkileşim: hover, tooltip, zoom, pan, arama, modal, derin bağlantılar
songs.jsonl     # Türkü veritabanı — her satır bir JSON nesnesi (JSONL formatı)
```

## Türkü Ekleme

`songs.jsonl` dosyasına yeni satırlar ekleyin. Her satır bağımsız bir JSON nesnesidir:

```jsonl
{"song_title": "Karamana Giderim", "yoresi_ili": "KONYA", "repertuar_no": "1234", "ilcesi_koyu": "-", "kaynak_kisi": "...", "derleyen": "...", "notaya_alan": "...", "icra_eden": "-", "makamsal_dizi": "...", "konusu_turu": "Aşk Sevda", "karar_sesi": "Re", "bitis_sesi": "Re", "usul": "-", "en_pes_ses": "Re", "en_tiz_ses": "La", "ses_genisligi": "5 Ses", "lyrics": "Dize 1\nDize 2", "source_url": "https://..."}
```

Türküler `yoresi_ili` alanına göre gruplanır. Alan büyük/küçük harf duyarsızdır ve pek çok ASCII/alternatif yazımı destekler (örn. `SANLIURFA` → Şanlıurfa, `AFYON` → Afyonkarahisar). `yoresi_ili` değeri Türkiye'nin 81 ilinden biriyle eşleşmeyen girişler otomatik olarak ilgili ekstra bölgeye (Rumeli, Kerkük, Azerbaycan, Kıbrıs, Musul, Kırım) ya da genel **Diğer** kategorisine yerleştirilir.

## Yerel Olarak Çalıştırma

`songs.jsonl` dosyasının doğru yüklenmesi için `index.html` dosyasını bir yerel sunucu üzerinden açın:

```bash
npx serve .
# veya
python3 -m http.server
```

> **Not:** Sahte/yedek veri yoktur. Harita, `songs.jsonl` dosyasının `index.html` ile aynı klasörde sunulmasını gerektirir. `file://` üzerinden açmak çalışmaz — yerel sunucu kullanın.

## Veri Kaynağı

Tüm türkü verileri **[Repertükül](https://www.repertukul.com/)** — Türk halk müziğinin kapsamlı arşivi — kaynağından alınmaktadır. Repertükül'e bu değerli çalışma için teşekkür ediyoruz.

## Teknoloji

- HTML5 / CSS3 / Vanilla JavaScript (ES6+)
- Harici kütüphane veya framework kullanılmamıştır
- SVG harita © [Simplemaps.com](https://simplemaps.com) (ticari kullanım için ücretsiz)
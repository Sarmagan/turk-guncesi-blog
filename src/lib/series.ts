/**
 * Editorial "yazı dizisi" (article series) definitions.
 *
 * A series bundles together existing posts (by slug) in a deliberate
 * reading order, with editor-written blurbs per entry. Posts themselves
 * live unchanged in the content collection; this module only adds a
 * curated overlay on top of them.
 */

export interface SeriesEntry {
  /** 1-based order inside the series. */
  order: number;
  /** Slug of an existing post in src/content/posts/. */
  slug: string;
  /** Short label shown on the series page (optional override). */
  label?: string;
  /** Editor-written teaser shown on the series page. */
  blurb: string;
  /** Image path (under /media/<series-slug>/) for the entry row. */
  image: string;
  imageAlt?: string;
}

export interface SeriesHero {
  /** Background image path for the full-bleed hero cover. */
  image: string;
  /** Attribution caption shown in the top-right of the hero. */
  credit?: string;
  /** Big headline displayed on top of the hero. */
  headline: string;
}

export interface SeriesQuote {
  /** Small circular portrait above the quote. */
  image?: string;
  imageAlt?: string;
  text: string;
  cite?: string;
  citeRole?: string;
}

export interface SeriesIntro {
  title: string;
  /** Two (or more) paragraph columns rendered under the "Giriş" heading. */
  paragraphs: string[];
}

export interface Series {
  slug: string;
  /** Short kicker shown above the title (e.g. "Türk Güncesi Özel"). */
  kicker: string;
  title: string;
  description: string;
  hero?: SeriesHero;
  quote?: SeriesQuote;
  intro?: SeriesIntro;
  outro?: SeriesIntro;
  entries: SeriesEntry[];
}

const BASE = '/media/anadolunun-turklesmesi';

export const SERIES: Series[] = [
  {
    slug: 'anadolunun-turklesmesi',
    kicker: 'Türk Güncesi Özel',
    title: 'Anadolu’nun Türkleşmesi Yazı Dizisi',
    description:
      'Anadolu’nun Türk ve Müslüman kimliğini kazanma sürecini derinlemesine inceliyoruz. Tarihin tozlu sayfalarını aralayıp Oğuz boylarından Haçlı Seferlerine, Babailer İsyanı’ndan Türk beyliklerine kadar her ayrıntıyı sizlerle buluşturuyoruz!',
    hero: {
      image: `${BASE}/sivas-gok-medrese.jpg`,
      credit: 'Gök Medrese, Sivas',
      headline: '“Bir milletin yurt tutma hikayesi”',
    },
    quote: {
      text: '“Bu göklerden gelen ilahi bir dilektir\nAnadolu’nun Türkiye olması felektir”',
      cite: 'Süleyman Armağan Er',
      citeRole: 'Kurucu',
    },
    intro: {
      title: 'Giriş',
      paragraphs: [
        'Anadolu’nun Türkleşmesi, sadece demografik bir değişim değil, aynı zamanda kültürel ve sosyal dönüşümlerin yaşandığı karmaşık bir süreçtir. Orta Asya’nın uçsuz bucaksız steplerinden başlayan Türk göçleri, yüzyıllar boyunca süren mücadeleler ve fetihlerle Anadolu’ya ulaşmıştır. Orta Asya’daki karışıklıklar, iklim değişiklikleri ve siyasi çatışmalar, Türk boylarını batıya göçe zorlamıştır. Göktürkler ve Uygurlar gibi güçlü devletlerin yıkılması ve Moğol işgali, büyük göç dalgalarına yol açmıştır. Bu göç dalgaları, Orta Asya’dan Hazar Denizi’nin doğusuna, Maveraünnehir’e, Horasan’a ve nihayetinde Azerbaycan ve Anadolu’ya kadar uzanmıştır. Anadolu’ya ilk Oğuz akınları, Selçuklu Devleti döneminde başlamış ve bu akınlar Malazgirt Savaşı ile doruğa ulaşmıştır.',
        'Sultan Alparslan’ın 1071 yılında Bizans İmparatoru Romanos Diogenes’e karşı kazandığı Malazgirt Savaşı, Anadolu’nun kapılarını Türklere açmıştır. Bu zafer, Anadolu’nun Türkleşme sürecinin hızlanmasına neden olmuştur. Türklerin, Anadolu’ya yerleşmesi ve bu toprakları yurt edinmesi, Bizans’ın askeri direncinin kırılmasıyla mümkün olmuştur. Anadolu’nun Türkleşmesi, sadece askeri zaferlerle sınırlı kalmamış, aynı zamanda kültürel ve sosyal değişimleri de beraberinde getirmiştir. Anadolu Selçuklu Devleti ve beylikler döneminde Türkler, geldikleri topraklardaki göçebe yaşam tarzlarını Anadolu’ya taşımışlar ve Anadolu’yu baştan aşağı imar etmişlerdir. Selçuklular, Anadolu’da güçlü bir devlet yapısı kurarak, Türk kültürünü ve İslam dinini bu topraklara yaymışlardır.',
      ],
    },
    outro: {
      title: 'Sonuç',
      paragraphs: [
        'Anadolu’nun Türkleşmesi ve Müslümanlaşma süreci, Selçuklu Devleti’nin yıkılmasıyla sona ermemiş, aksine Osmanlı Devleti ile devam etmiştir. Osmanlılar, Anadolu’yu fethederek burada güçlü bir imparatorluk kurmuşlar ve bu toprakları İslam dünyasının en önemli merkezlerinden biri haline getirmişlerdir. Osmanlı İmparatorluğu dönemi, Anadolu’nun Türkleşmesinin ve İslamlaşmasının zirve noktası olmuştur. Türklerin, Anadolu’ya getirdiği kültürel değerler, inşa ettikleri mimari eserler ve sosyal yapılar, bu toprakların kimliğini derinden etkilemiştir. Anadolu’nun dört bir yanına yayılan Selçuklu ve Osmanlı mimarisi, günümüzde hala ayakta durmakta ve bu kültürel mirası yaşatmaktadır. Ayrıca, Türk dilinin ve kültürünün Anadolu’da kökleşmesi, bu toprakların Türklüğünü pekiştirmiştir.',
        'Anadolu’nun Türkleşme süreci, sadece bir milletin göç hikayesi değil, aynı zamanda bir medeniyetin inşa sürecidir. Türkler, bu topraklarda sadece yeni bir yurt edinmekle kalmamış, aynı zamanda burada yeni bir medeniyet kurmuşlardır. Bu süreçte yaşanan mücadeleler, zaferler ve kayıplar, Türk tarihinin en önemli dönüm noktalarından biridir. Sonuç olarak, Anadolu’nun Türkleşme süreci, tarihin akışını değiştiren büyük bir dönüşüm olmuştur. Orta Asya’dan başlayan bu yolculuk, Anadolu’da sona ermiş ve burada yeni bir Türk yurdu kurulmuştur. Bu süreç, Türk milletinin tarihindeki en önemli olaylardan biri olarak, günümüzde de etkisini sürdürmektedir. Bu topraklar, binlerce yıllık Türk kültürünün ve tarihinin bir parçası olarak, Türk milletinin hafızasında ve kimliğinde silinmez izler bırakmıştır.',
      ],
    },
    entries: [
      {
        order: 1,
        slug: 'altaylardan-tunaya-cihangir-bir-turk-toplulugu-oguzlar',
        label: 'Altaylardan Tuna’ya Cihangir Bir Türk Topluluğu: Oğuzlar',
        blurb:
          'Altaylardan Tuna’ya uzanan Oğuzların bin yıllık serüveni: Orta Asya bozkırlarından Akdeniz kıyılarına göç eden, kültürünü ve kimliğini koruyarak Anadolu’yu Türk yurdu yapan cihangir bir Türk boyunun hikayesi.',
        image: `${BASE}/oguz-turkleri.jpeg`,
        imageAlt: 'Balıkesir yöresi Yörük köyleri geleneksel kıyafetleri',
      },
      {
        order: 2,
        slug: 'kilit-buyuk-selcuklu-devleti',
        label: 'Kilit: Büyük Selçuklu Devleti',
        blurb:
          'Oğuzların Kınık boyundan gelen Selçukluların Horasan’dan Anadolu’ya uzanan destanı: 1040 Dandanakan Zaferi’yle kurulan Büyük Selçuklu Devleti, Türkmen göçleri ve Anadolu’nun Türkleşmesinde kilit bir rol oynayarak, Türk-İslam dünyasının kaderini şekillendiriyor.',
        image: `${BASE}/selcuklu-arma.png`,
        imageAlt: 'Selçuklu arması',
      },
      {
        order: 3,
        slug: 'acilan-kapilar-pasinler-ve-malazgirt-savaslari',
        label: 'Açılan Kapılar: Pasinler ve Malazgirt Savaşları',
        blurb:
          'Pasinler’den Malazgirt’e uzanan zafer yolculuğu: Sultan Alparslan’ın komutasındaki Selçuklular, Bizans’a karşı kazandıkları Malazgirt Zaferi ile Anadolu’nun kapılarını Türklere açarak, bu toprakları bir Türk yurdu haline getiren süreci başlatıyor.',
        image: `${BASE}/malazgirt-savasi.jpg`,
        imageAlt: 'Malazgirt Savaşı’nı temsil eden bir resim',
      },
      {
        order: 4,
        slug: 'diyar-i-rumdan-turkiyeye-i-anadolu-selcuklu-devleti-ve-hacli-seferleri',
        label:
          'Diyar-ı Rum’dan Türkiye’ye I: Anadolu Selçuklu Devleti ve Haçlı Seferleri',
        blurb:
          'Diyar-ı Rum’dan Türkiye’ye uzanan yolculuk: Anadolu Selçukluları, Haçlı Seferlerine karşı dimdik durarak Anadolu’nun Türk yurdu olmasını sağlıyor ve Türklüğü bu topraklara kök salan bir medeniyete dönüştürüyor.',
        image: `${BASE}/1101-anadolu-hacli-seferi.png`,
        imageAlt: '1101 yılında Anadolu’nun siyasi durumu ve Haçlı seferi',
      },
      {
        order: 5,
        slug: 'diyar-i-rumdan-turkiyeye-ii-anadolu-selcuklu-devleti-ve-hacli-seferleri',
        label:
          'Diyar-ı Rum’dan Türkiye’ye II: Anadolu Selçuklu Devleti ve Haçlı Seferleri',
        blurb:
          'Miryokefalon’dan Haçlı Seferlerine direniş: Anadolu Selçukluları, Bizans’ı Anadolu’dan çıkararak Türk hakimiyetini pekiştiriyor ve Anadolu’da birliğin temellerini atıyor.',
        image: `${BASE}/haclilarin-konstantinopolise-girisi.jpg`,
        imageAlt: 'Haçlıların Konstantinopolis’e girişi',
      },
      {
        order: 6,
        slug: 'anadoluyu-yakan-ates-babailer-isyani',
        label: 'Anadolu’yu Yakan Ateş: Babailer İsyanı',
        blurb:
          'Göçebe Türkmenlerin devlet düzenine başkaldırısı Anadolu’yu kasıp kavuruyor, Selçuklu otoritesini sarsıyor ve büyük bir kırılma dönemine yol açıyor.',
        image: `${BASE}/baba-ishak.webp`,
        imageAlt: 'Baba İshak tasviri',
      },
      {
        order: 7,
        slug: 'yarim-asir-suren-kabus-kosedag-savasi-ve-mogol-istilasi',
        label: 'Yarım Asır Süren Kabus: Kösedağ Savaşı ve Moğol İstilası',
        blurb:
          'Kösedağ’dan Moğol istilasına Anadolu’nun kara günleri: Selçukluların Moğollara boyun eğdiği bu dönemde, Türk kimliği tasavvuf erenleri ve Türkmen beyleriyle ayakta kalmayı başarıyor.',
        image: `${BASE}/kosedag-savasi.jpeg`,
        imageAlt: 'Kösedağ Savaşı (1243)',
      },
      {
        order: 8,
        slug: 'yeniden-gelen-bahar-ikinci-beylikler-doneminin-anadolunun-turklesmesine-etkisi',
        label:
          'Yeniden Gelen Bahar: İkinci Beylikler Döneminin Anadolu’nun Türkleşmesine Etkisi',
        blurb:
          'Moğol istilasıyla sarsılan Anadolu’da Beylikler dönemi bir bahar gibi yeşeriyor; Türkçe, mimari ve sanat yeniden canlanıyor, Anadolu’nun Türkleşmesi kök salıyor.',
        image: `${BASE}/anatolian-beyliks-catalan-atlas-1375.jpg`,
        imageAlt: 'Catalan Atlas (1375) — Anadolu Beylikleri',
      },
      {
        order: 9,
        slug: 'mistik-ruzgarlar-i-tasavvuf-akimlarinin-anadolunun-turklesmesi-ve-muslumanlasmasina-etkisi',
        label:
          'Mistik Rüzgarlar I: Tasavvuf Akımlarının Anadolu’nun Türkleşmesi ve Müslümanlaşmasına Etkisi',
        blurb:
          'Horasan erenleri ve tasavvuf akımları, Anadolu’nun kalbini fethediyor; göçebe Türkmenlerle birlikte İslam’ı ve Türk kültürünü Anadolu’nun en ücra köşelerine taşıyor.',
        image: `${BASE}/ahmad-yasawi.png`,
        imageAlt: 'Ahmed Yesevî minyatürü',
      },
      {
        order: 10,
        slug: 'mistik-ruzgarlar-ii-tasavvuf-akimlarinin-anadolunun-turklesmesi-ve-muslumanlasmasina-etkisi',
        label:
          'Mistik Rüzgarlar II: Tasavvuf Akımlarının Anadolu’nun Türkleşmesi ve Müslümanlaşmasına Etkisi',
        blurb:
          'Hacı Bektaş Veli’den Yunus Emre’ye, Ahilikten Vefâiyye’ye uzanan mistik rüzgarlar, Anadolu’da Türk-İslam kimliğini şekillendiriyor ve toplumu bir arada tutuyor.',
        image: `${BASE}/yunus-emre.jpg`,
        imageAlt: 'Yunus Emre tasviri',
      },
    ],
  },
];

export function getAllSeries(): Series[] {
  return SERIES;
}

export function getSeriesBySlug(slug: string): Series | null {
  return SERIES.find((s) => s.slug === slug) ?? null;
}

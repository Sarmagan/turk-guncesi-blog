/**
 * Site-wide configuration.
 * Change these values to rebrand the site or repoint the content source.
 */

export const SITE = {
  name: 'Türk Güncesi',
  tagline: 'Türk kültürü, edebiyatı ve şiiri üzerine güncel',
  description:
    'Türk Güncesi — Türk kültürü, edebiyatı, tarihi ve şiiri üzerine özgün yazılar ve güncel değerlendirmeler.',
  url: 'https://blog.turkguncesi.com',
  locale: 'tr-TR',
  defaultOgImage: '/og-default.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  contactEmail: 'turkguncesi1923@gmail.com',
} as const;

export const NAV_LINKS = [
  { href: '/tum-yazilar/', label: 'Tüm Yazılar' },
  { href: '/siirler/', label: 'Şiirler' },
  { href: '/hakkimizda/', label: 'Hakkımızda' },
  { href: '/yazarlar/', label: 'Yazarlar' },
] as const;

export const SOCIAL_LINKS = {
  mainSite: 'https://turkguncesi.com/',
  instagram: 'https://www.instagram.com/turkguncesi/',
  x: 'https://x.com/turkguncesi',
  bluesky: 'https://bsky.app/profile/turkguncesi.com',
  youtube: 'https://www.youtube.com/@turkguncesi',
} as const;

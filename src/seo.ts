// Metadados que vão no <head>: Open Graph e JSON-LD de LocalBusiness, montados a partir do conteúdo.
import type { Content } from './content/default';
import { esc } from './sections/html';

const fact = (c: Content, key: string): string => c.about.facts.find((f) => f.k.toLowerCase() === key)?.v ?? '';

/** `siteUrl` é o endereço público do site (variável SITE_URL), quando conhecido; sem ele os links ficam relativos. */
export function headTags(c: Content, siteUrl = ''): string {
  const base = siteUrl.replace(/\/$/, '');
  const title = `${c.brand.name} ${c.brand.tag} | Foz do Iguaçu`;
  const phone = c.contact.phone.replace(/\D/g, '');
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org', '@type': 'LocalBusiness',
    name: fact(c, 'razão social') || `${c.brand.name} ${c.brand.tag}`,
    description: c.hero.sub,
    address: { '@type': 'PostalAddress', streetAddress: c.contact.address, addressLocality: 'Foz do Iguaçu', addressRegion: 'PR', addressCountry: 'BR' },
    areaServed: ['Foz do Iguaçu', 'Paraguai', 'Argentina'],
  };
  if (phone) ld.telephone = '+55' + phone;
  if (c.contact.email) ld.email = c.contact.email;
  if (fact(c, 'cnpj')) ld.taxID = fact(c, 'cnpj');
  if (c.contact.hours) ld.openingHours = c.contact.hours;
  if (base) { ld.url = base + '/'; ld.image = base + '/og.jpg'; ld.logo = base + '/logo.png'; }
  const json = JSON.stringify(ld).replace(/</g, '\\u003c');
  return [
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="pt_BR">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(c.hero.sub)}">`,
    `<meta property="og:image" content="${esc(base ? base + '/og.jpg' : 'og.jpg')}">`,
    `<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    base ? `<link rel="canonical" href="${esc(base)}/"><meta property="og:url" content="${esc(base)}/">` : '',
    `<script type="application/ld+json">${json}</script>`,
  ].filter(Boolean).join('\n');
}

// Importa o conteúdo da v2 para o Payload, sem perder nada.
//   pnpm import:v2                                   → conteúdo padrão da v2
//   V2_CONTENT=caminho/content.json pnpm import:v2    → o JSON que o servidor antigo gravava, ou um backup do portal
//   V2_LEADS=caminho/leads.json pnpm import:v2        → também traz os pedidos antigos como cotações
import { readFileSync } from 'node:fs'
import { getPayload } from 'payload'
import config from '../payload.config'
import { DEFAULT, type Content } from '../../../site/src/content/v2'

type Obj = Record<string, unknown>
/** Sobrepõe o conteúdo salvo ao padrão, campo a campo (a mesma regra que a v2 usava ao carregar). */
function merge<T>(d: T, s: unknown): T {
  if (Array.isArray(d)) return (Array.isArray(s) ? s : d) as T
  if (d && typeof d === 'object') {
    const o: Obj = {}
    for (const k in d) o[k] = merge((d as Obj)[k], s ? (s as Obj)[k] : undefined)
    return o as T
  }
  return (s === undefined || s === null ? d : s) as T
}
const readJson = (p?: string): unknown => (p ? JSON.parse(readFileSync(p, 'utf8')) : null)

const payload = await getPayload({ config })
const saved = readJson(process.env.V2_CONTENT) as Obj | null
const c: Content = merge(DEFAULT, (saved && 'content' in saved ? saved.content : saved) || {})

/** Foto ou logo embutidos em base64 viram um arquivo em `media`. */
async function upload(dataUrl: string, name: string, alt: string): Promise<number | undefined> {
  const m = /^data:(image\/(png|jpeg|webp));base64,(.+)$/.exec(dataUrl || '')
  if (!m) return undefined
  const data = Buffer.from(m[3], 'base64')
  const doc = await payload.create({ collection: 'media', data: { alt }, file: { data, mimetype: m[1], name: `${name}.${m[2] === 'jpeg' ? 'jpg' : m[2]}`, size: data.length } })
  payload.logger.info(`imagem importada: ${name} (${Math.round(data.length / 1024)} KB)`)
  return doc.id as number
}

const heroPhoto = await upload(c.hero.photo, 'abertura', 'Operação da HS Logística em Foz do Iguaçu')
const logo = await upload(c.brand.logo, 'logo', 'Logo da HS Logística e Armazenagem')
const photos: { image: number }[] = []
for (const [i, p] of c.photos.entries()) {
  const id = await upload(p, `operacao-${i + 1}`, 'Foto da operação da HS Logística')
  if (id) photos.push({ image: id })
}

await payload.updateGlobal({
  slug: 'home',
  data: {
    hero: { title: c.hero.title, title2: c.hero.title2, sub: c.hero.sub, cta1: c.hero.cta1, cta2: c.hero.cta2, facts: c.hero.facts.filter(Boolean).map((text) => ({ text })), photo: heroPhoto },
    services: c.services, photos, where: c.where, steps: c.steps, about: c.about, faq: c.faq,
  },
})
await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    brand: { name: c.brand.name, tag: c.brand.tag, logo },
    theme: c.theme,
    contact: { ...c.contact, email: c.contact.email || undefined },
    footer: c.footer,
    seo: { title: `${c.brand.name} ${c.brand.tag} | Foz do Iguaçu`, description: 'Armazém geral, transporte e carga e descarga na BR-277 em Foz do Iguaçu, a minutos do Paraguai e da Argentina.' },
  },
})
payload.logger.info('globals "home" e "site-settings" gravados')

// pedidos antigos → cotações com situação "novo"; quem já foi importado não entra de novo
const leads = (readJson(process.env.V2_LEADS) as Obj[] | null) || []
let added = 0
for (const l of leads) {
  const at = new Date(String(l.at || Date.now())).toISOString()
  const dup = await payload.find({ collection: 'quotes', limit: 1, where: { and: [{ name: { equals: String(l.name) } }, { contact: { equals: String(l.contact) } }, { createdAt: { equals: at } }] } })
  if (dup.totalDocs) continue
  await payload.create({ collection: 'quotes', data: { name: String(l.name || ''), contact: String(l.contact || ''), service: String(l.service || ''), message: String(l.message || ''), status: 'novo', createdAt: at }, disableTransaction: true, context: { imported: true } })
  added++
}
if (leads.length) payload.logger.info(`${added} de ${leads.length} pedidos antigos importados como cotações`)
process.exit(0)

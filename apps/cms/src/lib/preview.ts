// Endereço da prévia ao vivo no site, com um token curto assinado pelo CMS.
// O site confere a assinatura; quem não veio do painel não abre a rota /preview.
import { createHmac } from 'node:crypto'
import { env } from './env'

const TTL_MS = 2 * 60 * 60 * 1000

export function previewToken(now = Date.now()): string {
  const exp = String(now + TTL_MS)
  return exp + '.' + createHmac('sha256', env.previewSecret).update(exp).digest('hex')
}

export function previewUrl(kind: 'home' | 'post', slug = ''): string {
  const q = new URLSearchParams({ kind, token: previewToken() })
  if (slug) q.set('id', slug)
  return `${env.siteUrl}/preview?${q.toString()}`
}

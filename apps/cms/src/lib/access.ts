// Regras de acesso. Nada é público por omissão: cada collection e global declara as suas.
import { timingSafeEqual } from 'node:crypto'
import type { Access, FieldAccess, PayloadRequest } from 'payload'
import { env } from './env'

type Role = 'admin' | 'editor'
const role = (req: PayloadRequest): Role | undefined => (req.user as { role?: Role } | null)?.role

export const anyone: Access = () => true
export const loggedIn: Access = ({ req }) => !!req.user
export const adminOnly: Access = ({ req }) => role(req) === 'admin'
export const adminOnlyField: FieldAccess = ({ req }) => role(req) === 'admin'

/** Visitante só enxerga o que está publicado; quem está logado enxerga rascunhos também. */
export const publishedOrLoggedIn: Access = ({ req }) => (req.user ? true : { _status: { equals: 'published' } })

/** Admin vê e edita qualquer usuário; os demais, só a própria conta. */
export const adminOrSelf: Access = ({ req }) => {
  if (!req.user) return false
  return role(req) === 'admin' ? true : { id: { equals: req.user.id } }
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b)
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y)
}

/** Cotações só entram pelo proxy do site (que aplica o limite por IP) ou por alguém logado no admin. */
export const viaSiteProxy: Access = ({ req }) =>
  !!req.user || safeEqual(req.headers.get('x-quote-secret') || '', env.quoteProxySecret)

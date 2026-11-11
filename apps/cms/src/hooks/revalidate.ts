// Avisa o site de que o conteúdo mudou, para ele refazer o HTML em memória.
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'
import { env } from '../lib/env'

async function ping(what: string, log: { warn: (m: string) => void }): Promise<void> {
  if (!env.revalidateSecret) return
  try {
    const r = await fetch(env.siteUrl + '/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': env.revalidateSecret },
      body: JSON.stringify({ what }),
      signal: AbortSignal.timeout(8000),
    })
    if (!r.ok) log.warn(`revalidate (${what}): o site respondeu ${r.status}`)
  } catch (e) {
    log.warn(`revalidate (${what}): site fora do ar? ${(e as Error).message}`)
  }
}

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, global, req }) => {
  void ping(global.slug, req.payload.logger)
  return doc
}

/** Posts: só avisa quando algo publicado mudou (salvar rascunho não mexe no site). */
export const revalidatePost: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (doc._status === 'published' || previousDoc?._status === 'published') void ping('posts', req.payload.logger)
  return doc
}
export const revalidateAlways: CollectionAfterChangeHook = ({ doc, collection, req }) => {
  void ping(collection.slug, req.payload.logger)
  return doc
}
export const revalidateDelete: CollectionAfterDeleteHook = ({ doc, collection, req }) => {
  void ping(collection.slug, req.payload.logger)
  return doc
}

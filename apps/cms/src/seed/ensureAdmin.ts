// Primeiro acesso: cria o usuário administrador a partir de ADMIN_EMAIL e ADMIN_PASSWORD, se ainda não houver nenhum.
import type { Payload } from 'payload'

export async function ensureAdmin(payload: Payload): Promise<void> {
  const email = process.env.ADMIN_EMAIL, password = process.env.ADMIN_PASSWORD
  if (!email || !password) return
  const { totalDocs } = await payload.count({ collection: 'users' })
  if (totalDocs > 0) return
  await payload.create({ collection: 'users', data: { email, password, name: process.env.ADMIN_NAME || 'Administrador', role: 'admin' } })
  payload.logger.info(`Usuário administrador criado: ${email}`)
}

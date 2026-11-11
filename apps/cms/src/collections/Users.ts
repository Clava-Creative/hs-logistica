import type { CollectionConfig } from 'payload'
import { adminOnly, adminOnlyField, adminOrSelf } from '../lib/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  admin: { useAsTitle: 'name', group: 'Configurações', defaultColumns: ['name', 'email', 'role'] },
  auth: { tokenExpiration: 60 * 60 * 12, maxLoginAttempts: 8, lockTime: 15 * 60 * 1000 },
  access: { admin: ({ req }) => !!req.user, read: adminOrSelf, create: adminOnly, update: adminOrSelf, delete: adminOnly, unlock: adminOnly },
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    {
      name: 'role', label: 'Papel', type: 'select', required: true, defaultValue: 'editor', saveToJWT: true,
      options: [{ label: 'Administrador (tudo, inclusive usuários)', value: 'admin' }, { label: 'Editor (conteúdo, blog e cotações)', value: 'editor' }],
      access: { create: adminOnlyField, update: adminOnlyField },
    },
  ],
}

import type { CollectionConfig } from 'payload'
import { adminOnly, loggedIn, viaSiteProxy } from '../lib/access'
import { notifyQuote } from '../hooks/notifyQuote'

const cut = (max: number) => ({ value }: { value?: unknown }): string => String(value ?? '').slice(0, max).trim()

export const Quotes: CollectionConfig = {
  slug: 'quotes',
  labels: { singular: 'Pedido de cotação', plural: 'Pedidos de cotação' },
  admin: { group: 'Cotações', useAsTitle: 'name', defaultColumns: ['name', 'contact', 'service', 'status', 'createdAt'], description: 'Pedidos enviados pelo formulário do site.' },
  access: { create: viaSiteProxy, read: loggedIn, update: loggedIn, delete: adminOnly },
  defaultSort: '-createdAt',
  hooks: { afterChange: [notifyQuote] },
  fields: [
    { name: 'name', label: 'Nome ou empresa', type: 'text', required: true, maxLength: 120, hooks: { beforeValidate: [cut(120)] } },
    { name: 'contact', label: 'Telefone ou e-mail', type: 'text', required: true, maxLength: 120, hooks: { beforeValidate: [cut(120)] } },
    { name: 'service', label: 'Serviço', type: 'text', maxLength: 120, hooks: { beforeValidate: [cut(120)] } },
    { name: 'message', label: 'Sobre a carga', type: 'textarea', maxLength: 2000, hooks: { beforeValidate: [cut(2000)] } },
    {
      name: 'status', label: 'Situação', type: 'select', required: true, defaultValue: 'novo', admin: { position: 'sidebar' },
      options: [{ label: 'Novo', value: 'novo' }, { label: 'Em contato', value: 'em contato' }, { label: 'Fechado', value: 'fechado' }, { label: 'Descartado', value: 'descartado' }],
      // quem envia pelo site não escolhe a situação
      access: { create: ({ req }) => !!req.user },
    },
    { name: 'notes', label: 'Notas internas', type: 'textarea', admin: { description: 'Só aparece aqui no painel.' }, access: { create: ({ req }) => !!req.user } },
  ],
}

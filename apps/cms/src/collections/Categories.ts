import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../lib/access'
import { slugFrom } from '../lib/slug'
import { revalidateAlways, revalidateDelete } from '../hooks/revalidate'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Categoria', plural: 'Categorias' },
  admin: { group: 'Blog', useAsTitle: 'title', defaultColumns: ['title', 'slug'] },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: { afterChange: [revalidateAlways], afterDelete: [revalidateDelete] },
  fields: [
    { name: 'title', label: 'Nome', type: 'text', required: true },
    { name: 'slug', label: 'Endereço', type: 'text', unique: true, index: true, hooks: { beforeValidate: [slugFrom('title')] }, admin: { position: 'sidebar', description: 'Parte final do link. Se ficar vazio, é criado a partir do nome.' } },
  ],
}

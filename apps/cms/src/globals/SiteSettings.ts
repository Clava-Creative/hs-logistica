// Marca, cores, contato e rodapé: o que vale para o site inteiro.
import type { GlobalConfig } from 'payload'
import { anyone, loggedIn } from '../lib/access'
import { revalidateGlobal } from '../hooks/revalidate'

const hex = (v: unknown): true | string =>
  typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? true : 'Use uma cor no formato #RRGGBB, por exemplo #0E234E.'
const color = (name: string, label: string, def: string) =>
  ({ name, label, type: 'text' as const, required: true, defaultValue: def, validate: hex, admin: { width: '33%' } })

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Marca, cores e contato',
  admin: { group: 'Site' },
  access: { read: anyone, update: loggedIn },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { name: 'brand', label: 'Marca', fields: [
        { type: 'row', fields: [{ name: 'name', label: 'Nome', type: 'text', required: true }, { name: 'tag', label: 'Complemento do nome', type: 'text' }] },
        { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media', admin: { description: 'Sem logo enviado, o site usa o logo padrão da HS.' } },
      ] },
      { name: 'theme', label: 'Cores', description: 'Mudam no site inteiro, inclusive na cena 3D.', fields: [
        { type: 'row', fields: [color('accent', 'Verde de destaque', '#67AA4B'), color('ink', 'Azul da marca', '#0E234E'), color('paper', 'Cor clara (textos e formulário)', '#FFFFFF')] },
      ] },
      { name: 'contact', label: 'Contato', fields: [
        { name: 'address', label: 'Endereço', type: 'text' },
        { type: 'row', fields: [{ name: 'phone', label: 'Telefone', type: 'text' }, { name: 'whatsapp', label: 'WhatsApp (com DDD)', type: 'text' }] },
        { type: 'row', fields: [{ name: 'email', label: 'E-mail', type: 'email' }, { name: 'hours', label: 'Horário de atendimento', type: 'text' }] },
      ] },
      { label: 'Rodapé', fields: [{ name: 'footer', label: 'Texto do rodapé', type: 'text' }] },
      { name: 'seo', label: 'Google e redes sociais', description: 'Valores padrão, usados quando uma página não tem os seus.', fields: [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'description', label: 'Descrição', type: 'textarea', maxLength: 200 },
        { name: 'image', label: 'Imagem de compartilhamento', type: 'upload', relationTo: 'media' },
      ] },
    ],
  }],
}

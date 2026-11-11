// Conteúdo da página inicial, com os mesmos nomes de campo que o site usa desde a v2.
import type { Field, GlobalConfig } from 'payload'
import { anyone, loggedIn } from '../lib/access'
import { previewUrl } from '../lib/preview'
import { revalidateGlobal } from '../hooks/revalidate'

const items = (label: string, t: string, d: string): Field => ({
  name: 'items', label, type: 'array', labels: { singular: 'Item', plural: 'Itens' },
  admin: { initCollapsed: true },
  fields: [{ name: 't', label: t, type: 'text', required: true }, { name: 'd', label: d, type: 'textarea', required: true }],
})
const title: Field = { name: 'title', label: 'Título', type: 'text', required: true }
const lead: Field = { name: 'lead', label: 'Texto de apoio', type: 'textarea' }

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Página inicial',
  admin: { group: 'Site', livePreview: { url: () => previewUrl('home') } },
  access: { read: anyone, update: loggedIn },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [{
    type: 'tabs',
    tabs: [
      { name: 'hero', label: 'Abertura', fields: [
        { name: 'title', label: 'Título (primeira linha)', type: 'text', required: true },
        { name: 'title2', label: 'Título (linha em verde)', type: 'text' },
        { name: 'sub', label: 'Subtítulo', type: 'textarea' },
        { type: 'row', fields: [{ name: 'cta1', label: 'Botão principal', type: 'text' }, { name: 'cta2', label: 'Botão secundário', type: 'text' }] },
        { name: 'facts', label: 'Fatos em destaque', type: 'array', maxRows: 4, labels: { singular: 'Fato', plural: 'Fatos' }, fields: [{ name: 'text', label: 'Texto', type: 'text', required: true }] },
        { name: 'photo', label: 'Foto da abertura', type: 'upload', relationTo: 'media', admin: { description: 'Opcional. Com foto, ela ocupa o lugar do mapa na abertura.' } },
      ] },
      { name: 'services', label: 'Serviços', fields: [title, lead, items('Serviços', 'Nome do serviço', 'Descrição')] },
      { label: 'Fotos', fields: [
        { name: 'photos', label: 'Fotos da operação', type: 'array', maxRows: 3, labels: { singular: 'Foto', plural: 'Fotos' }, admin: { description: 'Até três fotos do armazém, da frota ou da equipe.' }, fields: [{ name: 'image', label: 'Foto', type: 'upload', relationTo: 'media', required: true }] },
      ] },
      { name: 'where', label: 'Localização', fields: [title, lead, items('Destinos', 'Destino', 'Como se chega')] },
      { name: 'steps', label: 'Etapas', fields: [title, items('Etapas', 'Nome da etapa', 'O que acontece')] },
      { name: 'about', label: 'Empresa', fields: [title,
        { name: 'text', label: 'Texto', type: 'textarea' },
        { name: 'facts', label: 'Dados da empresa', type: 'array', labels: { singular: 'Dado', plural: 'Dados' }, fields: [{ type: 'row', fields: [{ name: 'k', label: 'Nome', type: 'text', required: true }, { name: 'v', label: 'Valor', type: 'text', required: true }] }] },
      ] },
      { name: 'faq', label: 'Dúvidas', fields: [title,
        { name: 'items', label: 'Perguntas', type: 'array', labels: { singular: 'Pergunta', plural: 'Perguntas' }, admin: { initCollapsed: true }, fields: [{ name: 'q', label: 'Pergunta', type: 'text', required: true }, { name: 'a', label: 'Resposta', type: 'textarea', required: true }] },
      ] },
    ],
  }],
}

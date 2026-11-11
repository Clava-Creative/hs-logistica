import path from 'node:path'
import { APIError, type CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../lib/access'

const MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const EXT = /\.(jpe?g|png|webp|avif)$/i

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Imagem', plural: 'Imagens' },
  admin: { group: 'Configurações', useAsTitle: 'alt' },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  upload: {
    staticDir: path.resolve(process.cwd(), 'media'),
    mimeTypes: MIME,
    adminThumbnail: 'thumb',
    focalPoint: true,
    // tamanhos gerados em WebP; o site escolhe o que cabe em cada lugar
    imageSizes: [
      { name: 'thumb', width: 400, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'card', width: 800, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'hero', width: 1600, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'og', width: 1200, height: 630, position: 'centre', formatOptions: { format: 'webp', options: { quality: 80 } } },
    ],
  },
  hooks: {
    // o tipo do arquivo já é conferido pelo Payload; aqui confere-se também a extensão
    beforeOperation: [({ operation, req }) => {
      if ((operation === 'create' || operation === 'update') && req.file && !EXT.test(req.file.name)) {
        throw new APIError('Envie uma imagem JPG, PNG, WebP ou AVIF.', 400)
      }
    }],
  },
  fields: [
    { name: 'alt', label: 'Descrição da imagem', type: 'text', required: true, admin: { description: 'O que aparece na imagem, em uma frase. É lida por leitores de tela e pelo Google.' } },
  ],
}

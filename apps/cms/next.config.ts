import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  // imagem autônoma para o deploy: o Dockerfile copia só o que o servidor usa
  output: 'standalone',
  outputFileTracingRoot: path.resolve(dirname, '../..'),
  images: { localPatterns: [{ pathname: '/api/media/file/**' }] },
  // monorepo: as dependências ficam na raiz do workspace
  turbopack: { root: path.resolve(dirname, '../..') },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

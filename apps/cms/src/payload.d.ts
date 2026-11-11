// Liga os tipos gerados (packages/types) ao Payload, para a API local sair tipada.
import type { Config } from '@hs/types'

declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}

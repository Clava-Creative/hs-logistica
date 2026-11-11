// Variáveis de ambiente do CMS, lidas num lugar só.
const clean = (v: string | undefined): string => (v || '').replace(/\/$/, '')

export const env = {
  cmsUrl: clean(process.env.CMS_URL) || 'http://localhost:3001',
  siteUrl: clean(process.env.SITE_URL) || 'http://localhost:3000',
  revalidateSecret: process.env.REVALIDATE_SECRET || '',
  previewSecret: process.env.PREVIEW_SECRET || '',
  quoteProxySecret: process.env.QUOTE_PROXY_SECRET || '',
  quoteWebhookUrl: process.env.QUOTE_WEBHOOK_URL || '',
  quoteNotifyTo: process.env.QUOTE_NOTIFY_TO || '',
}

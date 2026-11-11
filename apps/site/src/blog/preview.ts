// Prévia ao vivo de um post: o artigo é remontado com o que está sendo digitado no painel.
import { ready, subscribe } from '@payloadcms/live-preview';
import type { Post as CmsPost } from '@hs/types';
import { post as mapPost } from '../content/fromCms';
import { blogPost } from './pages';
import { previewRequest, type PreviewState } from '../preview';

export function startPostPreview(): void {
  const hs = window.__HS__!, p = hs.preview as unknown as PreviewState & { post: CmsPost }, serverURL = hs.content.cmsUrl;
  subscribe<CmsPost>({
    serverURL, depth: 1, initialData: p.post, requestHandler: previewRequest(p.token),
    callback: (doc) => {
      if (!doc || !('title' in doc)) return;
      const view = mapPost({ ...doc, _status: 'published', slug: doc.slug || 'rascunho' } as CmsPost);
      if (view) (document.getElementById('app') as HTMLElement).innerHTML = blogPost(hs.content, view, [], '');
    },
  });
  ready({ serverURL });
}

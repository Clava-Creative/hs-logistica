import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const at = (p: string): string => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  base: '/',
  build: {
    target: 'es2022', cssCodeSplit: true, reportCompressedSize: true,
    // duas páginas: a inicial (cena 3D e scroll) e a casca leve das páginas do blog
    rollupOptions: { input: { main: at('./index.html'), blog: at('./blog.html') } },
  },
  server: { proxy: { '/api': 'http://localhost:3000', '/blog': 'http://localhost:3000' } },
});

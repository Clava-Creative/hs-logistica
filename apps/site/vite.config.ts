import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { target: 'es2022', cssCodeSplit: true, reportCompressedSize: true },
  server: { proxy: { '/api': 'http://localhost:3000' } },
});

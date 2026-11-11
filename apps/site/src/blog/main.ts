// Entrada das páginas do blog: só estilos. O único código que roda é o da prévia ao vivo, e só na rota /preview.
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/sections/nav.css';
import '../styles/sections/footer.css';
import '../styles/sections/blog.css';
import '../styles/blog/layout.css';
import '../styles/blog/prose.css';

if (window.__HS__?.preview) void import('./preview').then((m) => m.startPostPreview());

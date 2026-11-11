// Servidor do site HS Logística: entrega o build (dist/) e guarda o que o cliente altera no portal.
// Sem dependências. Uso: npm run build && ADMIN_PASSWORD="sua-senha" node server.cjs
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');
const DATA = path.join(__dirname, 'data');
fs.mkdirSync(DATA, { recursive: true });
const file = n => path.join(DATA, n);
const read = (n, d) => { try { return JSON.parse(fs.readFileSync(file(n), 'utf8')); } catch { return d; } };
const write = (n, v) => { fs.writeFileSync(file(n) + '.tmp', JSON.stringify(v, null, 1)); fs.renameSync(file(n) + '.tmp', file(n)); };

const hash = (pw, salt = crypto.randomBytes(16).toString('hex')) => ({ salt, hash: crypto.scryptSync(pw, salt, 64).toString('hex') });
const check = (pw, a) => crypto.timingSafeEqual(Buffer.from(hash(pw, a.salt).hash, 'hex'), Buffer.from(a.hash, 'hex'));

// Senha: na primeira execução usa ADMIN_PASSWORD ou gera uma e mostra no terminal.
let auth = read('auth.json', null);
if (!auth) {
  const pw = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
  auth = hash(pw); write('auth.json', auth);
  if (!process.env.ADMIN_PASSWORD) console.log('\n  Senha inicial do portal: ' + pw + '\n  (troque no portal, em "Senha")\n');
}

const sessions = new Map();            // token -> validade
const attempts = new Map();            // ip -> {n, until}
const TTL = 12 * 3600e3;
const authed = req => { const t = (req.headers.authorization || '').replace(/^Bearer /, ''); const e = sessions.get(t); if (e && e > Date.now()) return true; sessions.delete(t); return false; };
const throttled = ip => { const a = attempts.get(ip); return a && a.n >= 8 && a.until > Date.now(); };
const fail = ip => { const a = attempts.get(ip); attempts.set(ip, a && a.until > Date.now() ? { n: a.n + 1, until: a.until } : { n: 1, until: Date.now() + 15 * 60e3 }); };

const send = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
const body = req => new Promise((ok, no) => { let s = ''; req.on('data', c => { s += c; if (s.length > 8e6) { no(new Error('grande demais')); req.destroy(); } }); req.on('end', () => { try { ok(JSON.parse(s || '{}')); } catch { no(new Error('JSON inválido')); } }); });
const str = (v, max) => String(v ?? '').slice(0, max).trim();

// ---------- Página: o HTML sai com o conteúdo salvo já escrito e o mesmo conteúdo embutido para o JS ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };
const SECURITY = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
let renderPage = null, page = null;       // page: HTML pronto, refeito quando o conteúdo muda
const inline = v => JSON.stringify(v).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, c => '\\u' + c.charCodeAt(0).toString(16));
function buildPage() {
  const template = fs.readFileSync(path.join(DIST, 'template.html'), 'utf8');
  const saved = read('content.json', null);
  const { html } = renderPage(saved);
  return template.replace('<!--app-->', () => html).replace('<!--head-->', '')
    .replace('<!--state-->', () => `<script>window.__HS__=${inline({ content: saved })}</script>`);
}
function sendStatic(req, res, url) {
  const rel = path.normalize(decodeURIComponent(url)).replace(/^([/\\]|\.\.[/\\])+/, '');
  const full = path.join(DIST, rel);
  if (!full.startsWith(DIST + path.sep) || rel === 'template.html') return false;
  let st; try { st = fs.statSync(full); } catch { return false; }
  if (!st.isFile()) return false;
  const immutable = rel.startsWith('assets' + path.sep);
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(full)] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=3600', ...SECURITY });
  if (req.method === 'HEAD') { res.end(); return true; }
  fs.createReadStream(full).pipe(res);
  return true;
}

async function handle(req, res) {
  const url = req.url.split('?')[0], ip = req.socket.remoteAddress;
  try {
    if (url === '/' || url === '/index.html') {
      page = page || buildPage();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', ...SECURITY });
      return res.end(req.method === 'HEAD' ? undefined : page);
    }
    if (url === '/api/content' && req.method === 'GET') return send(res, 200, { content: read('content.json', null) });
    if (url === '/api/login' && req.method === 'POST') {
      if (throttled(ip)) return send(res, 429, { error: 'Muitas tentativas. Aguarde 15 minutos.' });
      const { password } = await body(req);
      if (typeof password !== 'string' || !check(password, auth)) { fail(ip); return send(res, 401, { error: 'Senha incorreta.' }); }
      const token = crypto.randomBytes(32).toString('hex'); sessions.set(token, Date.now() + TTL);
      return send(res, 200, { token });
    }
    if (url === '/api/leads' && req.method === 'POST') {
      const b = await body(req), lead = { id: crypto.randomUUID(), at: new Date().toISOString(), name: str(b.name, 120), contact: str(b.contact, 120), service: str(b.service, 120), message: str(b.message, 2000) };
      if (!lead.name || !lead.contact) return send(res, 400, { error: 'Informe nome e contato.' });
      const all = read('leads.json', []); all.unshift(lead); write('leads.json', all.slice(0, 1000));
      return send(res, 200, { ok: true });
    }
    if (url.startsWith('/api/')) {
      if (!authed(req)) return send(res, 401, { error: 'Entre no portal novamente.' });
      if (url === '/api/content' && req.method === 'PUT') {
        const { content } = await body(req);
        if (!content || typeof content !== 'object') return send(res, 400, { error: 'Conteúdo inválido.' });
        write('content.json', content); page = null;
        return send(res, 200, { ok: true });
      }
      if (url === '/api/leads' && req.method === 'GET') return send(res, 200, { leads: read('leads.json', []) });
      if (url.startsWith('/api/leads/') && req.method === 'DELETE') { const id = decodeURIComponent(url.slice(11)); write('leads.json', read('leads.json', []).filter(l => l.id !== id)); return send(res, 200, { ok: true }); }
      if (url === '/api/password' && req.method === 'POST') {
        const { old, neu } = await body(req);
        if (typeof old !== 'string' || !check(old, auth)) return send(res, 400, { error: 'A senha atual não confere.' });
        if (typeof neu !== 'string' || neu.length < 8) return send(res, 400, { error: 'A nova senha precisa de pelo menos 8 caracteres.' });
        auth = hash(neu); write('auth.json', auth); return send(res, 200, { ok: true });
      }
      return send(res, 404, { error: 'Não encontrado.' });
    }
    if ((req.method === 'GET' || req.method === 'HEAD') && sendStatic(req, res, url)) return;
    send(res, 404, { error: 'Não encontrado.' });
  } catch (e) { send(res, 400, { error: e.message }); }
}

(async () => {
  try { ({ renderPage } = await import('./dist-server/ssr.js')); fs.accessSync(path.join(DIST, 'template.html')); }
  catch { console.error('Build não encontrado. Rode "npm run build" antes de iniciar o servidor.'); process.exit(1); }
  http.createServer(handle).listen(PORT, () => console.log('Site no ar: http://localhost:' + PORT + '  ·  portal: http://localhost:' + PORT + '/#portal'));
})();

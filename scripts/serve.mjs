// Serves docs/ under /pieces-en-ordre/ like GitHub Pages (port 4317).
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = new URL('../docs', import.meta.url).pathname;
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain', '.pdf': 'application/pdf' };
http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (!u.startsWith('/pieces-en-ordre/')) { res.writeHead(302, { location: '/pieces-en-ordre/' }); return res.end(); }
  let f = path.join(ROOT, u.slice('/pieces-en-ordre'.length));
  if (f.endsWith('/')) f += 'index.html';
  if (!fs.existsSync(f) && fs.existsSync(f + '/index.html')) { res.writeHead(301, { location: u + '/' }); return res.end(); }
  if (!fs.existsSync(f)) { res.writeHead(404, { 'content-type': T['.html'] }); return res.end(fs.readFileSync(path.join(ROOT, '404.html'))); }
  res.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(process.env.PORT || 4317, () => console.log('http://localhost:' + (process.env.PORT || 4317) + '/pieces-en-ordre/'));

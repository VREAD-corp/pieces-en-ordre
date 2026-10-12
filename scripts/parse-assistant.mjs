// Parses the France-Visas « Assistant visa » results saved in data/raw/<cc>-<motif>.txt
// into data/official.json. The raw files are the page text as read on 13/10/2026 (licence etalab-2.0).
import fs from 'fs';
const dir = new URL('../data/raw/', import.meta.url).pathname;
const out = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.txt')).sort()) {
  const [cc, ...m] = f.replace('.txt', '').split('-'); const motif = m.join('-');
  const t = fs.readFileSync(dir + f, 'utf8');
  const head = t.split('\n')[0];
  const i = t.indexOf('Préparez les justificatifs à fournir');
  const ends = ['Le montant à acquitter', 'Une erreur technique', 'Réaliser votre demande de visa'].map(x => t.indexOf(x, i)).filter(x => x > 0);
  const j = Math.min(...ends);
  const jf = t.indexOf('Le montant à acquitter', i);
  // Tunisian results are bilingual: Arabic lines repeat the French ones; we keep the French text.
  const body = t.slice(i + 'Préparez les justificatifs à fournir'.length, j).split('\n').map(s => s.trim()).filter(s => !/[\u0600-\u06ff]/.test(s));
  const fee = jf > 0 ? t.slice(jf).split('\n')[0].trim() : '';
  const sections = []; let cur = null;
  for (let k = 0; k < body.length; k++) {
    const line = body[k];
    if (!line) continue;
    if (line === line.toUpperCase() && /[A-ZÉ]/.test(line) && line.length < 60) { cur = { section: line, items: [] }; sections.push(cur); continue; }
    if (!cur) continue;
    const last = cur.items[cur.items.length - 1];
    if (line.length < 40 && !/[.:]$/.test(line) && (!last || last.text)) { cur.items.push({ title: line, text: '' }); continue; }
    if (last && !last.text) last.text = line; else if (last) last.text += '\n' + line;
  }
  out[cc] = out[cc] || {};
  out[cc][motif] = { read: head, sections, fee };
}
fs.writeFileSync(new URL('../data/official.json', import.meta.url).pathname, JSON.stringify(out, null, 1));
const titles = {};
for (const cc in out) for (const m in out[cc]) for (const s of out[cc][m].sections) for (const it of s.items) titles[it.title] = (titles[it.title] || 0) + 1;
console.log(Object.keys(out).map(c => c + ':' + Object.keys(out[c]).length).join(' '));
console.log(titles);

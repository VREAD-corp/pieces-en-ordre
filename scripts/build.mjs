// Builds the static site into docs/ (GitHub Pages, branch main, folder /docs).
// No framework, no web font, no third-party script: pages must load on slow mobile networks.
import fs from 'fs';
import path from 'path';
import { VERIFIED, SOURCES, MOTIFS_REFUS, POURQUOI, MOTIFS_SEJOUR, PAYS } from '../data/content.mjs';
import { PAGES } from './pages.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = path.join(ROOT, 'docs');
const BASE = '/pieces-en-ordre/';
const ORIGIN = 'https://outils.vread.fr';
const OFFICIAL = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/official.json'), 'utf8'));
export const ENDPOINT = 'https://script.google.com/macros/s/' + JSON.parse(fs.readFileSync(path.join(ROOT, 'gas/.deployment.json'), 'utf8')).deploymentId + '/exec';

export const PAYS_SLUG = { ma: 'maroc', dz: 'algerie', tn: 'tunisie', sn: 'senegal', ci: 'cote-d-ivoire', cm: 'cameroun' };
export const MOTIF_SLUG = { famille: 'visite-familiale', tourisme: 'tourisme', affaires: 'affaires', stage: 'stage' };

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** French typography on text nodes only: narrow no-break space before ; : ? ! and inside « ». */
function typo(html) {
  return html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/).map(part => {
    if (part.startsWith('<')) return part;
    return part.replace(/ ([;:?!»])/g, ' $1').replace(/« /g, '« ').replace(/(\d) €/g, '$1 €').replace(/(\d) (\d{3})/g, '$1 $2');
  }).join('');
}

export function src(keys) {
  return keys.map(k => SOURCES[k]).map(s => `<a href="${s.url}" rel="noopener" data-mesure="source_click">${esc(s.label)}</a>`).join(' ; ');
}

function layout({ title, description, canonical, body, pageClass = '', noindex = false, jsonld = '' }) {
  return typo(`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${ORIGIN}${canonical}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Pièces en ordre">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${ORIGIN}${canonical}">
<meta property="og:image" content="${ORIGIN}${BASE}og.png">
<meta name="theme-color" content="#2f5d50">
<link rel="icon" href="${BASE}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${BASE}style.css">
${jsonld}
</head>
<body class="${pageClass}">
<a class="skip" href="#contenu">Aller au contenu</a>
<header class="top">
  <div class="wrap top-in">
    <a class="brand" href="${BASE}"><svg aria-hidden="true" width="26" height="26" viewBox="0 0 32 32"><path d="M3 9h10l3 3h13v15H3z" fill="#e9d8b4" stroke="#2f5d50" stroke-width="2"/><path d="M10 19l4 4 8-8" fill="none" stroke="#2f5d50" stroke-width="2.6"/></svg><span>Pièces en ordre</span></a>
    <nav aria-label="Navigation principale"><a href="${BASE}#choisir">Checklist</a><a href="${BASE}hote/">Hôte en France</a><a href="${BASE}refus/">Après un refus</a><a href="${BASE}pack/">Pack dossier</a></nav>
  </div>
  <p class="indep wrap">Service indépendant, non affilié aux autorités françaises, à France-Visas, aux consulats, à TLScontact, VFS Global ou Capago. Ce n’est pas un conseil juridique.</p>
</header>
<main id="contenu" class="wrap">
${body}
</main>
<footer class="foot">
  <div class="wrap">
    <p><strong>Pièces en ordre</strong> est un service de documentation en libre-service édité par READ FRANCE SAS (SIREN 988 741 773, 11 rue Rouvet, 75019 Paris). Contact : <a href="mailto:octave@vread.fr">octave@vread.fr</a>.</p>
    <p>Service indépendant, non affilié aux autorités. Nous ne prenons pas de rendez-vous, ne déposons pas de dossier, ne vendons aucun créneau et ne représentons personne. Les informations ne constituent pas un conseil juridique : la consultation juridique rémunérée est réservée aux professions réglementées (loi n° 71-1130, art. 54). Seul le consulat décide.</p>
    <p class="foot-links"><a href="${BASE}mentions-legales/">Mentions légales</a><a href="${BASE}confidentialite/">Confidentialité (RGPD)</a><a href="${BASE}conditions/">Conditions et avertissement</a><a href="${BASE}sources/">Sources officielles</a><a href="${BASE}faux-documents/">Faux documents : les risques</a></p>
    <p class="small">Textes officiels cités : France-Visas (licence etalab-2.0), Service-public.fr, Légifrance, EUR-Lex. Dernière vérification : ${VERIFIED}. Mesure d’audience anonyme, sans cookie.</p>
  </div>
</footer>
<script src="${BASE}mesure.js" defer></script>
<script src="${BASE}app.js" defer></script>
</body>
</html>
`);
}

function itemHtml(it, cc, key, idx) {
  const w = POURQUOI[it.title] || {};
  const id = `${cc}-${key}-${idx}`;
  const motifs = (w.motifs || []).length ? `<p class="motifs">Motifs de refus concernés (formulaire officiel) : ${w.motifs.map(n => `<a href="${BASE}refus/#motif-${n}">n° ${n}</a>`).join(', ')}</p>` : '';
  const checks = (w.check || []).length ? `<ul class="checks">${w.check.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : '';
  return `<li class="item" id="${id}">
  <label class="tick"><input type="checkbox" data-key="${id}"><span>${esc(it.title)}</span></label>
  <blockquote class="official"><p>${esc(it.text).replace(/\n/g, '</p><p>')}</p><cite>Liste officielle France-Visas</cite></blockquote>
  ${w.why ? `<p class="why"><b>Pourquoi on vous la demande.</b> ${esc(w.why)}</p>` : ''}
  ${checks}${motifs}
</li>`;
}

function listHtml(cc, fileKey) {
  const data = OFFICIAL[cc][fileKey];
  let idx = 0;
  const main = [], cond = [];
  for (const s of data.sections) {
    const items = [], cItems = [];
    for (const it of s.items) {
      const w = POURQUOI[it.title] || {};
      if (w.cond) cItems.push(`<li><b>${esc(it.title)}</b> : ${esc(w.cond)} <span class="small">(${esc(it.text)})</span></li>`);
      else items.push(itemHtml(it, cc, fileKey, idx++));
    }
    if (items.length) main.push(`<section class="sec"><h3>${esc(s.section.charAt(0) + s.section.slice(1).toLowerCase())}</h3><ol class="items">${items.join('')}</ol></section>`);
    cond.push(...cItems);
  }
  const fee = data.fee ? esc(data.fee.replace('Le montant à acquitter est de : ', '').replace(/^90\.00 euros\.?/, '90 €').replace(/\.$/, '').replace(/^0\.00 euros\.?/, '0 € (exonération)')) : '90 € pour un adulte (FAQ France-Visas)';
  return { html: main.join('\n') + (cond.length ? `<details class="cond"><summary>Cas particuliers (passeport officiel, résidence dans un autre pays)</summary><ul>${cond.join('')}</ul></details>` : ''), count: idx, fee };
}

function checklistPage(cc, mk) {
  const p = PAYS[cc], m = MOTIFS_SEJOUR[mk];
  const canonical = `${BASE}${PAYS_SLUG[cc]}/${MOTIF_SLUG[mk]}/`;
  let lists = '', total = 0, fees = [];
  for (const f of m.files) {
    const l = listHtml(cc, f);
    total += l.count; fees.push(l.fee);
    lists += m.variants ? `<section class="variant"><h2>${esc(m.variants[f])}</h2>${l.html}</section>` : l.html;
  }
  const title = `Visa France ${m.short} ${p.from} : les pièces du dossier`;
  const body = `
<nav class="crumbs" aria-label="Fil d’Ariane"><a href="${BASE}">Accueil</a> › ${esc(p.name)} › ${esc(m.label)}</nav>
<h1>${esc(m.label)} en France, demande déposée ${esc(p.of)} : la liste des pièces</h1>
<p class="lede">Visa de court séjour (Schengen, 90 jours au plus). Liste reprise de l’« Assistant visa » de France-Visas pour un passeport ordinaire ${esc(p.adj)} et une résidence ${esc(p.of)}, lue le ${VERIFIED}. Chaque pièce est suivie de la raison pour laquelle le consulat la demande.</p>
<div class="tools noprint"><p class="progress" aria-live="polite"><span data-done>0</span> pièce(s) prête(s) sur ${total}</p><button type="button" class="btn ghost" data-print>Imprimer la liste</button><button type="button" class="btn ghost" data-reset>Tout décocher</button></div>
<aside class="depot">
  <h2>Où et quand déposer</h2>
  <dl>
    <dt>Prestataire</dt><dd>${esc(p.provider)} (${esc(p.centres)}). <a href="${p.providerUrl}" rel="noopener">Site du prestataire</a></dd>
    <dt>Qui décide</dt><dd>${esc(p.decide)}. Le prestataire ne décide pas.</dd>
    <dt>Droits de visa</dt><dd>${[...new Set(fees)].join(' ; ')}. Non remboursables en cas de refus.</dd>
    <dt>Frais de service</dt><dd>${esc(p.service)}.</dd>
    <dt>Délais</dt><dd>${esc(p.delay)} Le code des visas permet de déposer au plus tôt 6 mois avant le voyage et, en principe, au plus tard 15 jours avant (art. 9).</dd>
  </dl>
  ${p.notes.map(n => `<p class="note">${esc(n)}</p>`).join('')}
  <p class="small">Source : <a href="${p.url}" rel="noopener">page ${esc(p.name)} de France-Visas</a>, vérifiée le ${VERIFIED}.</p>
</aside>
${lists}
<section class="rdv">
  <h2>Le jour du rendez-vous</h2>
  <ul>
    <li>Le formulaire (CERFA) et le récépissé France-Visas imprimés en version définitive, sans la mention « BROUILLON ». France-Visas prévient : « En cas d’absence d’un document présent sur votre récépissé, votre demande de visa peut être refusée. »</li>
    <li>Les originaux et une copie de chaque justificatif.</li>
    <li>Les documents rédigés dans une autre langue que le français ou l’anglais peuvent être demandés traduits en français.</li>
    <li>Les droits de visa et les frais de service, dans le mode de paiement indiqué plus haut.</li>
  </ul>
  <p class="small">Sources : ${src(['fvActu', 'fvDemarche'])}.</p>
</section>
<section class="warn">
  <h2>Ce que nous ne ferons jamais</h2>
  <p>Fausse réservation, relevé bancaire « arrangé », fausse invitation, attestation de complaisance : ces pièces mènent au refus (motifs 1, 10 et 12 du formulaire officiel) et exposent à des poursuites. Le faux et l’usage de faux sont punis de 3 ans d’emprisonnement et de 45 000 € d’amende (Code pénal, art. 441-1). <a href="${BASE}faux-documents/">Voir les risques et les textes</a>.</p>
</section>
<section class="pack-teaser noprint">
  <h2>Pack dossier ${esc(p.name)}, ${esc(m.short)}</h2>
  <p>La même liste en PDF à imprimer, avec une colonne « original / copie / prêt », la checklist de l’hôte pour l’attestation d’accueil, un modèle de lettre de présentation, un modèle d’itinéraire et un calendrier de J-30 au rendez-vous. Le paiement peut être fait par l’hôte en France, par carte, en euros.</p>
  <p><a class="btn" href="${BASE}commander/?pays=${cc}&amp;motif=${mk}" data-mesure="cta_click">Commander le Pack, <span data-price>19</span> €</a> <a href="${BASE}pack/">Voir le contenu du Pack</a></p>
</section>
<section class="sources-mini"><h2>Sources de cette page</h2><p>${src(['assistant', 'codeVisas', 'fvFaq'])} ; <a href="${p.url}" rel="noopener">France-Visas, page ${esc(p.name)}</a>. Toutes vérifiées le ${VERIFIED}.</p>
<p class="small">Les listes peuvent changer. Avant le rendez-vous, comparez avec l’<a href="https://france-visas.gouv.fr/assistant-visa" rel="noopener">Assistant visa</a> : c’est la référence. Si votre situation sort de ces cas (mineur, passeport non ordinaire, autre nationalité), utilisez directement l’Assistant visa.</p></section>
`;
  const description = `${m.label}, dépôt ${p.of} : ${total} pièces de la liste officielle France-Visas, avec pourquoi chacune est demandée, les délais et les frais (${p.provider}). Vérifié le ${VERIFIED}.`;
  return { path: canonical, html: layout({ title, description, canonical, body, pageClass: 'checklist' }) };
}

function write(rel, html) {
  const file = path.join(OUT, rel.replace(BASE, ''), rel.endsWith('/') ? 'index.html' : '');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

// ---- build ----
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const urls = [];
const grid = [];
for (const cc of Object.keys(PAYS)) {
  const links = [];
  for (const mk of Object.keys(MOTIFS_SEJOUR)) {
    const pg = checklistPage(cc, mk);
    write(pg.path, pg.html); urls.push(pg.path);
    links.push(`<a href="${pg.path}">${esc(MOTIFS_SEJOUR[mk].label)}</a>`);
  }
  grid.push(`<li><b>${esc(PAYS[cc].name)}</b> ${links.join(' ')}</li>`);
}
const ctx = { BASE, VERIFIED, SOURCES, MOTIFS_REFUS, MOTIFS_SEJOUR, PAYS, PAYS_SLUG, MOTIF_SLUG, esc, src, grid: grid.join(''), ENDPOINT };
for (const pg of PAGES(ctx)) {
  write(pg.path, layout({ ...pg, canonical: pg.path }));
  if (!pg.noindex) urls.push(pg.path);
}
// static assets
for (const f of fs.readdirSync(path.join(ROOT, 'static'))) fs.copyFileSync(path.join(ROOT, 'static', f), path.join(OUT, f));
const appJs = fs.readFileSync(path.join(ROOT, 'static/app.js'), 'utf8').replace('__ENDPOINT__', ENDPOINT);
fs.writeFileSync(path.join(OUT, 'app.js'), appJs);
const mesure = fs.readFileSync(path.join(ROOT, 'static/mesure.js'), 'utf8').replace('__ENDPOINT__', ENDPOINT);
fs.writeFileSync(path.join(OUT, 'mesure.js'), mesure);
// 404 page lives at the repo root of the Pages site
fs.copyFileSync(path.join(OUT, '404', 'index.html'), path.join(OUT, '404.html'));
fs.rmSync(path.join(OUT, '404'), { recursive: true });
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.filter(u => !u.includes('404')).map(u => `<url><loc>${ORIGIN}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /pieces-en-ordre/\nDisallow: /pieces-en-ordre/merci/\nSitemap: ${ORIGIN}${BASE}sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log('built', urls.length, 'indexable pages');

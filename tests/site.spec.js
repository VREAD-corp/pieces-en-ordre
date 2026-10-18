import { test, expect } from '@playwright/test';
import fs from 'fs';
import os from 'os';

const LIVE = !!process.env.BASE_URL;
const PAYS = ['maroc', 'algerie', 'tunisie', 'senegal', 'cote-d-ivoire', 'cameroun'];
const MOTIFS = ['visite-familiale', 'tourisme', 'affaires', 'stage'];
const q = LIVE ? '?utm_medium=e2e-test&octave_notrack=1' : '?octave_notrack=1';
// Our runs never count as visits: octave_notrack=1 (remembered in localStorage) sends them to the "Exclus" counters.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => localStorage.setItem('octave_notrack', '1')); });

function watchErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}
async function noHScroll(page) {
  const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(sw).toBeLessThanOrEqual(cw + 1);
}

test('home: tool above the fold, independence and legal footer', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./' + q);
  await expect(page).toHaveTitle(/Pièces en ordre/);
  await expect(page.locator('h1')).toContainText('Visa court séjour pour la France');
  await expect(page.locator('#choisir select[name=pays]')).toBeVisible();
  await expect(page.locator('.indep')).toContainText('non affilié aux autorités');
  const foot = page.locator('footer');
  for (const t of ['READ FRANCE SAS', '988 741 773', 'contact@jalonel.com', 'non affilié aux autorités', 'pas un conseil juridique', 'Confidentialité (RGPD)', 'Conditions et avertissement']) await expect(foot).toContainText(t);
  await expect(foot.getByRole('link', { name: 'Une marque Jalonel' })).toHaveAttribute('href', 'https://jalonel.com/');
  await noHScroll(page);
  expect(errors).toEqual([]);
});

test('picker opens the right list; ticks persist on this device only', async ({ page }) => {
  await page.goto('./' + q);
  await page.selectOption('#choisir select[name=pays]', 'dz');
  await page.selectOption('#choisir select[name=motif]', 'famille');
  await page.click('#choisir button[type=submit]');
  await expect(page).toHaveURL(/\/algerie\/visite-familiale\/$/);
  await expect(page.locator('h1')).toContainText('Algérie');
  const items = page.locator('.item');
  await expect(items).toHaveCount(8);
  await expect(page.locator('.official').first()).toContainText('Photographie');
  await expect(page.getByText(/pré-réservation du billet aller-retour n.est pas requise/).first()).toBeVisible();
  await page.locator('.item input[type=checkbox]').nth(0).check();
  await page.locator('.item input[type=checkbox]').nth(2).check();
  await expect(page.locator('[data-done]')).toHaveText('2');
  await page.reload();
  await expect(page.locator('[data-done]')).toHaveText('2');
  await expect(page.locator('.item.ok')).toHaveCount(2);
  await page.click('[data-reset]');
  await expect(page.locator('[data-done]')).toHaveText('0');
  await expect(page.locator('[data-print]')).toBeVisible();
  await noHScroll(page);
});

test('all 24 lists render with official text, sources and dates', async ({ page }) => {
  test.slow();
  for (const p of PAYS) for (const m of MOTIFS) {
    const r = await page.goto(`${p}/${m}/${q}`);
    expect(r.status(), `${p}/${m}`).toBe(200);
    expect(await page.locator('.item').count(), `${p}/${m}`).toBeGreaterThanOrEqual(7);
    await expect(page.locator('.depot')).toContainText('vérifiée le 13/10/2026');
    await expect(page.locator('.warn')).toContainText('441-1');
    await expect(page.locator('.sources-mini')).toContainText('France-Visas');
    if (m === 'stage') await expect(page.locator('.variant')).toHaveCount(2);
  }
});

test('price test (cro.js OCTAVE_XP price): one price per tab, 19 or 29 €, same on every page', async ({ page }) => {
  await page.goto('pack/' + q);
  const variant = await page.evaluate(() => window.octaveCro.v('price'));
  expect(['a', 'b']).toContain(variant);
  const price = variant === 'b' ? '29' : '19';
  await expect(page.locator('html')).toHaveAttribute('data-xp-price', variant);
  for (const el of await page.locator('[data-price]').all()) await expect(el).toHaveText(price);
  await page.goto('maroc/tourisme/' + q);
  await expect(page.locator('[data-price]').first()).toHaveText(price);
  await page.goto('commander/' + q);
  await expect(page.locator('h1 [data-price]')).toHaveText(price);
  expect(await page.evaluate(() => sessionStorage.getItem('oxp_price'))).toBe(variant);
});

test('price test: ?prix=b forces 29 € for the tab, ?prix=a 19 €; the old per-browser key is removed', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('po_v', 'a'); } });
  await page.goto('pack/' + q + '&prix=b');
  await expect(page.locator('html')).toHaveAttribute('data-xp-price', 'b');
  for (const el of await page.locator('[data-price]').all()) await expect(el).toHaveText('29');
  expect(await page.evaluate(() => localStorage.getItem('po_v'))).toBeNull();
  await page.goto('hote/' + q);
  await expect(page.locator('[data-price]').first()).toHaveText('29');
  await page.goto('commander/' + q + '&prix=a');
  await expect(page.locator('h1 [data-price]')).toHaveText('19');
  expect(await page.evaluate(() => window.octaveCro.v('price'))).toBe('a');
});

test('every page loads cro.js (byte-identical, before the site scripts) with the price experiment', async ({ page, request }) => {
  const canonical = fs.readFileSync(new URL('../static/cro.js', import.meta.url));
  const src = await page.goto('./' + q).then(() => page.locator('script[src*="cro.js"]').getAttribute('src'));
  expect(Buffer.from(await (await request.get(new URL(src, page.url()).href)).body()).equals(canonical)).toBe(true);
  const docs = new URL('../docs/', import.meta.url).pathname;
  const files = fs.readdirSync(docs, { recursive: true }).filter((f) => f.endsWith('.html'));
  expect(files.length).toBeGreaterThan(30);
  for (const f of files) {
    const html = fs.readFileSync(docs + f, 'utf8');
    const i = html.indexOf('/cro.js?v=');
    expect(i, f).toBeGreaterThan(html.indexOf('window.OCTAVE_XP='));
    expect(html.indexOf('window.OCTAVE_XP='), f).toBeGreaterThan(0);
    expect(i, f).toBeLessThan(html.indexOf('/mesure.js'));
    expect(i, f).toBeLessThan(html.indexOf('/app.js'));
    expect(html, f).toMatch(/<script src="[^"]*cro\.js\?v=[0-9a-f]{8}" data-site="pieces-en-ordre" data-api="https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec" data-hosts="pieces-en-ordre\.jalonel\.com" data-cta="\[data-mesure=cta_click\]" defer><\/script>/);
  }
  const xp = await page.evaluate(() => window.OCTAVE_XP);
  expect(xp).toEqual([expect.objectContaining({ id: 'price', variants: ['a', 'b'], mode: 'tab', param: 'prix' })]);
  const re = new RegExp(xp[0].pages);
  for (const p of ['/', '/index.html', '/hote/', '/pack/', '/commander/', '/cameroun/stage/']) expect(re.test(p), p).toBe(true);
  for (const p of ['/refus/', '/confidentialite/', '/sources/', '/nope']) expect(re.test(p), p).toBe(false);
});

test('pack page shows real PDF pages and limits', async ({ page }) => {
  await page.goto('pack/' + q);
  for (const img of await page.locator('.pack-shots img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate(i => i.complete && i.naturalWidth > 100), { timeout: 15000 }).toBe(true);
  }
  await expect(page.locator('main')).toContainText('aucun modèle de recours');
  await noHScroll(page);
});

test('order page is an honest fake door: validation, consent, no passport data', async ({ page }) => {
  let posted = null;
  if (!LIVE) await page.route(/script\.google\.com\/macros/, async route => {
    const body = route.request().postData() || '';
    if (body.includes('"preorder"')) { posted = JSON.parse(body); return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"updated":false}' }); }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('commander/?pays=dz&motif=famille&role=hote&octave_notrack=1' + (LIVE ? '&utm_medium=e2e-test' : ''));
  await expect(page.locator('.note-box')).toContainText('Le paiement en ligne n’est pas encore ouvert');
  await expect(page.locator('select[name=country]')).toHaveValue('dz');
  await expect(page.locator('input[name=role][value=hote]')).toBeChecked();
  await expect(page.locator('form input[name*=passport i]')).toHaveCount(0);
  await page.fill('input[name=email]', 'pas-un-email');
  await page.click('#octave-pay button[type=submit]');
  await expect(page.locator('.form-msg')).toContainText('adresse e-mail');
  const email = `e2e-${Date.now()}@example.com`;
  await page.fill('input[name=email]', email);
  await page.click('#octave-pay button[type=submit]');
  await expect(page.locator('.form-msg')).toContainText('Cochez la case');
  await page.check('input[name=consent]');
  await page.click('#octave-pay button[type=submit]');
  await expect(page.locator('.form-msg')).toContainText('Rien n’a été débité', { timeout: 30000 });
  // cro.js goal: the successful pre-order counts once per tab for the price experiment (nothing is sent under octave_notrack=1).
  expect(await page.evaluate(() => sessionStorage.getItem('oxp_price_preorder'))).toBe('1');
  if (!LIVE) {
    expect(posted).toMatchObject({ action: 'preorder', email, country: 'dz', purpose: 'famille', role: 'hote', consent: true });
    expect(['a', 'b']).toContain(posted.variant);
    expect(posted.offer).toBe(posted.variant === 'b' ? 'pack-29' : 'pack-19');
    await expect(page.locator('.form-msg')).toContainText(posted.variant === 'b' ? '29 €' : '19 €');
  }
});

test('refusal page: official grounds and procedure, no appeal template', async ({ page }) => {
  await page.goto('refus/' + q);
  await expect(page.locator('.motifs-all li')).toHaveCount(16);
  const main = page.locator('main');
  for (const t of ['30 jours', 'sous-directeur des visas', 'tribunal administratif de Nantes', 'CRRV', 'BP 83609', 'art. 54']) await expect(main).toContainText(t);
  await expect(main).toContainText('Pourquoi nous ne vendons pas de modèle de recours');
});

test('fraud page cites the penal code', async ({ page }) => {
  await page.goto('faux-documents/' + q);
  for (const t of ['441-1', '441-6', '441-7', '45 000', 'Attention', 'intermédiaire']) await expect(page.locator('main')).toContainText(t);
});

test('every internal link answers 200', async ({ page, request }) => {
  test.slow();
  const seen = new Set();
  for (const start of ['./', 'algerie/visite-familiale/', 'pack/', 'refus/', 'hote/', 'sources/']) {
    await page.goto(start + q);
    const hrefs = await page.$$eval('a[href]', as => as.map(a => a.href).filter(h => h.startsWith(location.origin + '/')));
    for (const h of hrefs) {
      const u = h.split('#')[0];
      if (seen.has(u)) continue; seen.add(u);
      const r = await request.get(u);
      expect(r.status(), u).toBe(200);
    }
  }
  expect(seen.size).toBeGreaterThan(30);
});

test('sitemap, robots and IndexNow key are served', async ({ request }) => {
  const sm = await request.get('sitemap.xml');
  expect(sm.status()).toBe(200);
  const xml = await sm.text();
  expect((xml.match(/<loc>/g) || []).length).toBe(33);
  expect(xml).not.toContain('/commander/');
  expect((await request.get('robots.txt')).status()).toBe(200);
  const key = fs.readFileSync(new URL('../data/indexnow-key.txt', import.meta.url), 'utf8').trim();
  const k = await request.get(key + '.txt');
  expect(await k.text()).toBe(key);
  if (!LIVE) expect(fs.readFileSync(new URL('../docs/CNAME', import.meta.url), 'utf8').trim()).toBe('pieces-en-ordre.jalonel.com');
});

test.afterAll(async ({ request }) => {
  // Live runs: remove the rows written by the order test (test e-mails end with @example.com).
  if (!LIVE) return;
  const keyFile = os.homedir() + '/.config/octave/pieces-en-ordre-admin.key';
  if (!fs.existsSync(keyFile)) return;
  const ep = 'https://script.google.com/macros/s/' + JSON.parse(fs.readFileSync(new URL('../gas/.deployment.json', import.meta.url))).deploymentId + '/exec';
  await request.post(ep, { data: JSON.stringify({ action: 'purge_tests', key: fs.readFileSync(keyFile, 'utf8').trim() }), headers: { 'content-type': 'text/plain' } });
});

import { test, expect } from '@playwright/test';
import fs from 'fs';
import os from 'os';

const LIVE = !!process.env.BASE_URL;
const PAYS = ['maroc', 'algerie', 'tunisie', 'senegal', 'cote-d-ivoire', 'cameroun'];
const MOTIFS = ['visite-familiale', 'tourisme', 'affaires', 'stage'];
const q = LIVE ? '?utm_medium=e2e-test' : '';

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
  for (const t of ['READ FRANCE SAS', '988 741 773', 'octave@vread.fr', 'non affilié aux autorités', 'pas un conseil juridique', 'Confidentialité (RGPD)', 'Conditions et avertissement']) await expect(foot).toContainText(t);
  await noHScroll(page);
  expect(errors).toEqual([]);
});

test('picker opens the right list; ticks persist on this device only', async ({ page }) => {
  // The picker navigation drops the utm marker: switch tracking off for this test (Do Not Track).
  await page.addInitScript(() => Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' }));
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

test('price test: one price per visitor, 19 or 29 €, same on every page', async ({ page }) => {
  await page.goto('pack/' + q);
  const price = await page.locator('[data-price]').first().textContent();
  expect(['19', '29']).toContain(price);
  await page.goto('maroc/tourisme/' + q);
  await expect(page.locator('[data-price]').first()).toHaveText(price);
  await page.goto('commander/' + q);
  await expect(page.locator('h1 [data-price]')).toHaveText(price);
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
  await page.goto('commander/?pays=dz&motif=famille&role=hote' + (LIVE ? '&utm_medium=e2e-test' : ''));
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
  if (!LIVE) {
    expect(posted).toMatchObject({ action: 'preorder', email, country: 'dz', purpose: 'famille', role: 'hote', consent: true });
    expect(['pack-19', 'pack-29']).toContain(posted.offer);
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
    const hrefs = await page.$$eval('a[href]', as => as.map(a => a.href).filter(h => h.includes('/pieces-en-ordre/')));
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
});

test.afterAll(async ({ request }) => {
  // Live runs: remove the rows written by the order test (test e-mails end with @example.com).
  if (!LIVE) return;
  const keyFile = os.homedir() + '/.config/octave/pieces-en-ordre-admin.key';
  if (!fs.existsSync(keyFile)) return;
  const ep = 'https://script.google.com/macros/s/' + JSON.parse(fs.readFileSync(new URL('../gas/.deployment.json', import.meta.url))).deploymentId + '/exec';
  await request.post(ep, { data: JSON.stringify({ action: 'purge_tests', key: fs.readFileSync(keyFile, 'utf8').trim() }), headers: { 'content-type': 'text/plain' } });
});

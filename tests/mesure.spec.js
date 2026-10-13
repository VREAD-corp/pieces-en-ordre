// static/mesure.js in a fake browser (no page needed): crawlers, automated browsers, our tests and prerendered
// pages never count as visits; the user agent is never sent.
import { test, expect } from '@playwright/test';
import fs from 'fs';
import vm from 'vm';

const src = fs.readFileSync(new URL('../static/mesure.js', import.meta.url), 'utf8');
const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const GOOGLEBOT = 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.7390.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

function run({ ua = CHROME, webdriver = false, search = '', store = {}, prerendering = false, visibility = 'visible', dnt = '' } = {}) {
  const sent = [], listeners = {};
  const doc = {
    referrer: 'https://www.google.com/', prerendering, visibilityState: visibility,
    addEventListener: (k, f) => { (listeners[k] ||= []).push(f); }, removeEventListener: (k, f) => { listeners[k] = (listeners[k] || []).filter((g) => g !== f); },
  };
  const ls = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
  const ctx = {
    navigator: { userAgent: ua, webdriver, doNotTrack: dnt }, document: doc, localStorage: ls, innerWidth: 1200, URLSearchParams, JSON, Date, String,
    location: { hostname: 'outils.vread.fr', pathname: '/pieces-en-ordre/pack/', search },
    fetch: (u, o) => { sent.push(JSON.parse(o.body)); expect(o.credentials).toBe('omit'); return Promise.resolve(); },
  };
  ctx.window = ctx;
  vm.runInNewContext(src, ctx);
  const fire = (k) => (listeners[k] || []).slice().forEach((f) => f({}));
  return { sent, store, fire, doc };
}

test('mesure.js: bots, webdriver, octave_notrack and prerender are not visits', async ({}, info) => {
  test.skip(info.project.name !== 'desktop-1440', 'browser-independent, run once');
  let r = run();
  expect(r.sent.map((b) => b.event)).toEqual(['view', 'pack_view']);
  expect(r.sent.every((b) => !('excluded' in b) && b.v === 2)).toBe(true);
  expect(JSON.stringify(r.sent)).not.toContain('Chrome');
  expect(run({ webdriver: true }).sent.every((b) => b.excluded === 'webdriver')).toBe(true);
  expect(run({ ua: GOOGLEBOT }).sent.every((b) => b.excluded === 'bot')).toBe(true);
  expect(JSON.stringify(run({ ua: GOOGLEBOT }).sent)).not.toContain('Googlebot');
  expect(run({ ua: CHROME.replace('Chrome/', 'HeadlessChrome/') }).sent.every((b) => b.excluded === 'bot')).toBe(true);
  r = run({ search: '?octave_notrack=1' });
  expect(r.sent.length > 0 && r.sent.every((b) => b.excluded === 'notrack')).toBe(true);
  expect(r.store.octave_notrack).toBe('1');
  expect(run({ store: { octave_notrack: '1' } }).sent.every((b) => b.excluded === 'notrack')).toBe(true);
  r = run({ search: '?octave_notrack=0', store: { octave_notrack: '1' } });
  expect(r.sent.every((b) => !('excluded' in b)) && !('octave_notrack' in r.store)).toBe(true);
  expect(run({ dnt: '1' }).sent).toHaveLength(0);
  r = run({ prerendering: true });
  expect(r.sent).toHaveLength(0);
  r.fire('prerenderingchange');
  expect(r.sent.map((b) => b.event)).toEqual(['view', 'pack_view']);
  r = run({ visibility: 'prerender' });
  expect(r.sent).toHaveLength(0);
  r.doc.visibilityState = 'visible'; r.fire('visibilitychange'); r.fire('visibilitychange');
  expect(r.sent.filter((b) => b.event === 'view')).toHaveLength(1);
});

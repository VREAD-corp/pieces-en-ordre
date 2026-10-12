/**
 * Pièces en ordre: web app (READ FRANCE SAS). Standalone Apps Script, separate from octave-checkout.
 *
 * Actions (POST text/plain JSON, or GET with the same fields as query parameters):
 *   track        cookieless, anonymous daily counters (Stats tab), same pattern as octave-checkout Track.js
 *   preorder     "Pack dossier" fake door: e-mail + choices, with consent (Interest tab). No payment taken.
 *   rights       withdraw / erase / access request by e-mail (Requests tab)
 *   ping         health check
 *   summary      counts for the operator (admin key; never returns e-mails)
 *   purge_tests  deletes rows created by automated tests (admin key)
 *
 * Never collected: passport number, names of travellers, documents, dates of birth, IP (Apps Script never
 * sees it), user agent, cookies. The spreadsheet is created on first use; its id is kept in Script
 * Properties (SHEET_ID). Only scope: spreadsheets.
 */

var APP = {
  name: 'Pièces en ordre',
  tz: 'Europe/Paris',
  consentVersion: 'po-2026-10-13',
  adminHash: '7f32f5386d59fe764415d193e247fa972680c6fc8ab2db4446186bd6f049a140',
  sites: ['pieces-en-ordre'],
  events: ['view', 'cta_click', 'checklist_select', 'checklist_print', 'pack_view', 'order_view', 'order_submit', 'source_click'],
  ownHosts: ['outils.vread.fr', 'vread-corp.github.io'],
  offers: { 'pack-19': 19, 'pack-29': 29 },
  roles: ['demandeur', 'hote', 'autre'],
  countries: ['ma', 'dz', 'tn', 'sn', 'ci', 'cm', 'autre'],
  purposes: ['famille', 'tourisme', 'affaires', 'stage'],
  ratePerMin: 200,
  signupRatePerMin: 20,
};

var INTEREST_HEADER = ['created_at', 'updated_at', 'email', 'role', 'country', 'purpose', 'offer', 'price_eur', 'variant', 'consent_version', 'page', 'status', 'test'];
var REQUEST_HEADER = ['created_at', 'type', 'email_sha256', 'message', 'matched_rows', 'status', 'test'];
var STATS_HEADER = ['date', 'site', 'page', 'event', 'variant', 'source', 'medium', 'campaign', 'count', 'mobile', 'desktop', 'updated_at'];
var STATS_KEYS = 8;

function doGet(e) { return handle_(e, (e && e.parameter) || {}); }

function doPost(e) {
  var req = {};
  try { req = JSON.parse((e && e.postData && e.postData.contents) || '{}') || {}; } catch (err) { return json_({ ok: false, error: 'bad_json' }); }
  return handle_(e, req);
}

function handle_(e, req) {
  var action = String((e && e.parameter && e.parameter.action) || req.action || '');
  try {
    switch (action) {
      case 'track': return json_(track_(req));
      case 'preorder': return json_(preorder_(req));
      case 'rights': return json_(rights_(req));
      case 'summary': return json_(summary_(req));
      case 'purge_tests': return json_(purgeTests_(req));
      case 'reset_stats': return json_(resetStats_(req));
      case 'ping': return json_({ ok: true, app: 'pieces-en-ordre', consentVersion: APP.consentVersion });
      default: return json_({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    if (err && err.userError) return json_({ ok: false, error: err.code, field: err.field || '' });
    console.error(String(err && err.stack || err));
    return json_({ ok: false, error: 'server_error' });
  }
}

/** Run once from the editor (or let the first hit do it): creates the spreadsheet and logs its URL. */
function setup() { var ss = ss_(); tab_('Stats', STATS_HEADER); tab_('Interest', INTEREST_HEADER); tab_('Requests', REQUEST_HEADER); console.log(ss.getUrl()); return ss.getUrl(); }

/* ---------- helpers ---------- */

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function userError_(code, field) { var e = new Error(code); e.userError = true; e.code = code; e.field = field; return e; }
function now_() { return new Date(); }
function parisDate_(d) { return Utilities.formatDate(d, APP.tz, 'yyyy-MM-dd'); }
/** Text cell: a leading quote stops formula injection (=, +, -, @). */
function txt_(v) { var s = String(v === undefined || v === null ? '' : v); return /^[=+\-@]/.test(s) ? "'" + s : s; }
function cell_(v) { return v instanceof Date ? Utilities.formatDate(v, APP.tz, 'yyyy-MM-dd') : String(v); }
function sha256Hex_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}
function clean_(v, max) { return String(v === undefined || v === null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
function token_(v, max) { return String(v === undefined || v === null ? '' : v).toLowerCase().replace(/[^a-z0-9._ -]+/g, '').replace(/\s+/g, ' ').trim().slice(0, max); }
function oneOf_(v, list, field) { var s = String(v || ''); if (list.indexOf(s) < 0) throw userError_('bad_request', field); return s; }
function isTestEmail_(email) { return /@example\.(com|org)$/.test(email); }
function checkAdmin_(req) { if (!req.key || sha256Hex_(String(req.key)) !== APP.adminHash) throw userError_('forbidden'); }

function ss_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    id = props.getProperty('SHEET_ID');
    if (id) return SpreadsheetApp.openById(id);
    var ss = SpreadsheetApp.create('Pièces en ordre: intérêt Pack et mesure (READ FRANCE SAS)');
    ss.setSpreadsheetTimeZone(APP.tz);
    props.setProperty('SHEET_ID', ss.getId());
    return ss;
  } finally { lock.releaseLock(); }
}

function tab_(name, header) {
  var ss = ss_();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sh.setFrozenRows(1);
    var def = ss.getSheetByName('Sheet1') || ss.getSheetByName('Feuille 1');
    if (def && ss.getSheets().length > 1 && def.getLastRow() === 0) ss.deleteSheet(def);
  }
  return sh;
}

function rateOk_(bucket, max) {
  var cache = CacheService.getScriptCache();
  var k = 'rl:' + bucket + ':' + Math.floor(now_().getTime() / 60000);
  var n = Number(cache.get(k) || 0);
  if (n >= max) return false;
  cache.put(k, String(n + 1), 120);
  return true;
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw userError_('busy');
  try { return fn(); } finally { lock.releaseLock(); }
}

/* ---------- tracking (cookieless, anonymous daily counters) ---------- */

function trackPage_(page) {
  var p = String(page === undefined || page === null ? '' : page).slice(0, 300).toLowerCase().replace(/[?#].*$/, '');
  if (!/^\/[a-z0-9\/._%~-]*$/.test(p)) return null;
  if (p === '/pieces-en-ordre' || p.indexOf('/pieces-en-ordre/') === 0) p = p.slice('/pieces-en-ordre'.length) || '/';
  p = p.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/{2,}/g, '/');
  return p.slice(0, 80) || '/';
}

function validateTrack_(req) {
  var site = oneOf_(req.site, APP.sites, 'site');
  var event = oneOf_(req.event, APP.events, 'event');
  var page = trackPage_(req.page);
  if (page === null) throw userError_('bad_request', 'page');
  if (req.ts !== undefined && req.ts !== null && req.ts !== '') {
    var ts = Number(req.ts);
    if (!isFinite(ts) || Math.abs(ts - now_().getTime()) > 2 * 86400 * 1000) throw userError_('bad_request', 'ts');
  }
  var ref = String(req.ref_domain || '').toLowerCase().replace(/^www\./, '');
  if (ref && !/^[a-z0-9.-]{1,100}$/.test(ref)) ref = '';
  if (APP.ownHosts.indexOf(ref) >= 0) ref = '(interne)';
  var variant = req.variant === 'a' || req.variant === 'b' ? req.variant : '';
  return {
    date: parisDate_(now_()), site: site, page: page, event: event, variant: variant,
    source: token_(req.utm_source, 50) || ref || '(direct)',
    medium: token_(req.utm_medium, 30), campaign: token_(req.utm_campaign, 50),
    device: req.device === 'mobile' || req.device === 'desktop' ? req.device : '',
  };
}

function track_(req) {
  var hit = validateTrack_(req);
  if (!rateOk_('track', APP.ratePerMin)) return { ok: false, error: 'rate_limited' };
  withLock_(function () { incrementStat_(hit); });
  return { ok: true };
}

function incrementStat_(h) {
  var sh = tab_('Stats', STATS_HEADER);
  var key = [h.date, h.site, h.page, h.event, h.variant, h.source, h.medium, h.campaign].join('\u001f');
  var last = sh.getLastRow();
  var rowNum = 0;
  var n = Math.min(Math.max(last - 1, 0), 3000);
  if (n > 0) {
    var vals = sh.getRange(last - n + 1, 1, n, STATS_KEYS).getValues();
    for (var i = vals.length - 1; i >= 0; i--) {
      if (cell_(vals[i][0]) < h.date) break;
      if (vals[i].map(cell_).join('\u001f') === key) { rowNum = last - n + 1 + i; break; }
    }
  }
  var stamp = now_().toISOString();
  if (!rowNum) {
    sh.appendRow([txt_(h.date), h.site, txt_(h.page), h.event, h.variant, txt_(h.source), txt_(h.medium), txt_(h.campaign), 1, h.device === 'mobile' ? 1 : 0, h.device === 'desktop' ? 1 : 0, stamp]);
  } else {
    var c = sh.getRange(rowNum, STATS_KEYS + 1, 1, 3).getValues()[0];
    sh.getRange(rowNum, STATS_KEYS + 1, 1, 4).setValues([[Number(c[0] || 0) + 1, Number(c[1] || 0) + (h.device === 'mobile' ? 1 : 0), Number(c[2] || 0) + (h.device === 'desktop' ? 1 : 0), stamp]]);
  }
}

/* ---------- Pack dossier: fake door (interest only, nothing is charged) ---------- */

function validEmail_(v) {
  var s = clean_(v, 254).toLowerCase();
  if (!/^[a-z0-9._%+'-]+@[a-z0-9.-]+\.[a-z]{2,24}$/.test(s) || s.indexOf('..') >= 0) throw userError_('bad_request', 'email');
  return s;
}

function preorder_(req) {
  if (req.website) return { ok: true }; // honeypot: silently ignore bots
  if (req.consent !== true && req.consent !== 'true') throw userError_('consent_required', 'consent');
  if (String(req.consent_version || '') !== APP.consentVersion) throw userError_('consent_outdated', 'consent_version');
  var email = validEmail_(req.email);
  var offer = String(req.offer || '');
  if (!APP.offers.hasOwnProperty(offer)) throw userError_('bad_request', 'offer');
  var rec = {
    email: email,
    role: oneOf_(req.role || 'autre', APP.roles, 'role'),
    country: oneOf_(req.country || 'autre', APP.countries, 'country'),
    purpose: oneOf_(req.purpose, APP.purposes, 'purpose'),
    offer: offer, price: APP.offers[offer],
    variant: req.variant === 'a' || req.variant === 'b' ? req.variant : '',
    page: trackPage_(req.page) || '', test: isTestEmail_(email),
  };
  if (!rateOk_('signup', APP.signupRatePerMin)) throw userError_('rate_limited');
  var updated = withLock_(function () {
    var sh = tab_('Interest', INTEREST_HEADER);
    var stamp = now_().toISOString();
    var last = sh.getLastRow();
    var row = 0;
    if (last >= 2) {
      var emails = sh.getRange(2, 3, last - 1, 1).getValues();
      for (var i = emails.length - 1; i >= 0; i--) if (String(emails[i][0]) === email) { row = i + 2; break; }
    }
    var values = [txt_(rec.email), rec.role, rec.country, rec.purpose, rec.offer, rec.price, rec.variant, APP.consentVersion, txt_(rec.page), 'active', rec.test ? 'yes' : ''];
    if (row) { sh.getRange(row, 2, 1, 1 + values.length).setValues([[stamp].concat(values)]); return true; }
    sh.appendRow([stamp, stamp].concat(values));
    return false;
  });
  if (!rec.test) { try { withLock_(function () { incrementStat_({ date: parisDate_(now_()), site: 'pieces-en-ordre', page: '/commander/', event: 'order_submit', variant: rec.variant, source: '(serveur)', medium: '', campaign: '', device: '' }); }); } catch (e) { /* counter only */ } }
  return { ok: true, updated: updated };
}

/* ---------- data-subject requests (RGPD) ---------- */

function rights_(req) {
  if (req.website) return { ok: true };
  var type = oneOf_(req.type, ['withdraw', 'erase', 'access'], 'type');
  var email = validEmail_(req.email);
  var message = clean_(req.message, 1000);
  if (!rateOk_('rights', 20)) throw userError_('rate_limited');
  return withLock_(function () {
    var matched = 0;
    var sh = tab_('Interest', INTEREST_HEADER);
    var last = sh.getLastRow();
    if (last >= 2) {
      var em = sh.getRange(2, 3, last - 1, 1).getValues();
      for (var i = 0; i < em.length; i++) {
        if (String(em[i][0]) !== email) continue;
        matched++;
        if (type !== 'access') {
          sh.getRange(i + 2, 2, 1, 2).setValues([[now_().toISOString(), '(effacé) ' + sha256Hex_(email).slice(0, 16)]]);
          sh.getRange(i + 2, 12).setValue(type === 'erase' ? 'erased' : 'withdrawn');
        }
      }
    }
    var status = type === 'access' ? 'to_answer_by_email' : 'done_automatically';
    tab_('Requests', REQUEST_HEADER).appendRow([now_().toISOString(), type, sha256Hex_(email), txt_(message), matched, status, isTestEmail_(email) ? 'yes' : '']);
    return { ok: true, type: type, matched: matched > 0, status: status };
  });
}

/* ---------- operator views (admin key) ---------- */

function summary_(req) {
  checkAdmin_(req);
  var out = { ok: true, sheetUrl: ss_().getUrl(), interest: { real: 0, test: 0, active: 0, byOffer: {}, byRole: {}, byCountry: {}, byPurpose: {} }, requests: { real: 0, test: 0, open: 0 }, stats: {} };
  var su = tab_('Interest', INTEREST_HEADER);
  if (su.getLastRow() >= 2) su.getRange(2, 1, su.getLastRow() - 1, INTEREST_HEADER.length).getValues().forEach(function (r) {
    var test = r[12] === 'yes';
    out.interest[test ? 'test' : 'real']++;
    if (!test && r[11] === 'active') {
      out.interest.active++;
      [['byOffer', 6], ['byRole', 3], ['byCountry', 4], ['byPurpose', 5]].forEach(function (k) { out.interest[k[0]][r[k[1]]] = (out.interest[k[0]][r[k[1]]] || 0) + 1; });
    }
  });
  var rq = tab_('Requests', REQUEST_HEADER);
  if (rq.getLastRow() >= 2) rq.getRange(2, 1, rq.getLastRow() - 1, REQUEST_HEADER.length).getValues().forEach(function (r) {
    var test = r[6] === 'yes';
    out.requests[test ? 'test' : 'real']++;
    if (!test && r[5] === 'to_answer_by_email') out.requests.open++;
  });
  var st = tab_('Stats', STATS_HEADER);
  if (st.getLastRow() >= 2) st.getRange(2, 1, st.getLastRow() - 1, STATS_HEADER.length).getValues().forEach(function (r) {
    var k = cell_(r[0]) + ' ' + r[3] + (r[4] ? ' ' + r[4] : '');
    out.stats[k] = (out.stats[k] || 0) + Number(r[8] || 0);
  });
  if (req.email) out.hasEmail = su.getLastRow() >= 2 && su.getRange(2, 3, su.getLastRow() - 1, 1).getValues().some(function (r) { return String(r[0]) === String(req.email).toLowerCase(); });
  return out;
}

function purgeTests_(req) {
  checkAdmin_(req);
  return withLock_(function () {
    var n = 0;
    [['Interest', INTEREST_HEADER, 12], ['Requests', REQUEST_HEADER, 6]].forEach(function (t) {
      var sh = tab_(t[0], t[1]);
      for (var r = sh.getLastRow(); r >= 2; r--) if (sh.getRange(r, t[2] + 1).getValue() === 'yes') { sh.deleteRow(r); n++; }
    });
    var st = tab_('Stats', STATS_HEADER);
    for (var s = st.getLastRow(); s >= 2; s--) if (String(st.getRange(s, 7).getValue()) === 'e2e-test') { st.deleteRow(s); n++; }
    return { ok: true, deleted: n };
  });
}

/** Admin: deletes every Stats row (used once at launch, so the baseline starts at zero). Interest rows are kept. */
function resetStats_(req) {
  checkAdmin_(req);
  return withLock_(function () {
    var st = tab_('Stats', STATS_HEADER);
    var n = Math.max(st.getLastRow() - 1, 0);
    if (n) st.deleteRows(2, n);
    return { ok: true, deleted: n };
  });
}

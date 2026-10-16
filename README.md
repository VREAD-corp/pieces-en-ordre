# Pièces en ordre

Checklists des pièces du dossier de visa France court séjour (Maroc, Algérie, Tunisie, Sénégal, Côte d'Ivoire,
Cameroun ; visite familiale, tourisme, affaires, stage), reprises de l'Assistant visa France-Visas, avec la raison de
chaque pièce. Une marque Jalonel (Jalonel est une marque de READ FRANCE SAS).

Site : https://pieces-en-ordre.jalonel.com/
2026-10-16 : servi à la racine de pieces-en-ordre.jalonel.com (marque Jalonel). Ancienne adresse :
https://outils.vread.fr/pieces-en-ordre/ (redirection 301 de GitHub Pages).

- `npm run build` : génère `docs/` (GitHub Pages, branche main, dossier /docs), avec `CNAME` et la clé IndexNow
  (`data/indexnow-key.txt`, servie à la racine).
- `npm test` : contrôles cro.js / Cro.js puis Playwright (390 et 1440 px) sur `docs/` servi à la racine
  (`scripts/serve.mjs`, port 4317) ; `npm run test:live` sur le site en ligne.
- `gas/` : web app Apps Script autonome (compteurs d'audience sans cookie, formulaire d'intérêt Pack, droits RGPD) ;
  `gas/scripts/deploy.sh` pousse le code et redéploie le même identifiant (`gas/.deployment.json`). `ownHosts` accepte
  pieces-en-ordre.jalonel.com (anciens hôtes conservés, identifiant de site `pieces-en-ordre` inchangé).

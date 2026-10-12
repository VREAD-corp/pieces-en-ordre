// Hand-written pages. Each returns { path, title, description, body, noindex?, pageClass? }.
export function PAGES(c) {
  const { BASE, VERIFIED, SOURCES, MOTIFS_REFUS, MOTIFS_SEJOUR, PAYS, esc, src, grid, ENDPOINT } = c;
  const paysOptions = Object.entries(PAYS).map(([k, p]) => `<option value="${k}">${esc(p.name)}</option>`).join('');
  const motifOptions = Object.entries(MOTIFS_SEJOUR).map(([k, m]) => `<option value="${k}">${esc(m.label)}</option>`).join('');
  const DOSSIER_MOTIFS = [2, 3, 4, 10, 11, 12, 13, 16];
  const pages = [];

  pages.push({
    path: BASE,
    title: 'Pièces en ordre : checklist du dossier de visa court séjour France',
    description: `Checklist gratuite du dossier de visa court séjour pour la France, déposé au Maroc, en Algérie, en Tunisie, au Sénégal, en Côte d’Ivoire ou au Cameroun. Liste officielle France-Visas, pourquoi chaque pièce compte, vérifiée le ${VERIFIED}.`,
    pageClass: 'home',
    jsonld: `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Pièces en ordre', url: 'https://outils.vread.fr' + BASE, inLanguage: 'fr', publisher: { '@type': 'Organization', name: 'READ FRANCE SAS', email: 'octave@vread.fr' } })}</script>`,
    body: `
<div class="hero">
  <div>
    <h1>Visa court séjour pour la France : vérifiez votre dossier pièce par pièce avant le rendez-vous</h1>
    <p class="lede">Pour une demande déposée au Maroc, en Algérie, en Tunisie, au Sénégal, en Côte d’Ivoire ou au Cameroun. Nous avons relevé les 30 listes officielles de l’Assistant visa de France-Visas (6 pays, 5 motifs) le ${VERIFIED} et ajouté, pour chaque pièce, la raison pour laquelle le consulat la demande.</p>
    <form id="choisir" class="picker" action="${BASE}" method="get">
      <label>Pays où vous déposez la demande<select name="pays" required><option value="">Choisir</option>${paysOptions}</select></label>
      <label>Motif du séjour<select name="motif" required><option value="">Choisir</option>${motifOptions}</select></label>
      <button class="btn" type="submit" data-mesure="checklist_select">Afficher ma liste</button>
    </form>
    <p class="small">Gratuit, sans compte. Les cases que vous cochez restent sur votre téléphone : aucune donnée de passeport n’est demandée ni envoyée.</p>
  </div>
  <figure class="preview" aria-label="Extrait d’une liste">
    <figcaption>Extrait : Algérie, visite familiale</figcaption>
    <ol>
      <li><b>Ressources.</b> « Relevés de compte bancaire originaux des 3 derniers mois (émanant de la banque et non édités via internet), 3 derniers bulletins de paie… »<span>Pourquoi : moyens de subsistance, motifs de refus n° 3 et 4.</span></li>
      <li><b>Réservation billet A/R.</b> « La pré-réservation du billet aller-retour n’est pas requise pour les demandeurs de visas en Algérie. »<span>Au Maroc, elle est demandée.</span></li>
    </ol>
  </figure>
</div>

<section>
  <h2>Toutes les listes</h2>
  <ul class="grid">${grid}</ul>
</section>

<section class="two">
  <div>
    <h2>Ce que fait ce site</h2>
    <p>Il met en ordre les pièces demandées par la liste officielle pour votre pays de dépôt et votre motif, explique ce que chaque pièce prouve et renvoie au motif de refus correspondant dans le formulaire officiel (annexe VI du code des visas). Vous pouvez cocher et imprimer.</p>
  </div>
  <div>
    <h2>Ce qu’il ne fait pas</h2>
    <p>Pas de conseil juridique sur votre cas, pas de prise de rendez-vous, pas de dépôt, pas de vente de créneau, aucun lien avec France-Visas, les consulats, TLScontact, VFS Global ou Capago. Il ne garantit aucun visa : seul le consulat décide.</p>
  </div>
</section>

<section>
  <h2>Les motifs de refus du formulaire officiel</h2>
  <p>Un refus de visa est notifié sur un formulaire type qui comporte 17 cases (annexe VI du code des visas ; la 17e concerne l’abrogation à la demande du titulaire). ${DOSSIER_MOTIFS.length} d’entre elles portent directement sur le contenu du dossier :</p>
  <ul class="motif-list">${MOTIFS_REFUS.filter(([n]) => DOSSIER_MOTIFS.includes(n)).map(([n, t]) => `<li><b>n° ${n}</b> ${esc(t)}</li>`).join('')}</ul>
  <p>Les autres cases visent un faux passeport, la règle des 90 jours sur 180, un signalement Schengen ou une menace pour l’ordre public, la santé ou les relations internationales. <a href="${BASE}refus/">Le formulaire complet et les recours</a>.</p>
</section>

<section class="calendar">
  <h2>Le calendrier fixé par le code des visas</h2>
  <table>
    <tr><th scope="row">Dépôt au plus tôt</th><td>6 mois avant le début du voyage (art. 9)</td></tr>
    <tr><th scope="row">Dépôt au plus tard</th><td>en principe 15 jours calendaires avant (art. 9)</td></tr>
    <tr><th scope="row">Décision</th><td>15 jours calendaires, jusqu’à 45 jours si un examen approfondi est nécessaire (art. 23)</td></tr>
    <tr><th scope="row">Droits de visa</th><td>90 € par adulte, 45 € de 6 à moins de 12 ans, gratuit avant 6 ans (art. 16)</td></tr>
    <tr><th scope="row">Assurance</th><td>30 000 € minimum, tout l’espace Schengen, tout le séjour (art. 15)</td></tr>
  </table>
  <p class="small">Source : ${src(['codeVisas'])}. Les délais de rendez-vous propres à chaque pays figurent sur chaque liste.</p>
</section>

<section class="pack-teaser">
  <h2>Pack dossier : la version à imprimer, pour vous ou pour l’hôte qui paie</h2>
  <p>Un PDF par pays et par motif, la checklist de l’hôte (attestation d’accueil en mairie), un modèle de lettre de présentation, un modèle d’itinéraire et un calendrier de J-30 au rendez-vous. <a href="${BASE}pack/">Voir le contenu</a>.</p>
  <p><a class="btn" href="${BASE}commander/" data-mesure="cta_click">Commander le Pack, <span data-price>19</span> €</a></p>
</section>
`,
  });

  pages.push({
    path: BASE + 'hote/',
    title: 'Attestation d’accueil : la checklist de l’hôte en France',
    description: 'Vous recevez un proche venu avec un visa court séjour ? Les étapes officielles de l’attestation d’accueil en mairie : timbre fiscal de 30 €, cerfa n° 10798, pièces, délais et recours.',
    body: `
<h1>Vous accueillez un proche : l’attestation d’accueil, étape par étape</h1>
<p class="lede">Pour une visite familiale ou privée de moins de 3 mois chez un particulier, l’attestation d’accueil est obligatoire (FAQ France-Visas). C’est l’hôte qui la demande, à la mairie du lieu d’hébergement, avant la demande de visa. Étapes reprises de Service-public.fr (fiche vérifiée par la DILA le 21/10/2025), lues le ${VERIFIED}.</p>
<ol class="steps">
  <li><h2>Acheter le timbre fiscal de 30 €</h2><p>En ligne (timbre électronique : PDF à code 2D ou SMS à 16 chiffres) ou chez un buraliste équipé. Ne pas acheter un « timbre amende ». La taxe n’est pas remboursée si la mairie refuse.</p></li>
  <li><h2>Réunir les originaux</h2><ul>
    <li>Justificatif d’identité (titre de séjour si vous n’êtes pas Européen)</li>
    <li>Preuve que vous êtes propriétaire, locataire ou occupant du logement (titre de propriété, taxe foncière, bail avec dernières quittances…)</li>
    <li>Justificatifs de domicile récents (eau, électricité, téléphone, quittance)</li>
    <li>Justificatifs de ressources (3 derniers bulletins de salaire, dernier avis d’imposition)</li>
    <li>Tout document sur la capacité du logement à recevoir le visiteur (surface, sécurité, salubrité)</li>
    <li>Le justificatif de paiement du timbre</li>
    <li>Le numéro de passeport de chaque visiteur</li>
    <li>Pour un mineur non accompagné : attestation des détenteurs de l’autorité parentale (durée et objet du séjour)</li>
  </ul></li>
  <li><h2>Déposer en personne à la mairie</h2><p>Souvent sur rendez-vous. À Paris, Lyon et Marseille : mairie d’arrondissement. Le formulaire original (cerfa n° 10798) se remplit et se signe sur place ; votre présence est obligatoire. Un formulaire par visiteur ; le conjoint et les enfants mineurs peuvent figurer sur la même attestation.</p></li>
  <li><h2>Attendre l’instruction</h2><p>La mairie peut enquêter sur le logement ; un récépissé vous est alors remis. Sans réponse au bout d’1 mois, la demande est refusée implicitement.</p></li>
  <li><h2>Envoyer l’original au visiteur</h2><p>Le visiteur dépose l’original avec sa demande de visa : le consulat le tamponne. Une copie ne suffit pas.</p></li>
  <li><h2>En cas de refus</h2><p>Recours hiérarchique auprès du préfet dans les 2 mois, puis, si le préfet rejette (ou ne répond pas en 1 mois), recours devant le tribunal administratif.</p></li>
</ol>
<p class="note">L’assurance médicale de 30 000 € minimum peut être souscrite par le visiteur ou par vous. Si vous prenez en charge les frais du séjour, les listes officielles demandent en général une lettre de prise en charge avec vos propres justificatifs de ressources : vérifiez la liste du pays.</p>
<p class="small">Sources : ${src(['spAccueil', 'spAccueilForm', 'fvFaq'])}.</p>
<section class="warn"><h2>Attestation de complaisance</h2><p>Signer une attestation pour une personne que vous n’hébergerez pas, ou y porter des mentions inexactes, peut entraîner un refus de la mairie (« les mentions portées sur l’attestation sont inexactes ») et relève du Code pénal : établir ou utiliser une attestation faisant état de faits matériellement inexacts est puni d’un an d’emprisonnement et de 15 000 € d’amende (art. 441-7). ${src(['cp4417'])}.</p></section>
<section class="pack-teaser"><h2>Vous payez pour votre proche ?</h2><p>Le Pack dossier contient cette checklist en version imprimable, avec la liste du visiteur pour son pays. Paiement par carte, en euros.</p><p><a class="btn" href="${BASE}commander/?role=hote" data-mesure="cta_click">Commander le Pack, <span data-price>19</span> €</a></p></section>
`,
  });

  pages.push({
    path: BASE + 'refus/',
    title: 'Refus de visa court séjour France : motifs officiels et recours',
    description: 'Les 16 motifs du formulaire officiel de refus de visa et la procédure de recours pour un visa court séjour : Rapo au sous-directeur des visas sous 30 jours, puis tribunal administratif de Nantes.',
    body: `
<h1>Après un refus de visa court séjour : les motifs officiels et la procédure de recours</h1>
<p class="lede">Page d’information générale, à jour au ${VERIFIED}. Elle ne remplace pas la lecture de votre décision ni l’avis d’un avocat.</p>
<h2>Les motifs du formulaire officiel</h2>
<p>La décision est notifiée sur le formulaire type de l’annexe VI du code des visas. Les cases cochées indiquent le ou les motifs :</p>
<ol class="motifs-all">${MOTIFS_REFUS.map(([n, t]) => `<li id="motif-${n}" value="${n}">${esc(t)}</li>`).join('')}</ol>
<p class="small">Texte : ${src(['codeVisas'])}. La case 17 (abrogation demandée par le titulaire) n’est pas un refus.</p>

<h2>La procédure, dans l’ordre</h2>
<ol class="steps">
  <li><h3>Recours administratif préalable obligatoire (Rapo), sous 30 jours</h3><p>Pour un visa de court séjour, le recours s’adresse au <b>sous-directeur des visas</b> du ministère de l’Intérieur, dans un délai de 30 jours à compter de la notification du refus. Il doit être motivé, rédigé en français et signé. Il est obligatoire avant tout recours devant le juge. Adresse indiquée par France-Visas : BP 83609, 44036 Nantes Cedex 01.</p></li>
  <li><h3>Réponse du sous-directeur</h3><p>Il peut rejeter le recours ou demander au consulat de délivrer le visa. Sans réponse dans les 2 mois, le recours est rejeté implicitement.</p></li>
  <li><h3>Recours en annulation devant le tribunal administratif de Nantes, sous 2 mois</h3><p>À compter du rejet, explicite ou implicite, du Rapo. C’est le tribunal compétent pour les refus de visa.</p></li>
</ol>
<p>Pour un visa de <b>long séjour</b>, le recours préalable va à la Commission de recours contre les décisions de refus de visa (CRRV), à la même boîte postale. Sans décision dans les 2 mois après le dépôt de la demande, la demande de visa est elle-même considérée comme refusée et peut faire l’objet de ces recours. Les pages officielles consultées ne décrivent pas de recours gracieux auprès du consulat pour le court séjour : la voie indiquée est le Rapo.</p>
<p class="small">Sources : ${src(['spVisaC', 'fvFaq', 'codeVisas'])}.</p>

<section class="note-box">
  <h2>Pourquoi nous ne vendons pas de modèle de recours</h2>
  <p>Un Rapo doit répondre aux motifs de <em>votre</em> décision, avec <em>vos</em> pièces. Un texte pré-rédigé ne le fait pas, et rédiger ce recours pour autrui contre rémunération relève de la consultation juridique, réservée par la loi aux professions réglementées (loi n° 71-1130, art. 54 : ${src(['loi54'])}). Nous nous limitons donc à cette page d’information. Pour un avis sur votre cas : un avocat (<a href="https://www.avocat.fr/" rel="noopener">annuaire du Conseil national des barreaux</a>) ou un Point-justice, accès au droit gratuit (<a href="https://www.justice.fr/" rel="noopener">justice.fr</a>).</p>
</section>
<p>Les droits de visa ne sont pas remboursés en cas de refus (FAQ France-Visas). Avant toute nouvelle demande, relisez les cases cochées et comparez avec la <a href="${BASE}#choisir">liste de votre pays</a>.</p>
`,
  });

  pages.push({
    path: BASE + 'faux-documents/',
    title: 'Faux documents dans un dossier de visa : refus et sanctions pénales',
    description: 'Fausse réservation, relevé bancaire gonflé, fausse invitation, attestation de complaisance : ce que prévoient le code des visas et le Code pénal (art. 441-1, 441-6, 441-7).',
    body: `
<h1>Ce que vous risquez avec un faux document dans un dossier de visa</h1>
<p class="lede">Ce site n’aide pas à fabriquer, modifier ou « améliorer » une pièce. Voici pourquoi, avec les textes, lus le ${VERIFIED}.</p>
<h2>Les pratiques en cause</h2>
<ul>
  <li>Réservation d’hôtel ou de vol fabriquée, ou annulée juste après le dépôt sans le dire.</li>
  <li>Relevé bancaire retouché, ou solde gonflé par un dépôt prêté le temps du dossier.</li>
  <li>Lettre d’invitation, ordre de mission ou attestation de travail de complaisance.</li>
  <li>Attestation d’accueil signée par une personne qui n’hébergera pas le visiteur.</li>
  <li>« Rendez-vous garanti » ou « dossier accepté » vendus par un intermédiaire.</li>
</ul>
<h2>Côté visa, le refus</h2>
<p>Le code des visas impose le refus quand le document de voyage est faux ou falsifié, ou « s’il existe des doutes raisonnables sur l’authenticité des documents justificatifs présentés par le demandeur ou sur la véracité de leur contenu » (art. 32). Ce sont les cases 1, 10, 11 et 12 du formulaire de refus. Vos données biométriques (photo, empreintes) sont enregistrées dans le fichier Visabio (Service-public.fr).</p>
<h2>Côté pénal</h2>
<table>
  <tr><th scope="row">Faux et usage de faux (Code pénal, art. 441-1)</th><td>3 ans d’emprisonnement et 45 000 € d’amende</td></tr>
  <tr><th scope="row">Se faire délivrer indûment un document administratif par un moyen frauduleux (art. 441-6)</th><td>2 ans d’emprisonnement et 30 000 € d’amende</td></tr>
  <tr><th scope="row">Établir, falsifier ou utiliser une attestation faisant état de faits matériellement inexacts (art. 441-7)</th><td>1 an d’emprisonnement et 15 000 € d’amende ; 3 ans et 45 000 € notamment en vue d’obtenir un titre de séjour</td></tr>
</table>
<p class="small">Textes : ${src(['cp4411', 'cp4416', 'cp4417', 'codeVisas', 'spVisaC'])}.</p>
<h2>Les avertissements officiels</h2>
<ul>
  <li>France-Visas : « Les demandeurs de visa sont invités à faire preuve de prudence dans toutes les transactions avec les entreprises qui prétendent offrir leur assistance pour l’obtention de visas français. »</li>
  <li>Consulat général de France à Tunis : il « déconseille formellement aux demandeurs d’avoir recours à tout intermédiaire prétendant offrir des facilités non prévues par la réglementation française ».</li>
  <li>Cameroun : des escrocs se font passer pour des agents de l’ambassade et réclament des frais pour un certificat médical ; « Aucune autre pièce justificative ne peut être réclamée hors des guichets des services des visas. »</li>
</ul>
<p class="small">Sources : ${src(['fvActu'])} ; <a href="${PAYS.tn.url}" rel="noopener">France-Visas, Tunisie</a> ; <a href="${PAYS.cm.url}" rel="noopener">France-Visas, Cameroun</a>.</p>
<p>Si vos ressources sont modestes, ne les maquillez pas : les listes officielles prévoient la prise en charge par un proche, avec ses propres justificatifs. <a href="${BASE}#choisir">Retrouvez la liste de votre pays</a>.</p>
`,
  });

  pages.push({
    path: BASE + 'pack/',
    title: 'Pack dossier visa court séjour France : PDF à imprimer et modèles',
    description: 'Le Pack dossier : checklist PDF détaillée par pays et motif, checklist de l’hôte (attestation d’accueil), modèles de lettre de présentation et d’itinéraire, calendrier J-30. 19 € ou 29 €.',
    body: `
<h1>Pack dossier : votre liste en version imprimable, avec les modèles</h1>
<p class="lede">Un fichier par pays de dépôt et par motif (6 pays, 4 motifs). Il reprend la liste officielle de cette page et ajoute ce qu’il faut pour préparer le dossier sur papier. Prix : <b><span data-price>19</span> €</b>, paiement unique. L’hôte en France peut le payer par carte, en euros.</p>
<div class="pack-shots">
  <figure><img src="${BASE}pack-p1.png" width="595" height="842" loading="lazy" alt="Page 1 du Pack : couverture Algérie, visite familiale, mode d’emploi"><figcaption>Page de couverture (Algérie, visite familiale)</figcaption></figure>
  <figure><img src="${BASE}pack-p2.png" width="595" height="842" loading="lazy" alt="Page de checklist avec colonnes original, copie, prêt"><figcaption>La checklist : original, copie, prêt</figcaption></figure>
</div>
<h2>Ce que contient le Pack</h2>
<table class="contents">
  <tr><th scope="row">Checklist détaillée (PDF)</th><td>Chaque pièce de la liste officielle de votre pays, avec le texte France-Visas, ce qu’il faut vérifier sur le papier, la colonne original / copie / prêt et le motif de refus correspondant.</td></tr>
  <tr><th scope="row">Fiche pays</th><td>Prestataire, centres, frais de service, délais de rendez-vous, avertissements officiels.</td></tr>
  <tr><th scope="row">Checklist de l’hôte</th><td>L’attestation d’accueil en mairie, étape par étape (visite familiale et tourisme chez un particulier) ; la lettre d’invitation de l’entreprise (affaires) ; la convention de stage (stage).</td></tr>
  <tr><th scope="row">Lettre de présentation (modèle)</th><td>Un modèle neutre et factuel, à compléter avec vos seules informations vérifiables, en PDF et en .docx.</td></tr>
  <tr><th scope="row">Itinéraire de voyage (modèle)</th><td>Tableau jour par jour : ville, hébergement, pièce justificative jointe. PDF et .docx.</td></tr>
  <tr><th scope="row">Calendrier J-30</th><td>Ce qu’il faut lancer à J-30, J-21, J-14, J-7 et la veille du rendez-vous, avec les délais propres au pays.</td></tr>
</table>
<h2>Ce que le Pack ne contient pas</h2>
<p>Aucun conseil personnalisé, aucune relecture de vos pièces, aucun rendez-vous, aucune réservation et aucun modèle de recours. Il ne garantit pas la délivrance du visa. Il ne contient rien qui aide à produire une pièce inexacte.</p>
<p><a class="btn" href="${BASE}commander/" data-mesure="cta_click">Commander le Pack, <span data-price>19</span> €</a></p>
<p class="small">Vous pouvez aussi utiliser gratuitement les <a href="${BASE}#choisir">listes en ligne</a> : elles contiennent les mêmes pièces.</p>
`,
  });

  pages.push({
    path: BASE + 'commander/',
    title: 'Commander le Pack dossier',
    description: 'Commande du Pack dossier visa court séjour France.',
    noindex: true,
    pageClass: 'order',
    body: `
<h1>Commander le Pack dossier, <span data-price>19</span> €</h1>
<div class="note-box">
  <p><b>Le paiement en ligne n’est pas encore ouvert.</b> Nous mesurons d’abord l’intérêt pour ce Pack avant d’ouvrir la caisse. Si vous laissez votre adresse, vous recevrez un seul e-mail, à l’ouverture, au prix affiché ici. Rien n’est débité aujourd’hui.</p>
</div>
<form id="octave-pay" class="order-form" data-endpoint="${ENDPOINT}" novalidate>
  <label>Pays où la demande sera déposée<select name="country" required><option value="">Choisir</option>${paysOptions}<option value="autre">Autre pays</option></select></label>
  <label>Motif du séjour<select name="purpose" required><option value="">Choisir</option>${motifOptions}</select></label>
  <fieldset><legend>Vous êtes</legend>
    <label class="inline"><input type="radio" name="role" value="demandeur" checked> la personne qui demande le visa</label>
    <label class="inline"><input type="radio" name="role" value="hote"> l’hôte en France (je paie pour un proche)</label>
    <label class="inline"><input type="radio" name="role" value="autre"> autre</label>
  </fieldset>
  <label>Votre e-mail<input type="email" name="email" required autocomplete="email" inputmode="email"></label>
  <label class="hp" aria-hidden="true">Site web<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
  <label class="inline consent"><input type="checkbox" name="consent" required> J’accepte que READ FRANCE SAS conserve cet e-mail et mes deux choix ci-dessus pour me prévenir une fois de l’ouverture du Pack, puis les efface (au plus tard 6 mois après). <a href="${BASE}confidentialite/">Confidentialité</a></label>
  <p>Ne saisissez aucun numéro de passeport ni aucune information sur votre dossier : nous n’en avons pas besoin.</p>
  <button class="btn" type="submit">Être prévenu à l’ouverture</button>
  <p class="form-msg" role="status" aria-live="polite"></p>
</form>
<p class="small">En attendant, les <a href="${BASE}#choisir">listes en ligne</a> sont gratuites et imprimables.</p>
`,
  });

  pages.push({
    path: BASE + 'sources/',
    title: 'Sources officielles de Pièces en ordre',
    description: `Toutes les sources officielles utilisées, avec leur date de vérification (${VERIFIED}).`,
    body: `
<h1>Sources officielles et date de vérification</h1>
<p class="lede">Nous n’utilisons que des sources officielles. Chaque règle du site renvoie à l’une d’elles. Dernière vérification complète : ${VERIFIED}.</p>
<table class="srcs"><tr><th>Source</th><th>Vérifié le</th></tr>
${Object.values(SOURCES).map(s => `<tr><td><a href="${s.url}" rel="noopener">${esc(s.label)}</a></td><td>${s.date}</td></tr>`).join('\n')}
${Object.values(PAYS).map(p => `<tr><td><a href="${p.url}" rel="noopener">France-Visas, page pays ${esc(p.name)} (prestataire, frais, délais)</a></td><td>${VERIFIED}</td></tr>`).join('\n')}
</table>
<h2>Méthode</h2>
<p>Les 30 listes de pièces (Maroc, Algérie, Tunisie, Sénégal, Côte d’Ivoire, Cameroun ; visite familiale, tourisme, voyage professionnel, stage salarié, stage étudiant) ont été lues dans l’Assistant visa de France-Visas le ${VERIFIED} avec ces réponses : nationalité et résidence dans le pays, 35 ans, passeport ordinaire, court séjour, destination France métropolitaine, ni conjoint de Français ni membre de famille d’un Européen. Le texte officiel est reproduit tel quel ; les explications « Pourquoi on vous la demande » sont de nous et renvoient au code des visas. Les contenus de France-Visas sont publiés sous licence etalab-2.0.</p>
<p>Une erreur, un changement de liste ? Écrivez à <a href="mailto:octave@vread.fr">octave@vread.fr</a>.</p>
`,
  });

  pages.push({
    path: BASE + 'mentions-legales/',
    title: 'Mentions légales',
    description: 'Éditeur, hébergeur et propriété intellectuelle du site Pièces en ordre (READ FRANCE SAS).',
    body: `
<h1>Mentions légales</h1>
<h2>Éditeur</h2>
<p>READ FRANCE SAS, société par actions simplifiée au capital de 1 000 €<br>Siège social : 11 rue Rouvet, 75019 Paris, France<br>SIREN 988 741 773, RCS Paris<br>TVA non applicable, art. 293 B du CGI<br>Directeur de la publication : Tanguy Warsmann, président<br>Contact : <a href="mailto:octave@vread.fr">octave@vread.fr</a></p>
<p class="small">Données d’identification issues de l’annuaire des entreprises (recherche-entreprises.api.gouv.fr), consulté le ${VERIFIED}.</p>
<h2>Hébergeur</h2>
<p>GitHub, Inc. (GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.</p>
<h2>Indépendance</h2>
<p>« Pièces en ordre » est un service indépendant. Il n’est ni édité, ni validé, ni approuvé par le ministère de l’Europe et des Affaires étrangères, le ministère de l’Intérieur, France-Visas, une ambassade ou un consulat, ni par TLScontact, VFS Global ou Capago. Il n’utilise aucun logo ni emblème officiel.</p>
<h2>Propriété intellectuelle</h2>
<p>Les explications, la mise en forme et les modèles sont des créations de READ FRANCE SAS. Les listes de pièces reproduites proviennent de France-Visas (licence etalab-2.0) ; les textes juridiques cités sont accessibles sur Légifrance et EUR-Lex.</p>
<h2>Rédaction</h2>
<p>Les contenus sont préparés avec l’aide d’Octave, assistant IA de READ FRANCE SAS, à partir des sources listées sur la page <a href="${BASE}sources/">Sources</a>, sous la responsabilité éditoriale du directeur de la publication.</p>
`,
  });

  pages.push({
    path: BASE + 'confidentialite/',
    title: 'Confidentialité (RGPD)',
    description: 'Données traitées par Pièces en ordre : mesure d’audience anonyme sans cookie, e-mail laissé volontairement pour l’ouverture du Pack.',
    body: `
<h1>Confidentialité</h1>
<p class="lede">Responsable du traitement : READ FRANCE SAS, 11 rue Rouvet, 75019 Paris, <a href="mailto:octave@vread.fr">octave@vread.fr</a>.</p>
<h2>Ce que nous ne collectons pas</h2>
<p>Aucun document, aucun numéro de passeport, aucune date de naissance, aucun nom de voyageur. Les listes fonctionnent dans votre navigateur : les cases cochées sont gardées sur votre appareil (stockage local du navigateur) et ne nous sont jamais envoyées. Aucun cookie, aucun traceur publicitaire.</p>
<h2>Mesure d’audience anonyme</h2>
<p>À chaque page vue et à quelques clics (choix d’une liste, impression, bouton du Pack), le navigateur envoie un compteur sans identifiant : page, événement, site d’origine, paramètres de campagne, type d’écran (mobile ou ordinateur), variante de prix affichée. Ces compteurs sont additionnés par jour dans un tableur Google (Google LLC, sous-traitant) ; votre adresse IP n’y est pas enregistrée. Rien n’est envoyé si votre navigateur active « Do Not Track » ou « Global Privacy Control ». Base légale : intérêt légitime (mesurer l’usage du service), sans consentement nécessaire car aucune information n’est lue ni déposée sur votre appareil à cette fin.</p>
<h2>E-mail laissé pour l’ouverture du Pack</h2>
<p>Si vous remplissez le formulaire de commande : e-mail, pays, motif, rôle (demandeur ou hôte), offre et prix affichés. Finalité : vous prévenir une fois de l’ouverture du paiement. Base légale : votre consentement, que vous pouvez retirer à tout moment. Conservation : 6 mois au plus. Destinataires : READ FRANCE SAS ; hébergement chez Google (Google Sheets), avec des transferts hors UE encadrés par les clauses contractuelles types de Google.</p>
<h2>Vos droits</h2>
<p>Accès, rectification, effacement, retrait du consentement, limitation, opposition : écrivez à <a href="mailto:octave@vread.fr">octave@vread.fr</a> depuis l’adresse concernée. Vous pouvez saisir la CNIL (cnil.fr).</p>
`,
  });

  pages.push({
    path: BASE + 'conditions/',
    title: 'Conditions d’utilisation et avertissement',
    description: 'Conditions d’utilisation de Pièces en ordre, avertissement (pas de conseil juridique) et conditions de vente du Pack.',
    body: `
<h1>Conditions d’utilisation et avertissement</h1>
<h2>Avertissement</h2>
<p>Pièces en ordre est un outil de documentation en libre-service. Il présente des informations générales tirées de sources officielles. Ce n’est pas un conseil juridique, ni une représentation, ni un service de rendez-vous. En France, donner des consultations juridiques ou rédiger des actes pour autrui à titre habituel et rémunéré est réservé aux professions réglementées (loi n° 71-1130 du 31 décembre 1971, art. 54). La décision sur un visa appartient au seul consulat ; nous ne garantissons aucun résultat. Vérifiez toujours la liste à jour dans l’<a href="https://france-visas.gouv.fr/assistant-visa" rel="noopener">Assistant visa</a>.</p>
<h2>Service indépendant</h2>
<p>Service indépendant, non affilié aux autorités françaises, à France-Visas, aux consulats, à TLScontact, VFS Global ou Capago.</p>
<h2>Usage interdit</h2>
<p>Il est interdit d’utiliser ce service ou ses modèles pour produire une pièce fausse ou inexacte. Nous n’apportons aucune aide en ce sens.</p>
<h2>Pack dossier : conditions de vente (applicables à l’ouverture du paiement)</h2>
<ul>
  <li>Vendeur : READ FRANCE SAS. Prix en euros, TVA non applicable (art. 293 B du CGI), payable en une fois par carte.</li>
  <li>Livraison : lien de téléchargement envoyé par e-mail après paiement.</li>
  <li>Droit de rétractation : contenu numérique fourni sans support matériel. En commandant, l’acheteur demande l’accès immédiat et reconnaît perdre son droit de rétractation dès le début du téléchargement (Code de la consommation, art. L221-28, 13°).</li>
  <li>Si le fichier livré ne correspond pas au pays ou au motif commandé, écrivez à <a href="mailto:octave@vread.fr">octave@vread.fr</a> : nous envoyons le bon fichier ou nous remboursons.</li>
  <li>Le Pack ne garantit pas la délivrance d’un visa ; un refus ne donne pas lieu à remboursement.</li>
</ul>
<p class="small">Aujourd’hui, le paiement n’est pas ouvert : la page de commande enregistre seulement, avec votre accord, l’e-mail à prévenir.</p>
`,
  });

  pages.push({
    path: BASE + '404/',
    title: 'Page introuvable',
    description: 'Cette page n’existe pas.',
    noindex: true,
    body: `<h1>Page introuvable</h1><p>Retour à la <a href="${BASE}">liste des pays et des motifs</a>.</p>`,
  });
  return pages;
}

// Editorial layer of « Pièces en ordre » (READ FRANCE SAS). Every rule comes from an official page,
// read on 13/10/2026 and listed in SOURCES. The official wording of each document (France-Visas,
// « Assistant visa », licence etalab-2.0) is kept verbatim in data/official.json.

export const VERIFIED = '13/10/2026';

export const SOURCES = {
  assistant: { label: 'France-Visas, « Assistant visa » (liste des justificatifs par pays et motif)', url: 'https://france-visas.gouv.fr/assistant-visa', date: VERIFIED },
  fvFaq: { label: 'France-Visas, questions fréquentes (frais, assurance, ressources, refus)', url: 'https://france-visas.gouv.fr/faq', date: VERIFIED },
  fvDemarche: { label: 'France-Visas, « La démarche d’obtention de visa » (5 étapes)', url: 'https://france-visas.gouv.fr/la-demarche', date: VERIFIED },
  fvActu: { label: 'France-Visas, actualités (« Attention aux sites frauduleux », jour du rendez-vous)', url: 'https://france-visas.gouv.fr/actualites', date: VERIFIED },
  fvAffaires: { label: 'France-Visas, « Voyage d’affaires »', url: 'https://france-visas.gouv.fr/voyage-d-affaires', date: VERIFIED },
  codeVisas: { label: 'Règlement (CE) n° 810/2009 (code des visas), version consolidée du 11/06/2024 : art. 9, 12, 14, 15, 16, 17, 23, 32 et annexe VI', url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:02009R0810-20240611', date: VERIFIED },
  commission: { label: 'Commission européenne, « Applying for a Schengen visa » (90 €, 45 €, 15 jours, 6 mois)', url: 'https://home-affairs.ec.europa.eu/policies/schengen/visa-policy/applying-schengen-visa_en', date: VERIFIED },
  spVisaC: { label: 'Service-public.fr, « Visa de court séjour Schengen » (refus, Rapo, tribunal administratif de Nantes), vérifié par la DILA le 13/08/2026', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F16146', date: VERIFIED },
  spAccueil: { label: 'Service-public.fr, « Attestation d’accueil » (timbre de 30 €, cerfa n° 10798, recours), vérifié par la DILA le 21/10/2025', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2191', date: VERIFIED },
  spAccueilForm: { label: 'Service-public.fr, « Demande d’attestation d’accueil » (cerfa n° 10798)', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/R10751', date: VERIFIED },
  spEes: { label: 'Service-public.fr, système européen d’entrée/sortie (EES), vérifié par la DILA le 10/04/2026', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F39104', date: VERIFIED },
  cp4411: { label: 'Code pénal, article 441-1 (faux et usage de faux)', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006418753', date: VERIFIED },
  cp4416: { label: 'Code pénal, article 441-6 (document administratif obtenu par fraude)', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000028394775', date: VERIFIED },
  cp4417: { label: 'Code pénal, article 441-7 (attestation inexacte ou falsifiée)', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037398925', date: VERIFIED },
  loi54: { label: 'Loi n° 71-1130 du 31 décembre 1971, article 54 (consultation juridique réservée)', url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000039280601', date: VERIFIED },
  calc: { label: 'Commission européenne, calculatrice de séjour de courte durée (90/180 jours)', url: 'https://ec.europa.eu/assets/home/visa-calculator/calculator.htm?lang=fr', date: VERIFIED },
};

// The 16 grounds of the standard refusal form (code des visas, annexe VI). Ground 17 (abrogation at
// the holder's request) is left out: it is not a refusal.
export const MOTIFS_REFUS = [
  [1, 'le document de voyage présenté est faux/falsifié'],
  [2, 'l’objet et les conditions du séjour envisagé n’ont pas été justifiés'],
  [3, 'vous n’avez pas fourni la preuve que vous disposez de moyens de subsistance suffisants pour la durée du séjour envisagé ou de moyens pour le retour dans le pays d’origine ou de résidence, ou pour le transit vers un pays tiers dans lequel votre admission est garantie'],
  [4, 'vous n’avez pas fourni la preuve que vous êtes en mesure d’acquérir légalement des moyens de subsistance suffisants pour la durée du séjour envisagé ou pour le retour dans le pays d’origine ou de résidence, ou pour le transit vers un pays tiers dans lequel votre admission est garantie'],
  [5, 'vous avez déjà séjourné sur le territoire des États membres pendant 90 jours au cours de la période de 180 jours en cours sur la base d’un visa uniforme ou d’un visa à validité territoriale limitée'],
  [6, 'vous avez fait l’objet d’un signalement aux fins de non-admission dans le système d’information Schengen (SIS) par … (mentionner l’État membre)'],
  [7, 'un ou plusieurs États membres estiment que vous représentez une menace pour l’ordre public ou la sécurité intérieure'],
  [8, 'un ou plusieurs États membres estiment que vous représentez une menace pour la santé publique, au sens de l’article 2, point 21), du règlement (UE) 2016/399 (code frontières Schengen)'],
  [9, 'un ou plusieurs États membres estiment que vous représentez une menace pour leurs relations internationales'],
  [10, 'les informations communiquées pour justifier l’objet et les conditions du séjour envisagé ne sont pas fiables'],
  [11, 'il existe des doutes raisonnables quant à la fiabilité des déclarations faites concernant … (à préciser)'],
  [12, 'il existe des doutes raisonnables quant à la fiabilité, à l’authenticité des documents justificatifs présentés ou à la véracité de leur contenu'],
  [13, 'il existe des doutes raisonnables quant à votre volonté de quitter le territoire des États membres avant l’expiration du visa'],
  [14, 'vous n’avez pas présenté d’éléments suffisants pour attester que vous n’avez pas été en mesure de demander un visa à l’avance, justifiant une demande de visa à la frontière'],
  [15, 'l’objet et les conditions du transit aéroportuaire envisagé n’ont pas été justifiés'],
  [16, 'vous n’avez pas présenté d’éléments attestant que vous possédez une assurance maladie en voyage adéquate et valable'],
];

// Why each official document is asked for, and which refusal grounds it answers. Keyed by the short
// title used by the France-Visas assistant. `check` lists what to verify on the paper itself.
export const POURQUOI = {
  'Photographie': {
    why: 'Le consulat compare la photo à votre visage et à vos empreintes (identifiants biométriques, art. 13 du code des visas). Une photo hors norme bloque le dépôt.',
    check: ['Photo récente et ressemblante', 'Largeur entre 35 et 40 mm, visage de 32 à 36 mm du menton au sommet du crâne (norme OACI, FAQ France-Visas)'],
    motifs: [], src: ['fvFaq'],
  },
  'Note verbale': { cond: 'Seulement avec un passeport diplomatique, de service ou officiel.', why: 'Pièce propre aux passeports officiels.', motifs: [], src: ['assistant'] },
  'Preuve résidence': { cond: 'Seulement si vous n’avez pas la nationalité du pays où vous déposez.', why: 'Vous déposez dans le pays où vous résidez légalement (FAQ France-Visas). Le titre de séjour prouve ce lien.', motifs: [], src: ['fvFaq', 'assistant'] },
  'Document voyage': {
    why: 'Sans passeport valable, la demande n’est pas recevable. Le code des visas (art. 12) fixe trois conditions : validité de 3 mois après la date de sortie prévue de l’espace Schengen, au moins deux pages vierges, délivrance depuis moins de 10 ans.',
    check: ['Date d’expiration postérieure d’au moins 3 mois à votre date de retour', 'Passeport délivré il y a moins de 10 ans', 'Au moins 2 pages vierges', 'Copie de la page d’identité et de toutes les pages avec visas ou cachets'],
    motifs: [1], src: ['codeVisas', 'assistant'],
  },
  'Lien parenté hôte': {
    why: 'Il rattache la visite à une personne précise en France. Le consulat vérifie que l’objet du séjour est réel (motifs 2 et 10).',
    check: ['Actes d’état civil ou livret de famille qui relient votre nom à celui de l’hôte', 'Noms écrits de la même façon que sur le passeport et l’attestation d’accueil'],
    motifs: [2, 10], src: ['assistant', 'codeVisas'],
  },
  'Réservation billet A/R': {
    why: 'Les dates du billet bornent le séjour. Elles doivent correspondre à l’assurance, à l’attestation d’accueil ou à l’hôtel et à votre congé. Un écart de dates nourrit les motifs 2 et 13.',
    check: ['Mêmes dates d’aller et de retour sur tous les documents', 'Réservation réelle émise par une compagnie ou une agence : jamais un document fabriqué'],
    motifs: [2, 13], src: ['assistant', 'codeVisas'],
  },
  'Situation professionnelle': {
    why: 'Emploi, commerce, études ou pension montrent ce qui vous attend au retour. C’est la réponse aux doutes sur la volonté de quitter l’espace Schengen avant la fin du visa (motif 13) et sur l’origine légale de vos moyens (motif 4).',
    check: ['Attestation de travail et de congé couvrant les dates du voyage', 'Documents d’affiliation sociale cités pour votre pays (CNSS, CNAS, CASNOS, CNPS selon le cas)', 'Pièces datées de moins de 3 mois quand c’est possible'],
    motifs: [4, 13], src: ['assistant', 'codeVisas'],
  },
  'Ressources': {
    why: 'Le consulat vérifie que vous pouvez payer le séjour et le retour (motifs 3 et 4). Les relevés doivent refléter vos opérations réelles : un solde gonflé pour l’occasion relève du motif 12 et peut constituer un faux (Code pénal, art. 441-1).',
    check: ['Relevés des 3 derniers mois, émis par la banque', 'Bulletins de paie ou de pension des 3 derniers mois', 'Si un proche paie : sa lettre de prise en charge et ses propres justificatifs de revenus'],
    motifs: [3, 4, 12], src: ['assistant', 'fvFaq', 'codeVisas', 'cp4411'],
  },
  'Hébergement': {
    why: 'L’adresse en France fait partie des « conditions du séjour » (motif 2). Chez un particulier, c’est l’attestation d’accueil validée par la mairie. À défaut, une réservation d’hôtel, un bail ou un titre de propriété.',
    check: ['Attestation d’accueil en original si vous logez chez un particulier', 'Dates d’hébergement identiques à celles du billet'],
    motifs: [2, 10], src: ['assistant', 'spAccueil'],
  },
  'Attestation accueil': {
    why: 'Pour une visite privée ou familiale chez un particulier, l’attestation d’accueil est obligatoire (FAQ France-Visas). Le consulat la tamponne : il faut l’original. C’est l’hôte qui la demande à sa mairie.',
    check: ['Original validé par la mairie (cerfa n° 10798)', 'Votre numéro de passeport inscrit dessus', 'Dates d’arrivée et de départ cohérentes avec le billet'],
    motifs: [2, 10], src: ['fvFaq', 'spAccueil'],
  },
  'Assurance médicale': {
    why: 'Exigée par l’article 15 du code des visas : au moins 30 000 € pour le rapatriement médical, les soins urgents et l’hospitalisation, valable dans tout l’espace Schengen pendant tout le séjour. Son absence est le motif 16.',
    check: ['Plafond de 30 000 € au minimum', 'Validité couvrant chaque jour du séjour', 'Couverture de tout l’espace Schengen'],
    motifs: [16], src: ['codeVisas', 'fvFaq'],
  },
  'Invitation': {
    why: 'Pour un voyage d’affaires, vous devez justifier le lien entre votre activité et le voyage (France-Visas). La lettre de l’entreprise française précise activité, motif, durée et lieu.',
    check: ['Lettre ou convocation avec nom et adresse de l’entreprise, dates, motif, lieu', 'Ordre de mission de votre employeur', 'Le cas échéant : prise en charge des frais, carte d’entrée au salon'],
    motifs: [2, 10], src: ['fvAffaires', 'assistant'],
  },
  'Convention stage': {
    why: 'Pour un stage, la convention signée par les parties définit l’objet, les dates et le lieu du séjour (motif 2).',
    check: ['Convention signée par toutes les parties citées dans la liste officielle', 'Dates de stage identiques à celles du billet et de l’hébergement'],
    motifs: [2, 10], src: ['assistant'],
  },
  'Réservation voyage': {
    why: 'Le programme montre ce que vous ferez en France (motif 2). Un voyage organisé ou un itinéraire daté suffit selon la liste officielle.',
    check: ['Itinéraire daté, ville par ville', 'Hébergement prévu pour chaque nuit'],
    motifs: [2], src: ['assistant'],
  },
};

export const MOTIFS_SEJOUR = {
  famille: { label: 'Visite familiale', short: 'famille', files: ['famille'] },
  tourisme: { label: 'Tourisme ou visite privée', short: 'tourisme', files: ['tourisme'] },
  affaires: { label: 'Voyage d’affaires', short: 'affaires', files: ['affaires'] },
  stage: { label: 'Stage ou formation courte', short: 'stage', files: ['stage-salarie', 'stage-etudiant'], variants: { 'stage-salarie': 'Vous êtes salarié (stage salarié)', 'stage-etudiant': 'Vous êtes étudiant (stage étudiant)' } },
};

// Country facts from the France-Visas country pages (lieu de dépôt), read on 13/10/2026.
export const PAYS = {
  ma: {
    from: 'du Maroc', adj: 'marocain', name: 'Maroc', of: 'au Maroc', url: 'https://france-visas.gouv.fr/maroc',
    provider: 'TLScontact', centres: 'Agadir, Casablanca, Fès, Marrakech, Oujda, Rabat, Tanger',
    providerUrl: 'https://fr.tlscontact.com/visa/ma',
    decide: 'Consulats généraux de France à Casablanca et à Rabat',
    service: 'environ 258 MAD par dossier, en espèces au centre',
    delay: 'Instruction de 7 à 10 jours minimum, jusqu’à 3 semaines en haute saison. Rendez-vous à prendre au minimum 15 jours avant le départ.',
    notes: [],
  },
  dz: {
    from: 'd’Algérie', adj: 'algérien', name: 'Algérie', of: 'en Algérie', url: 'https://france-visas.gouv.fr/algerie',
    provider: 'Capago', centres: 'Alger, Oran, Annaba, Constantine',
    providerUrl: 'https://fr-dz.capago.eu/',
    decide: 'Consulats généraux de France à Alger, Annaba et Oran',
    service: 'l’équivalent de 29 € en monnaie locale, payé à la prise de rendez-vous',
    delay: 'Déposez au minimum un mois avant le départ. Le délai de rendez-vous est d’environ 1 mois, plus long de juin à novembre.',
    notes: [
      'La page officielle précise : « Les dossiers incomplets ou non conformes aux exigences seront refusés. »',
      'Enfant né en France de moins de cinq ans : attestation de non-dette de l’hôpital de naissance et justificatifs de paiement des frais hospitaliers, sous peine de refus (page pays France-Visas).',
    ],
  },
  tn: {
    from: 'de Tunisie', adj: 'tunisien', name: 'Tunisie', of: 'en Tunisie', url: 'https://france-visas.gouv.fr/tunisie',
    provider: 'TLScontact', centres: 'Tunis, Sfax',
    providerUrl: 'https://visas-fr.tlscontact.com/fr-fr/country/tn/vac/tnTUN2fr',
    decide: 'Consulat général de France à Tunis',
    service: '28 € par dossier, perçus en dinars, en espèces au centre',
    delay: 'Le consulat recommande de demander un rendez-vous dès que vous connaissez vos dates.',
    notes: ['Le consulat général « déconseille formellement aux demandeurs d’avoir recours à tout intermédiaire prétendant offrir des facilités non prévues par la réglementation française » (page pays France-Visas).'],
  },
  sn: {
    from: 'du Sénégal', adj: 'sénégalais', name: 'Sénégal', of: 'au Sénégal', url: 'https://france-visas.gouv.fr/senegal',
    provider: 'VFS Global', centres: 'Dakar',
    providerUrl: 'https://visa.vfsglobal.com/sen/fr/fra/',
    decide: 'Consulat général de France à Dakar',
    service: '15 000 FCFA par dossier, payés en ligne à la prise de rendez-vous',
    delay: 'Traitement d’environ 15 jours en moyenne. Rendez-vous au minimum 15 jours avant le départ, dépôt possible jusqu’à 6 mois avant.',
    notes: [],
  },
  ci: {
    from: 'de Côte d’Ivoire', adj: 'ivoirien', name: 'Côte d’Ivoire', of: 'en Côte d’Ivoire', url: 'https://france-visas.gouv.fr/cote-d-ivoire',
    provider: 'VFS Global', centres: 'Abidjan',
    providerUrl: 'https://visa.vfsglobal.com/civ/fr/fra/',
    decide: 'Consulat général de France à Abidjan',
    service: '19 000 FCFA par dossier (carte ou espèces)',
    delay: 'En basse saison, 10 à 15 jours de traitement pour les ressortissants ivoiriens. Dépôt possible jusqu’à 6 mois avant le séjour.',
    notes: [],
  },
  cm: {
    from: 'du Cameroun', adj: 'camerounais', name: 'Cameroun', of: 'au Cameroun', url: 'https://france-visas.gouv.fr/cameroun',
    provider: 'TLScontact', centres: 'Yaoundé, Douala, Garoua',
    providerUrl: 'https://visas-fr.tlscontact.com/visa/cm/',
    decide: 'Section consulaire de l’ambassade à Yaoundé et consulat général à Douala, selon votre région',
    service: '38 € par dossier',
    delay: 'Déposez au minimum 15 jours ouvrables avant le départ, et au plus tôt 6 mois avant.',
    notes: ['Avertissement officiel : des escrocs se font passer pour des agents de l’ambassade et réclament des frais pour un certificat médical. « Aucune autre pièce justificative ne peut être réclamée hors des guichets des services des visas. »'],
  },
};

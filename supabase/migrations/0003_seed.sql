-- MonBien — données d'amorçage
-- Villes, quartiers de Rabat, prix indicatifs (placeholders à affiner),
-- annonces d'exemple et deux articles de blog.

-- ------------------------------------------------------------------ villes
insert into public.cities (name, slug, region, lat, lng, is_active) values
  ('Rabat',      'rabat',      'Rabat-Salé-Kénitra',    34.0209, -6.8416, true),
  ('Casablanca', 'casablanca', 'Casablanca-Settat',     33.5731, -7.5898, true),
  ('Marrakech',  'marrakech',  'Marrakech-Safi',        31.6295, -7.9811, true),
  ('Tanger',     'tanger',     'Tanger-Tétouan-Al Hoceïma', 35.7595, -5.8340, true),
  ('Kénitra',    'kenitra',    'Rabat-Salé-Kénitra',    34.2610, -6.5802, true),
  ('Salé',       'sale',       'Rabat-Salé-Kénitra',    34.0531, -6.7985, true),
  ('Fès',        'fes',        'Fès-Meknès',            34.0181, -5.0078, true),
  ('Tétouan',    'tetouan',    'Tanger-Tétouan-Al Hoceïma', 35.5785, -5.3684, true);

-- --------------------------------------------------------------- quartiers
with c as (select id, slug from public.cities)
insert into public.neighborhoods (city_id, name, slug, lat, lng)
select c.id, n.name, n.slug, n.lat, n.lng
from (values
  ('rabat', 'Agdal',              'agdal',              33.9950, -6.8520),
  ('rabat', 'Hay Riad',           'hay-riad',           33.9560, -6.8700),
  ('rabat', 'Souissi',            'souissi',            33.9720, -6.8290),
  ('rabat', 'L''Océan',           'l-ocean',            34.0250, -6.8480),
  ('rabat', 'Hassan',             'hassan',             34.0190, -6.8330),
  ('rabat', 'Yacoub El Mansour',  'yacoub-el-mansour',  33.9860, -6.8760),
  ('rabat', 'Aviation',           'aviation',           33.9840, -6.8420),
  ('rabat', 'Témara',             'temara',             33.9280, -6.9060),
  ('casablanca', 'Maârif',        'maarif',             33.5790, -7.6320),
  ('casablanca', 'Gauthier',      'gauthier',           33.5900, -7.6280),
  ('casablanca', 'Anfa',          'anfa',               33.5940, -7.6690),
  ('casablanca', 'Californie',    'californie',         33.5430, -7.6350),
  ('marrakech',  'Guéliz',        'gueliz',             31.6340, -8.0110),
  ('marrakech',  'Hivernage',     'hivernage',          31.6190, -8.0080),
  ('tanger',     'Malabata',      'malabata',           35.7830, -5.7730),
  ('tanger',     'Centre-ville',  'centre-ville',       35.7770, -5.8080)
) as n(city_slug, name, slug, lat, lng)
join c on c.slug = n.city_slug;

-- ------------------------------------------------- prix indicatifs (MAD/m²)
-- Vente : prix au m² ; Location : loyer mensuel au m². Valeurs indicatives.
with n as (
  select nb.id, nb.slug, c.slug as city_slug
  from public.neighborhoods nb join public.cities c on c.id = nb.city_id
)
insert into public.price_data (neighborhood_id, property_type, transaction, avg_price_per_m2, sample_size)
select n.id, p.property_type, p.transaction, p.price, p.sample_size
from (values
  -- Rabat — appartements
  ('rabat','agdal',             'appartement','vente',    19500, 124),
  ('rabat','agdal',             'appartement','location',    95,  86),
  ('rabat','hay-riad',          'appartement','vente',    21000, 141),
  ('rabat','hay-riad',          'appartement','location',   105,  92),
  ('rabat','souissi',           'appartement','vente',    24000,  38),
  ('rabat','souissi',           'appartement','location',   110,  27),
  ('rabat','l-ocean',           'appartement','vente',    13500,  67),
  ('rabat','l-ocean',           'appartement','location',    70,  54),
  ('rabat','hassan',            'appartement','vente',    15500,  73),
  ('rabat','hassan',            'appartement','location',    80,  61),
  ('rabat','yacoub-el-mansour', 'appartement','vente',    10500,  58),
  ('rabat','yacoub-el-mansour', 'appartement','location',    55,  49),
  ('rabat','aviation',          'appartement','vente',    16500,  46),
  ('rabat','aviation',          'appartement','location',    85,  33),
  ('rabat','temara',            'appartement','vente',     9500,  71),
  ('rabat','temara',            'appartement','location',    48,  57),
  -- Rabat — villas / maisons
  ('rabat','souissi',           'villa','vente',          27000,  22),
  ('rabat','hay-riad',          'villa','vente',          23000,  18),
  ('rabat','temara',            'villa','vente',          11000,  15),
  ('rabat','temara',            'maison','vente',          9800,  24),
  -- Casablanca
  ('casablanca','maarif',       'appartement','vente',    21000, 156),
  ('casablanca','maarif',       'appartement','location',   110, 104),
  ('casablanca','gauthier',     'appartement','vente',    23500, 118),
  ('casablanca','gauthier',     'appartement','location',   120,  87),
  ('casablanca','anfa',         'appartement','vente',    28000,  74),
  ('casablanca','anfa',         'appartement','location',   135,  52),
  ('casablanca','californie',   'appartement','vente',    16500,  63),
  ('casablanca','californie',   'appartement','location',    85,  41),
  -- Marrakech
  ('marrakech','gueliz',        'appartement','vente',    20500,  97),
  ('marrakech','gueliz',        'appartement','location',   100,  76),
  ('marrakech','hivernage',     'appartement','vente',    24500,  55),
  ('marrakech','hivernage',     'appartement','location',   115,  38),
  -- Tanger
  ('tanger','malabata',         'appartement','vente',    17500,  69),
  ('tanger','malabata',         'appartement','location',    90,  47),
  ('tanger','centre-ville',     'appartement','vente',    14500,  82),
  ('tanger','centre-ville',     'appartement','location',    75,  66)
) as p(city_slug, hood_slug, property_type, transaction, price, sample_size)
join n on n.city_slug = p.city_slug and n.slug = p.hood_slug;

-- ------------------------------------------------------- annonces d'exemple
with
  rabat as (select id from public.cities where slug = 'rabat'),
  hood as (
    select nb.slug, nb.id from public.neighborhoods nb
    join public.cities c on c.id = nb.city_id where c.slug = 'rabat'
  )
insert into public.listings
  (ref, title, slug, description, transaction, property_type, city_id, neighborhood_id,
   price, area_m2, rooms, bedrooms, bathrooms, features, images, status, is_featured)
values
  (
    'MB-1001',
    'Appartement lumineux 3 pièces avec balcon — Agdal',
    'appartement-a-vendre-rabat-agdal-mb-1001',
    E'Au cœur de l''Agdal, à deux pas de l''avenue de France, cet appartement de 96 m² séduit par sa luminosité traversante et ses volumes généreux.\n\nLe séjour ouvre sur un balcon exposé sud-ouest, idéal pour profiter des fins de journée. La cuisine équipée, les deux chambres avec placards et la salle de bains récente en font un bien prêt à vivre.\n\nRésidence sécurisée avec ascenseur et place de parking en sous-sol. À proximité immédiate : tramway, commerces, écoles et université.',
    'vente', 'appartement', (select id from rabat), (select id from hood where slug = 'agdal'),
    1850000, 96, 3, 2, 2,
    '["Balcon", "Ascenseur", "Parking sous-sol", "Résidence sécurisée", "Cuisine équipée", "Proche tramway"]'::jsonb,
    '[{"url":"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80","alt":"Séjour lumineux avec grandes baies vitrées"},{"url":"https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80","alt":"Salon moderne aux tons clairs"},{"url":"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80","alt":"Chambre principale avec placards"}]'::jsonb,
    'active', true
  ),
  (
    'MB-1002',
    'Villa contemporaine avec piscine et jardin — Souissi',
    'villa-a-vendre-rabat-souissi-mb-1002',
    E'Dans le quartier prisé du Souissi, villa d''architecte de 420 m² sur un terrain arboré de 1 000 m².\n\nTriple réception baignée de lumière, cuisine ouverte haut de gamme, cinq suites dont une de plain-pied. À l''extérieur : piscine au sel, terrasse ombragée et cuisine d''été.\n\nPrestations rares : domotique, panneaux solaires, garage trois voitures et studio indépendant pour le personnel. Un bien d''exception à quelques minutes des ambassades et des écoles internationales.',
    'vente', 'villa', (select id from rabat), (select id from hood where slug = 'souissi'),
    7900000, 420, 7, 5, 5,
    '["Piscine", "Jardin 1000 m²", "Domotique", "Panneaux solaires", "Garage 3 voitures", "Studio indépendant"]'::jsonb,
    '[{"url":"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80","alt":"Villa contemporaine avec piscine au crépuscule"},{"url":"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80","alt":"Façade moderne de la villa"},{"url":"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80","alt":"Double hauteur du séjour"}]'::jsonb,
    'active', true
  ),
  (
    'MB-1003',
    'Appartement standing 2 pièces meublé — Hay Riad',
    'appartement-a-louer-rabat-hay-riad-mb-1003',
    E'À Hay Riad, dans une résidence récente face au Mahaj Riad, appartement meublé de 85 m² au 4e étage avec vue dégagée.\n\nSéjour contemporain, cuisine américaine entièrement équipée, chambre avec dressing et salle d''eau avec douche italienne. Climatisation réversible dans toutes les pièces.\n\nLoyer mensuel charges comprises, parking inclus. Idéal cadre ou expatrié : à 5 minutes des ministères, ambassades et de l''Arribat Center.',
    'location', 'appartement', (select id from rabat), (select id from hood where slug = 'hay-riad'),
    9500, 85, 2, 1, 1,
    '["Meublé", "Climatisation", "Parking inclus", "Vue dégagée", "Douche italienne", "Résidence récente"]'::jsonb,
    '[{"url":"https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=80","alt":"Séjour meublé contemporain"},{"url":"https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1600&q=80","alt":"Cuisine américaine équipée"}]'::jsonb,
    'active', true
  ),
  (
    'MB-1004',
    'Appartement vue océan 3 pièces — L''Océan',
    'appartement-a-vendre-rabat-l-ocean-mb-1004',
    E'Face à l''Atlantique, dans le quartier historique de l''Océan, appartement de 78 m² entièrement rénové avec goût.\n\nDepuis le séjour et la cuisine ouverte, la vue file sur l''océan et les couchers de soleil. Deux chambres calmes côté cour, salle de bains neuve, double vitrage.\n\nUn pied-à-terre de charme à dix minutes à pied de la médina et de la gare Rabat-Ville — parfait en résidence principale comme en investissement locatif.',
    'vente', 'appartement', (select id from rabat), (select id from hood where slug = 'l-ocean'),
    1250000, 78, 3, 2, 1,
    '["Vue océan", "Entièrement rénové", "Double vitrage", "Proche médina", "Fort potentiel locatif"]'::jsonb,
    '[{"url":"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80","alt":"Appartement rénové baigné de lumière"},{"url":"https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80","alt":"Séjour avec vue sur l''extérieur"}]'::jsonb,
    'active', false
  ),
  (
    'MB-1005',
    'Duplex familial 5 pièces avec terrasse — Hassan',
    'appartement-a-vendre-rabat-hassan-mb-1005',
    E'Rare à Hassan : duplex de 140 m² au dernier étage d''un immeuble art déco réhabilité, à deux pas de la Tour Hassan.\n\nAu premier niveau, vaste réception avec cheminée, cuisine séparée et chambre d''amis. À l''étage, trois chambres et une terrasse privative de 30 m² avec vue sur les toits de la ville.\n\nCachet de l''ancien, confort du neuf : électricité refaite, menuiseries d''origine restaurées, chauffage central.',
    'vente', 'appartement', (select id from rabat), (select id from hood where slug = 'hassan'),
    2350000, 140, 5, 4, 2,
    '["Duplex", "Terrasse 30 m²", "Dernier étage", "Cheminée", "Immeuble art déco", "Chauffage central"]'::jsonb,
    '[{"url":"https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80","alt":"Réception spacieuse du duplex"},{"url":"https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=80","alt":"Terrasse avec vue sur la ville"}]'::jsonb,
    'active', false
  ),
  (
    'MB-1006',
    'Maison de ville 4 pièces avec patio — Témara',
    'maison-a-vendre-temara-mb-1006',
    E'À Témara centre, maison de ville de 120 m² sur deux niveaux, organisée autour d''un patio lumineux.\n\nRez-de-chaussée : double salon marocain et européen, cuisine indépendante, patio. Étage : trois chambres et salle de bains, plus un toit-terrasse aménageable de 60 m².\n\nQuartier calme et familial, à 10 minutes de la plage et des accès autoroute vers Rabat. Excellent rapport surface/prix pour une première acquisition.',
    'vente', 'maison', (select id from rabat), (select id from hood where slug = 'temara'),
    1150000, 120, 4, 3, 1,
    '["Patio", "Toit-terrasse 60 m²", "Double salon", "Quartier calme", "Proche plage"]'::jsonb,
    '[{"url":"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80","alt":"Maison de ville avec patio"},{"url":"https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1600&q=80","alt":"Salon traditionnel lumineux"}]'::jsonb,
    'active', false
  );

-- ------------------------------------------------------------ articles blog
insert into public.blog_posts (slug, title, meta_description, body_md, category, tags, hero_image, status, author, published_at) values
(
  'prix-immobilier-rabat-2026-quartier-par-quartier',
  'Prix de l''immobilier à Rabat en 2026 : le point quartier par quartier',
  'Agdal, Hay Riad, Souissi, Hassan… Découvrez les prix au m² à Rabat en 2026, quartier par quartier, et les tendances à connaître avant d''acheter ou de vendre.',
  E'Le marché immobilier de Rabat reste l''un des plus dynamiques du Royaume. Capitale administrative, ville universitaire et diplomatique, Rabat attire aussi bien les familles que les investisseurs. Voici notre lecture du marché, quartier par quartier.\n\n## Agdal : la valeur sûre\n\nQuartier central et vivant, l''Agdal concentre commerces, universités et tramway. Comptez en moyenne **19 500 MAD/m²** pour un appartement à la vente. Les petites surfaces bien situées partent vite, portées par la demande locative étudiante et des jeunes actifs.\n\n## Hay Riad : le premium moderne\n\nAvec ses ministères, ses sièges sociaux et l''Arribat Center, Hay Riad s''impose comme le quartier d''affaires résidentiel de la capitale. Les appartements récents s''échangent autour de **21 000 MAD/m²**, avec un marché locatif haut de gamme très actif (cadres, expatriés).\n\n## Souissi : l''exception\n\nQuartier des ambassades et des grandes propriétés, le Souissi joue dans une autre catégorie : villas d''architecte, terrains arborés, calme absolu. Les biens d''exception y dépassent régulièrement **25 000 MAD/m²**.\n\n## Hassan et L''Océan : le charme de l''ancien\n\nEntre la Tour Hassan et la corniche, ces quartiers historiques offrent du cachet à prix raisonnable : **13 500 à 15 500 MAD/m²** selon l''état du bien. Les biens rénovés avec vue se raréfient — une opportunité pour les acheteurs patients.\n\n## Nos conseils pour 2026\n\n1. **Vendeurs** : faites estimer votre bien avant de fixer un prix — les écarts entre quartiers (et entre rues !) n''ont jamais été aussi marqués.\n2. **Acheteurs** : comparez le prix au m² du bien visé avec la moyenne du quartier ; négociez sur données, pas au feeling.\n3. **Investisseurs** : l''Océan et Hassan offrent les meilleurs rendements locatifs bruts, l''Agdal la meilleure liquidité à la revente.\n\n*Vous vendez à Rabat ? [Estimez votre bien gratuitement](/estimer-mon-bien) en 2 minutes.*',
  'Marché',
  '["rabat", "prix", "marché immobilier", "2026"]'::jsonb,
  'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1600&q=80',
  'published', 'MonBien', now() - interval '6 days'
),
(
  'acheter-appartement-rabat-guide-complet',
  'Acheter un appartement à Rabat : le guide complet (budget, quartiers, étapes)',
  'Budget, choix du quartier, compromis, notaire, frais annexes : toutes les étapes pour acheter un appartement à Rabat en toute sérénité.',
  E'Acheter un appartement à Rabat est un projet de vie — et souvent l''investissement le plus important d''un ménage. Voici les étapes clés pour avancer sereinement.\n\n## 1. Définir son budget réel\n\nAu prix d''achat s''ajoutent les frais annexes, souvent sous-estimés :\n\n- **Droits d''enregistrement** : 4 % du prix (2,5 % pour certains logements sociaux)\n- **Conservation foncière** : 1,5 % + frais fixes\n- **Honoraires du notaire** : environ 1 % (négociables)\n- **Frais de dossier bancaire** et assurance décès-invalidité si crédit\n\nComptez donc **6 à 8 % de frais** en plus du prix affiché. Notre [simulateur de crédit](/simulateur-credit) vous aide à calibrer la mensualité.\n\n## 2. Choisir le bon quartier\n\nChaque quartier de Rabat a sa personnalité : l''Agdal pour la centralité, Hay Riad pour le standing moderne, Hassan et L''Océan pour le charme, Témara pour les budgets maîtrisés. Consultez notre [carte des prix](/prix-immobilier) pour comparer les prix au m² en un coup d''œil.\n\n## 3. Visiter méthodiquement\n\nAu-delà du coup de cœur, vérifiez systématiquement : l''état de la copropriété, les charges mensuelles, l''exposition, l''isolation phonique, le titre foncier (réquisition ou titre définitif ?) et la conformité des surfaces.\n\n## 4. Sécuriser la transaction\n\nAu Maroc, le passage devant **notaire** est la norme pour les biens titrés. Le compromis de vente fixe le prix, les conditions suspensives (crédit notamment) et le calendrier. Un acompte de 10 % est d''usage — toujours séquestré chez le notaire, jamais versé de la main à la main.\n\n## 5. Financer au meilleur taux\n\nLes taux varient sensiblement d''une banque à l''autre et se négocient. Faites jouer la concurrence sur le taux, mais aussi sur les frais de dossier et l''assurance.\n\n*Un projet d''achat à Rabat ? [Parlez-nous-en](/annonces) — nous connaissons chaque quartier et négocions pour vous.*',
  'Conseils',
  '["achat", "rabat", "guide", "notaire", "crédit"]'::jsonb,
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80',
  'published', 'MonBien', now() - interval '2 days'
);

-- Extension du maillage programmatique : nouveaux quartiers + prix indicatifs
-- (Casablanca, Salé, Kénitra, Fès, Tétouan, Marrakech, Tanger)

with c as (select id, slug from public.cities)
insert into public.neighborhoods (city_id, name, slug, lat, lng)
select c.id, n.name, n.slug, n.lat, n.lng
from (values
  ('casablanca', 'Bourgogne',       'bourgogne',       33.5960, -7.6360),
  ('casablanca', 'Aïn Diab',        'ain-diab',        33.5940, -7.6990),
  ('casablanca', 'Racine',          'racine',          33.5920, -7.6440),
  ('casablanca', 'Oasis',           'oasis',           33.5560, -7.6210),
  ('sale',       'Bettana',         'bettana',         34.0430, -6.7960),
  ('sale',       'Hay Karima',      'hay-karima',      34.0450, -6.7860),
  ('sale',       'Tabriquet',       'tabriquet',       34.0620, -6.7890),
  ('sale',       'Sala Al Jadida',  'sala-al-jadida',  33.9960, -6.7360),
  ('kenitra',    'Mimosas',         'mimosas',         34.2650, -6.5870),
  ('kenitra',    'Val Fleuri',      'val-fleuri',      34.2540, -6.5890),
  ('kenitra',    'Bir Rami',        'bir-rami',        34.2380, -6.6030),
  ('fes',        'Ville Nouvelle',  'ville-nouvelle',  34.0430, -4.9990),
  ('fes',        'Atlas',           'atlas',           34.0200, -4.9950),
  ('fes',        'Saïss',           'saiss',           33.9930, -4.9770),
  ('tetouan',    'Centre-ville',    'centre-ville',    35.5710, -5.3720),
  ('tetouan',    'M''hannech',      'mhannech',        35.5620, -5.3620),
  ('marrakech',  'Targa',           'targa',           31.6520, -8.0480),
  ('marrakech',  'Semlalia',        'semlalia',        31.6480, -8.0210),
  ('tanger',     'Iberia',          'iberia',          35.7710, -5.8130),
  ('tanger',     'Boubana',         'boubana',         35.7660, -5.8560)
) as n(city_slug, name, slug, lat, lng)
join c on c.slug = n.city_slug
on conflict (city_id, slug) do nothing;

with n as (
  select nb.id, nb.slug, c.slug as city_slug
  from public.neighborhoods nb join public.cities c on c.id = nb.city_id
)
insert into public.price_data (neighborhood_id, property_type, transaction, avg_price_per_m2, sample_size)
select n.id, p.property_type, p.transaction, p.price, p.sample_size
from (values
  ('casablanca', 'bourgogne',      'appartement', 'vente',    19000,  88),
  ('casablanca', 'bourgogne',      'appartement', 'location',   100,  61),
  ('casablanca', 'ain-diab',       'appartement', 'vente',    26000,  57),
  ('casablanca', 'ain-diab',       'appartement', 'location',   130,  44),
  ('casablanca', 'racine',         'appartement', 'vente',    24000,  71),
  ('casablanca', 'racine',         'appartement', 'location',   125,  53),
  ('casablanca', 'oasis',          'appartement', 'vente',    18500,  49),
  ('casablanca', 'oasis',          'appartement', 'location',    95,  36),
  ('sale',       'bettana',        'appartement', 'vente',     9500,  62),
  ('sale',       'bettana',        'appartement', 'location',    50,  48),
  ('sale',       'hay-karima',     'appartement', 'vente',     8500,  54),
  ('sale',       'hay-karima',     'appartement', 'location',    45,  39),
  ('sale',       'tabriquet',      'appartement', 'vente',     8000,  67),
  ('sale',       'tabriquet',      'appartement', 'location',    42,  51),
  ('sale',       'sala-al-jadida', 'appartement', 'vente',    10500,  43),
  ('sale',       'sala-al-jadida', 'appartement', 'location',    52,  31),
  ('kenitra',    'mimosas',        'appartement', 'vente',    12500,  46),
  ('kenitra',    'mimosas',        'appartement', 'location',    65,  34),
  ('kenitra',    'val-fleuri',     'appartement', 'vente',    11500,  39),
  ('kenitra',    'val-fleuri',     'appartement', 'location',    60,  28),
  ('kenitra',    'bir-rami',       'appartement', 'vente',    10000,  33),
  ('kenitra',    'bir-rami',       'appartement', 'location',    52,  25),
  ('fes',        'ville-nouvelle', 'appartement', 'vente',    11500,  58),
  ('fes',        'ville-nouvelle', 'appartement', 'location',    58,  42),
  ('fes',        'atlas',          'appartement', 'vente',    12500,  47),
  ('fes',        'atlas',          'appartement', 'location',    62,  35),
  ('fes',        'saiss',          'appartement', 'vente',    10500,  38),
  ('fes',        'saiss',          'appartement', 'location',    55,  27),
  ('tetouan',    'centre-ville',   'appartement', 'vente',    11000,  52),
  ('tetouan',    'centre-ville',   'appartement', 'location',    55,  38),
  ('tetouan',    'mhannech',       'appartement', 'vente',    12000,  41),
  ('tetouan',    'mhannech',       'appartement', 'location',    60,  29),
  ('marrakech',  'targa',          'appartement', 'vente',    16500,  63),
  ('marrakech',  'targa',          'appartement', 'location',    85,  47),
  ('marrakech',  'semlalia',       'appartement', 'vente',    18500,  54),
  ('marrakech',  'semlalia',       'appartement', 'location',    95,  41),
  ('tanger',     'iberia',         'appartement', 'vente',    15500,  59),
  ('tanger',     'iberia',         'appartement', 'location',    80,  43),
  ('tanger',     'boubana',        'appartement', 'vente',    13500,  37),
  ('tanger',     'boubana',        'appartement', 'location',    70,  26)
) as p(city_slug, hood_slug, property_type, transaction, price, sample_size)
join n on n.city_slug = p.city_slug and n.slug = p.hood_slug
on conflict (neighborhood_id, property_type, transaction) do nothing;

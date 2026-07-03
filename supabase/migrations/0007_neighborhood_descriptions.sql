-- Descriptions éditoriales des quartiers (pages /quartiers/[ville]/[quartier]).
-- Modifiables ensuite depuis /admin/prix.

with d as (
  select * from (values
  -- ------------------------------------------------------------- Rabat
  ('rabat', 'agdal',
   'L''Agdal est le quartier vivant de Rabat : avenues commerçantes, cafés, universités et tramway en font le cœur urbain préféré des étudiants comme des cadres. Le bâti mêle immeubles récents et résidences des années 80 bien tenues. Très liquide à la revente et extrêmement demandé à la location, c''est la valeur refuge des investisseurs — les petites surfaces bien situées y partent en quelques jours.'),
  ('rabat', 'hay-riad',
   'Hay Riad s''est imposé comme la vitrine moderne de la capitale : ministères, sièges de grandes entreprises, Arribat Center et larges avenues arborées. Les résidences y sont récentes, sécurisées et bien équipées. Le quartier attire cadres supérieurs, expatriés et familles en quête de standing, avec un marché locatif haut de gamme particulièrement actif. Les prix y sont parmi les plus élevés de Rabat, portés par une demande constante.'),
  ('rabat', 'souissi',
   'Quartier des ambassades et des grandes propriétés, le Souissi est l''adresse la plus prestigieuse de Rabat. Villas d''architecte sur de vastes terrains arborés, calme absolu, proximité des écoles internationales et du Royal Golf : tout y respire l''exclusivité. Le marché, confidentiel, se traite souvent hors annonces — un accompagnement local fait ici toute la différence, à l''achat comme à la vente.'),
  ('rabat', 'l-ocean',
   'Face à l''Atlantique, entre la médina et le quartier Hassan, L''Océan séduit par son cachet : immeubles anciens, ruelles vivantes, couchers de soleil sur la corniche. Les biens rénovés avec vue mer se raréfient et prennent de la valeur. Prix d''entrée encore accessibles, fort potentiel locatif (étudiants, jeunes actifs, location saisonnière) : un quartier idéal pour un premier achat ou un investissement de caractère.'),
  ('rabat', 'hassan',
   'Autour de la Tour Hassan et du mausolée Mohammed V, le quartier Hassan concentre l''histoire et l''administration de la capitale. Immeubles art déco, appartements aux beaux volumes, proximité immédiate de la gare Rabat-Ville et de la médina. Les biens de caractère rénovés y sont très recherchés. Un secteur central au charme rare, parfait pour qui veut vivre Rabat à pied.'),
  ('rabat', 'yacoub-el-mansour',
   'Grand quartier résidentiel populaire de l''ouest de Rabat, Yacoub El Mansour offre le meilleur rapport surface/prix de la ville intra-muros. Commerces de proximité, écoles, transports : tout le quotidien y est accessible. Le renouvellement urbain progressif et l''arrivée de résidences récentes en font un secteur à surveiller pour les primo-accédants et les investisseurs en quête de rendement locatif.'),
  ('rabat', 'aviation',
   'Entre le Souissi et l''Agdal, le quartier Aviation combine calme résidentiel et accès rapide au centre. Ses rues arborées alignent immeubles de standing et villas, à quelques minutes des hôpitaux universitaires et des écoles. Prisé des familles et des professions libérales, il offre un compromis recherché : le standing du Souissi voisin, à des prix plus accessibles et avec davantage d''offre en appartements.'),
  ('rabat', 'temara',
   'Aux portes sud de Rabat, Témara attire ceux qui veulent plus d''espace pour leur budget : maisons de ville, appartements récents et proximité des plages (Contrebandiers, Val d''Or). L''autoroute et le train de banlieue mettent la capitale à un quart d''heure. Très dynamique en primo-accession, le secteur voit ses prix progresser régulièrement — un bon point d''entrée avant que l''écart avec Rabat ne se resserre.'),
  -- -------------------------------------------------------- Casablanca
  ('casablanca', 'maarif',
   'Le Maârif est le cœur battant de Casablanca : rues commerçantes mythiques, Twin Center, restaurants et bureaux s''y côtoient. L''offre va du bel ancien aux résidences neuves de standing. Quartier ultra-liquide, demandé à l''achat comme à la location par les jeunes cadres, il reste une valeur sûre pour investir dans la métropole économique du Royaume.'),
  ('casablanca', 'gauthier',
   'Gauthier concentre le Casablanca d''affaires et de style : cabinets, agences, cafés design et immeubles haussmanniens réhabilités. Les plateaux y sont recherchés par les professions libérales, les appartements par les cadres et expatriés. Localisation centrale, adresses prestigieuses, offre limitée : les prix au m² y figurent parmi les plus solides de la ville.'),
  ('casablanca', 'anfa',
   'Anfa est l''adresse historique des grandes familles casablancaises : villas somptueuses, rues ombragées, vues sur l''océan côté corniche. Avec les développements d''Anfa Place et de Casa Anfa, le quartier attire aussi une nouvelle génération de résidences très haut de gamme. Un marché d''exception, où la rareté du foncier soutient durablement les valeurs.'),
  ('casablanca', 'californie',
   'Au sud de Casablanca, la Californie déroule ses villas et résidences fermées dans un cadre verdoyant, prisé des familles et des cadres travaillant vers Sidi Maârouf ou l''aéroport. Écoles privées et internationales à proximité immédiate. Les appartements récents en résidence sécurisée y offrent un excellent compromis standing/prix par rapport au centre-ville.'),
  ('casablanca', 'bourgogne',
   'Entre le boulevard d''Anfa et la corniche, Bourgogne est un quartier central en pleine mutation : à l''ancien tissu casablancais se substituent des résidences modernes avec vues sur mer aux étages élevés. Proximité de la Mosquée Hassan II, du centre et de la corniche : une localisation stratégique qui en fait un des secteurs les plus actifs du marché casablancais.'),
  ('casablanca', 'ain-diab',
   'Aïn Diab, c''est la corniche de Casablanca : plages, clubs, restaurants et résidences face à l''océan. Le quartier attire une clientèle aisée en résidence principale comme en pied-à-terre, et la location saisonnière y est florissante. Les programmes neufs en première ligne de mer atteignent des prix records — la vue et la proximité de la plage font toute la valeur.'),
  ('casablanca', 'racine',
   'Racine incarne le chic casablancais contemporain : boutiques, galeries, cafés et immeubles de standing à deux pas du Maârif et de la corniche. Très recherché par les cadres supérieurs et les expatriés, le quartier offre un marché locatif haut de gamme extrêmement fluide. L''offre limitée face à une demande constante y maintient des prix parmi les plus élevés de la ville.'),
  ('casablanca', 'oasis',
   'L''Oasis doit son nom à ses rues bordées d''arbres et ses villas paisibles, à mi-chemin entre le centre et les pôles d''affaires du sud (Sidi Maârouf, Casanearshore). La gare Oasis et l''autoroute urbaine facilitent tous les trajets. Familles et cadres y trouvent de l''espace et du calme sans s''exiler : un équilibre rare à Casablanca.'),
  -- --------------------------------------------------------- Marrakech
  ('marrakech', 'gueliz',
   'Guéliz est le centre moderne de Marrakech : avenue Mohammed V, terrasses, galeries et commerces à quinze minutes à pied de la médina. Les appartements, de l''art déco rénové au neuf avec piscine, séduisent résidents et investisseurs — la location courte durée y tourne à plein régime toute l''année. Le marché le plus liquide de la ville ocre.'),
  ('marrakech', 'hivernage',
   'Quartier des palaces et des jardins, l''Hivernage est l''adresse la plus exclusive de Marrakech hors médina. Résidences de grand standing avec piscines, proximité immédiate du Théâtre Royal, de la Ménara et des golfs. Clientèle internationale, pieds-à-terre de luxe et saisonnier haut de gamme : les valeurs au m² y sont les plus élevées de la ville.'),
  ('marrakech', 'targa',
   'À l''ouest de Marrakech, Targa a la faveur des familles : villas dans la verdure, résidences avec piscine, écoles réputées et ambiance village loin de l''agitation touristique. Le quartier s''est fortement développé tout en gardant son caractère résidentiel. Les prix, plus doux qu''à Guéliz ou l''Hivernage, en font une excellente porte d''entrée sur le marché marrakchi.'),
  ('marrakech', 'semlalia',
   'Semlalia longe la route de Casablanca, entre Guéliz et la palmeraie universitaire : faculté de médecine, cliniques et commerces en font un quartier pratique et vivant. Appartements spacieux dans des résidences établies, demande locative soutenue (étudiants, professionnels de santé) : un secteur au rendement régulier, à prix encore raisonnables.'),
  -- ------------------------------------------------------------ Tanger
  ('tanger', 'malabata',
   'Sur la baie de Tanger, Malabata aligne résidences modernes et hôtels face à la Méditerranée. Le quartier profite à plein du renouveau de la ville : marina, ville nouvelle, accès rapide à la gare TGV. Vues sur mer, plages à pied et programmes neufs en font le secteur préféré des acheteurs en résidence secondaire comme des investisseurs en saisonnier.'),
  ('tanger', 'centre-ville',
   'Le centre de Tanger, du boulevard Pasteur à la place de France, mêle immeubles de caractère, commerces historiques et cafés littéraires face au détroit. La rénovation urbaine et le TGV ont relancé l''attractivité du secteur. Les appartements anciens à rafraîchir offrent un vrai potentiel de valorisation, à deux pas de la médina et du port de plaisance.'),
  ('tanger', 'iberia',
   'Iberia est un quartier central et résidentiel de Tanger, apprécié pour ses immeubles bien entretenus, ses écoles et sa proximité du centre comme de la gare. Familles tangéroises et jeunes actifs s''y côtoient dans un cadre urbain calme. Un marché régulier, moins spéculatif que le front de mer, idéal en résidence principale comme en locatif longue durée.'),
  ('tanger', 'boubana',
   'À l''ouest de Tanger, vers la forêt diplomatique et le golf, Boubana déroule villas et résidences dans la verdure. Le calme, l''air de la Méditerranée toute proche et les grands terrains attirent une clientèle familiale et internationale. Un secteur en développement maîtrisé, où le m² reste attractif au regard de la qualité de vie offerte.'),
  -- -------------------------------------------------------------- Salé
  ('sale', 'bettana',
   'Face à Rabat, de l''autre côté du Bouregreg, Bettana est le quartier établi de Salé : administrations, écoles et commerces dans un tissu résidentiel calme. Le tramway et le pont Hassan II mettent la capitale à quelques minutes. Les prix, très inférieurs à ceux de Rabat, en font une alternative sérieuse pour les familles qui travaillent dans la capitale.'),
  ('sale', 'hay-karima',
   'Hay Karima est un quartier populaire et vivant de Salé, desservi par le tramway vers Rabat. Commerces de rue, écoles et petites résidences composent un quotidien pratique à prix contenus. Pour les primo-accédants et les investisseurs en quête de rendement brut élevé, c''est l''un des tickets d''entrée les plus accessibles de l''agglomération.'),
  ('sale', 'tabriquet',
   'Tabriquet est le grand quartier résidentiel du nord de Salé, dense et commerçant, desservi par le tramway. L''offre y est abondante et les prix parmi les plus doux de l''agglomération de la capitale. La demande locative ne faiblit pas — familles et jeunes ménages — ce qui en fait un marché de rendement par excellence pour un premier investissement.'),
  ('sale', 'sala-al-jadida',
   'Ville nouvelle entre Salé et l''aéroport, Sala Al Jadida a été pensée pour les familles : avenues larges, résidences récentes, université internationale et technopolis à proximité. Les appartements neufs y sont accessibles et le cadre aéré. Un secteur en croissance continue, porté par les pôles d''emploi voisins et la desserte ferroviaire vers Rabat.'),
  -- ----------------------------------------------------------- Kénitra
  ('kenitra', 'mimosas',
   'Les Mimosas sont le quartier chic de Kénitra : villas sous les arbres, résidences soignées, lycées et clubs sportifs. À quelques minutes de la gare TGV, le secteur attire cadres et familles — y compris des navetteurs vers Rabat et Casablanca. L''adresse la plus valorisée de la ville, au marché stable et recherché.'),
  ('kenitra', 'val-fleuri',
   'Val Fleuri combine centralité et tranquillité résidentielle à Kénitra : appartements familiaux, commerces de proximité et établissements scolaires réputés. Le TGV et la zone franche Atlantic Free Zone dopent la demande locale. Un marché équilibré, parfait pour habiter comme pour un investissement locatif de bon père de famille.'),
  ('kenitra', 'bir-rami',
   'À l''ouest de Kénitra, Bir Rami s''est développé rapidement avec des résidences récentes et des maisons individuelles à prix accessibles. La proximité des zones industrielles et de l''université y entretient une demande locative constante. Un secteur jeune, en structuration, où les prix d''entrée laissent de la marge de progression.'),
  -- --------------------------------------------------------------- Fès
  ('fes', 'ville-nouvelle',
   'La Ville Nouvelle de Fès, autour de l''avenue Hassan II et de ses façades des années 30, concentre commerces, cafés et administrations. Les appartements anciens aux beaux volumes se rénovent, les résidences récentes complètent l''offre. C''est le marché le plus actif de Fès, recherché par les familles comme par les investisseurs en locatif étudiant.'),
  ('fes', 'atlas',
   'Au sud de la Ville Nouvelle, l''Atlas est un quartier résidentiel apprécié des familles fassies : rues calmes, écoles, mosquées de quartier et commerces du quotidien. L''habitat, mêlant immeubles récents et maisons, reste accessible. La proximité du centre et de la gare en fait une valeur régulière du marché de Fès.'),
  ('fes', 'saiss',
   'Vers l''aéroport et le campus universitaire, le quartier Saïss est le front de développement de Fès : résidences neuves, avenues larges, facultés et cliniques. Les prix d''entrée attractifs et la demande locative étudiante en font un secteur de rendement. Un choix pertinent pour investir dans une ville universitaire en croissance.'),
  -- ----------------------------------------------------------- Tétouan
  ('tetouan', 'centre-ville',
   'Le centre de Tétouan, de l''Ensanche espagnol à la place Moulay El Mehdi, offre un patrimoine architectural unique inscrit dans la vie quotidienne : commerces, cafés et administrations au pied des immeubles. Les appartements de caractère à rénover côtoient des résidences récentes. La médina UNESCO et la Méditerranée toute proche complètent l''attrait du secteur.'),
  ('tetouan', 'mhannech',
   'M''hannech est le quartier résidentiel recherché de Tétouan : immeubles récents, rues aérées, écoles et cliniques à proximité. Les familles tétouanaises et la diaspora de retour au pays y concentrent leur demande, notamment à l''approche de l''été. À vingt minutes des plages de Martil et M''diq, le secteur allie ville et littoral.')
  ) as v(city_slug, hood_slug, description)
)
update public.neighborhoods n
set description = d.description
from d
join public.cities c on c.slug = d.city_slug
where n.city_id = c.id and n.slug = d.hood_slug and n.description is null;

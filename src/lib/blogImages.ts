// Banque d'images de couverture du blog, classées par catégorie éditoriale.
// Toutes les URLs ont été vérifiées (HTTP 200). L'attribution se fait côté
// serveur dans /api/blog/ingest : catégorie appropriée + jamais d'image
// utilisée récemment.

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

const POOLS: Record<string, string[]> = {
  // Rues, villes, Maroc — pages quartiers
  Quartiers: [
    u("1539020140153-e479b8c22e70"),
    u("1512453979798-5ea266f8880c"),
    u("1570129477492-45c003edd2be"),
    u("1449824913935-59a10b8d2000"),
    u("1444723121867-7a241cacace9"),
    u("1486325212027-8081e485255e"),
    u("1519999482648-25049ddd37b1"),
    u("1517394834181-95ed159986c7"),
    u("1531971589569-0d9370cbe1e5"),
    u("1489370321024-e0410ad08da4"),
    u("1494522855154-9297ac14b55f"),
    u("1568992688065-536aad8a12f6"),
  ],
  // Immeubles, architecture, skyline — analyses de marché
  Marché: [
    u("1545324418-cc1a3fa10c00"),
    u("1486406146926-c627a92ad1ab"),
    u("1487958449943-2429e8be8625"),
    u("1460317442991-0ec209397118"),
    u("1479839672679-a46483c0e7c8"),
    u("1448630360428-65456885c650"),
    u("1431576901776-e539bd916ba2"),
    u("1493246507139-91e8fad9978e"),
    u("1523217582562-09d0def993a6"),
    u("1524230572899-a752b3835840"),
  ],
  // Calculs, documents, signatures, clés — crédit & financement
  Financement: [
    u("1554224155-6726b3ff858f"),
    u("1554224154-26032ffc0d07"),
    u("1450101499163-c8848c66ca85"),
    u("1434626881859-194d67b2b86f"),
    u("1554774853-aae0a22c8aa4"),
    u("1521791136064-7986c2920216"),
    u("1556155092-490a1ba16284"),
    u("1560518883-ce09059eeffa"),
    u("1579621970563-ebec7560ff3e"),
    u("1579621970795-87facc2f976d"),
    u("1633158829585-23ba8f7c8caf"),
    u("1621981386829-9b458a2cddde"),
  ],
  // Intérieurs, maisons — conseils pratiques
  Conseils: [
    u("1600585154340-be6161a56a0c"),
    u("1600596542815-ffad4c1539a9"),
    u("1600607687939-ce8a6c25118c"),
    u("1600566753086-00f18fb6b3ea"),
    u("1512917774080-9991f1c4c750"),
    u("1600585154526-990dced4db0d"),
    u("1502005229762-cf1b2da7c5d6"),
    u("1600047509807-ba8f99d2cdde"),
    u("1493809842364-78817add7ffb"),
    u("1600210492486-724fe5c67fb0"),
    u("1583608205776-bfd35f0d9f83"),
    u("1560448204-e02f11c3d0e2"),
    u("1560185007-cde436f6a4d0"),
    u("1560185127-6ed189bf02f4"),
    u("1560184897-ae75f418493e"),
  ],
  // Patrimoine : immeubles + clés/contrats
  Investissement: [
    u("1560518883-ce09059eeffa"),
    u("1545324418-cc1a3fa10c00"),
    u("1486406146926-c627a92ad1ab"),
    u("1554774853-aae0a22c8aa4"),
    u("1523217582562-09d0def993a6"),
    u("1460317442991-0ec209397118"),
    u("1633158829585-23ba8f7c8caf"),
    u("1487958449943-2429e8be8625"),
  ],
};

const DEFAULT_POOL = [...new Set(Object.values(POOLS).flat())];

/**
 * Choisit une image de couverture adaptée à la catégorie, en évitant celles
 * utilisées récemment. Si tout le pool de la catégorie a servi, prend la
 * moins récemment utilisée.
 */
export function pickHeroImage(
  category: string | null,
  recentHeroUrls: string[]
): string {
  const pool = (category && POOLS[category.trim()]) || DEFAULT_POOL;
  const unused = pool.filter((url) => !recentHeroUrls.includes(url));
  if (unused.length > 0) {
    // varie le point de départ pour ne pas toujours prendre la même en tête
    return unused[recentHeroUrls.length % unused.length];
  }
  // Tout a servi récemment : reprendre la plus ancienne du pool
  const byAge = [...pool].sort(
    (a, b) => recentHeroUrls.indexOf(b) - recentHeroUrls.indexOf(a)
  );
  return byAge[byAge.length - 1] ?? pool[0];
}

export { POOLS as BLOG_IMAGE_POOLS };

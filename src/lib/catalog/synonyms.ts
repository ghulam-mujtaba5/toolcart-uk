/**
 * UK Hardware Synonyms & Lexical Query Expansion Dictionary
 * Enables robust recovery when tradespeople or DIYers search using UK slang or colloquial terminology.
 */

export const UK_SYNONYM_MAP: Record<string, string[]> = {
  rawplug: ['wall plugs', 'plug', 'fixing'],
  rawplugs: ['wall plugs', 'plug', 'fixing'],
  rawplugged: ['wall plugs'],
  wallplug: ['wall plugs'],
  torch: ['site light', 'lead', 'site-equipment'],
  flashlight: ['torch', 'site-equipment'],
  spanner: ['spanners', 'adjustable spanner', 'wrench'],
  spanners: ['spanner', 'adjustable spanner'],
  wrench: ['spanner', 'adjustable spanner'],
  wrenches: ['spanners', 'spanner'],
  driver: ['screwdriver'],
  drivers: ['screwdrivers', 'screwdriver set'],
  turnscrew: ['screwdriver'],
  turnscrews: ['screwdrivers'],
  stanley: ['utility knife', 'knife blades'],
  'stanley knife': ['utility knife'],
  boxcutter: ['utility knife'],
  cutter: ['pliers', 'wire cutter', 'utility knife'],
  snips: ['wire cutter', 'pliers'],
  tape: ['electrical tape', 'masking tape', 'cloth tape', 'packaging tape'],
  'insulating tape': ['pvc electrical tape'],
  'insulation tape': ['pvc electrical tape'],
  'painters tape': ['masking tape'],
  'frogtrap tape': ['masking tape'],
  stepladder: ['step foldable ladder', 'ladder'],
  steps: ['step foldable ladder', 'ladder'],
  ladder: ['step foldable ladder'],
  goggles: ['protective eye glasses', 'protective eye goggles'],
  specs: ['protective eye glasses'],
  glasses: ['protective eye glasses'],
  respirator: ['dust mask'],
  facemask: ['dust mask'],
  lock: ['padlock', 'bolt'],
  padlock: ['padlocks', 'brass padlock', 'iron padlock'],
  clamp: ['g clamp', 'spring clamp'],
  'c clamp': ['g clamp'],
  ruler: ['metal ruler', 'tape measure'],
  rule: ['metal ruler'],
  spirit: ['spirit level'],
  level: ['spirit level'],
  bungee: ['bungee cords', 'rope'],
  straps: ['ratchet straps'],
};

/**
 * Expands search query tokens with UK hardware synonyms
 */
export function expandQueryWithSynonyms(query: string): string[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];

  const tokens = normalized.split(/\s+/);
  const expansions = new Set<string>([normalized]);

  for (const token of tokens) {
    if (UK_SYNONYM_MAP[token]) {
      for (const syn of UK_SYNONYM_MAP[token]) {
        expansions.add(syn);
      }
    }
  }

  // Also check full phrases
  if (UK_SYNONYM_MAP[normalized]) {
    for (const syn of UK_SYNONYM_MAP[normalized]) {
      expansions.add(syn);
    }
  }

  return Array.from(expansions);
}

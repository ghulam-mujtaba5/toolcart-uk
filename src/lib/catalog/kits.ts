import { ProjectKit } from '@/types/guides';
import { getAllPublicProducts } from './products';

export function getStaticProjectKits(): ProjectKit[] {
  const allProducts = getAllPublicProducts();
  const productMap = new Map(allProducts.map((p) => [p.supplier_sku, p]));

  function resolveItem(sku: string, defaultQty: number = 1, badge?: string, essential: boolean = true) {
    const prod = productMap.get(sku);
    if (!prod) {
      throw new Error(`Project kit SKU not found in catalog: ${sku}`);
    }
    return {
      sku: prod.supplier_sku,
      product_slug: prod.slug,
      title: prod.title,
      default_quantity: defaultQty,
      units_per_pack: prod.units_per_pack,
      price_inc_vat: prod.retail_price_inc_vat_gbp,
      price_ex_vat: prod.retail_price_ex_vat_gbp,
      badge,
      essential,
    };
  }

  return [
    {
      id: 'kit-electrical-consumables',
      slug: 'domestic-electrical-tape-consumables-kit',
      title: 'Domestic Electrical Tape & Consumables Kit',
      tagline: 'Colour-coded phase identification, voltage verification, and clean wire trimming.',
      description:
        'A comprehensive UK domestic electrical maintenance kit containing high-specification PVC phase-marking tapes, insulated driver tooling, voltage indicator, and drop-forged wire cutters for fast diagnostics and safe consumer unit repairs.',
      category: 'Electrical & Maintenance',
      badge: 'Trade & DIY Essential',
      image: '/images/kits/electrical-kit.webp',
      difficulty: 'Intermediate',
      estimated_time: '1–2 hours',
      bundle_savings_percent: 15,
      items: [
        resolveItem('IONPVCMC5PKX6', 1, 'Phase Colour Coding', true),
        resolveItem('IONPVCBLK1PKX12', 1, 'Neutral & Overwrap', true),
        resolveItem('IONNEONTESTS1P10', 1, 'Mains Indicator (200-250V)', true),
        resolveItem('IONWPLIERS1P10', 1, 'Carbon Steel Cutters', true),
        resolveItem('IONESDRIVERS1P6', 1, '1000V Insulated Screwdrivers', true),
      ],
      instructions: [
        'Always isolate mains power at the consumer unit and verify with a two-pole indicator before touching cables.',
        'Apply brown tape for live, blue for neutral, and yellow/green for earth according to BS 7671 standards.',
        'Use the insulated screwdrivers for all terminal strip screws to prevent slip-short circuits.',
      ],
    },
    {
      id: 'kit-painting-prep',
      slug: 'painting-masking-prep-kit',
      title: 'Painting & Masking Prep Kit',
      tagline: 'Razor-sharp paint lines, floor protection, and seamless plaster prep.',
      description:
        'Professional surface preparation bundle engineered for decorators and trades. Includes multiple tape widths, polythene floor sheeting, assorted grit sandpaper, flexible filling blades, and a 4-inch roller system for trim and cutting in.',
      category: 'Decorating',
      badge: "Decorator's Choice",
      image: '/images/kits/decorating-kit.webp',
      difficulty: 'Beginner',
      estimated_time: '3–4 hours',
      bundle_savings_percent: 12,
      items: [
        resolveItem('IONMT48MM1PKX24', 1, '48mm Skirting & Architrave', true),
        resolveItem('IONMT23MM2PKX24', 1, '23mm Window & Switch Line', true),
        resolveItem('IONDUSTS1P24', 1, 'Heavy Floor Protection', true),
        resolveItem('IONA4SPAPER10P10', 1, 'Multi-Grit Smoothing', true),
        resolveItem('IONFBLADES4P10', 1, 'Plaster & Caulk Smoothing', false),
        resolveItem('IONROLLTRAY41P10', 1, 'Trim & Radiator Roller', true),
        resolveItem('IONPBRUSH5P10', 1, '5-Piece Pure Bristle Set', true),
      ],
      instructions: [
        'Clean surfaces thoroughly to remove dust and grease before applying masking tape.',
        'Press tape edges down firmly with a putty blade to avoid bleed-through.',
        'Peel tape at a smooth 45-degree angle while paint is slightly damp for razor-sharp lines.',
      ],
    },
    {
      id: 'kit-site-safety-maintenance',
      slug: 'essential-site-torch-extension-lead-kit',
      title: 'Essential Site Safety & Access Kit',
      tagline: 'Certified step access, weather protection, tie-downs, and eye protection.',
      description:
        'The mobile contractor and workshop essential: includes EN14183 150KG rated 3-step ladder, heavy waterproof tarpaulin, ratchet load straps, precision 5m metric tape measure, and PPE safety eyewear.',
      category: 'Site Equipment',
      badge: 'Site & Van Ready',
      image: '/images/kits/starter-kit.webp',
      difficulty: 'Trade',
      estimated_time: 'All-day site work',
      bundle_savings_percent: 18,
      items: [
        resolveItem('ION3SFLADDER1P1', 1, 'EN14183 150kg Safety Ladder', true),
        resolveItem('IONTARPAULIN1P12', 1, 'Waterproof Weather Cover', true),
        resolveItem('IONRSTRAPS2P12', 1, 'Van Load Restraint', true),
        resolveItem('IONTAPEM5M1P12', 1, '5m Metric / Imperial Measure', true),
        resolveItem('IONWGLOVES1P10', 1, 'Abrasion Resistance Gloves', true),
        resolveItem('IONPEGOGGLES1P12', 1, 'EN166 Eye Protection', true),
        resolveItem('IONBCORD2P12', 1, 'Elastic Tie-Down Bungees', false),
      ],
      instructions: [
        'Inspect ladder rubber feet and locking catch before climbing.',
        'Secure ladder on firm, level ground; never over-reach beyond side rails.',
        'Wear protective eye goggles whenever cutting timber, masonry, or operating power tools.',
      ],
    },
  ];
}

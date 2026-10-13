import { BuyingGuide } from '@/types/guides';

export function getStaticBuyingGuides(): BuyingGuide[] {
  return [
    {
      id: 'guide-screwdrivers',
      slug: 'complete-uk-guide-to-screwdrivers',
      title: 'The Complete UK Guide to Screwdrivers: Drive Standards, Materials & Safe Insulation',
      meta_description:
        'Technical comparison between Phillips, Pozidriv (PZ), slotted, and Torx drives. Understand chrome vanadium alloys, magnetic tips, and BS EN IEC 60900 1000V electrical isolation.',
      read_time_minutes: 6,
      published_date: '2026-10-10',
      author: 'ToolCart UK Technical Advice Team',
      category: 'Hand Tools',
      hero_image: '/images/guides/screwdrivers.svg',
      excerpt:
        'Using the wrong screwdriver head damages fasteners, strips screw heads, and causes cam-out injury. Learn how to identify British screw profiles, driver steels, and insulated VDE ratings.',
      safety_warnings: [
        'Never use uninsulated drivers on live circuits or consumer units.',
        'Insulated tools must feature official 1000V VDE / BS EN IEC 60900 markings to protect against shock.',
        'Avoid striking screwdriver handles with hammers unless they have a full-tang strike cap.',
      ],
      key_takeaways: [
        'Phillips (PH) has a 57° angle with rounded corners; Pozidriv (PZ) features extra ribs between blades to prevent cam-out.',
        'Chrome Vanadium (Cr-V) is standard trade steel; S2 tool steel offers greater torsional flex for impact drivers.',
        'Precision sets (1.4mm to 3.0mm) are essential for terminal blocks, thermostat wiring, and electronics.',
      ],
      sections: [
        {
          title: '1. Phillips vs Pozidriv: Why UK Screws Strip',
          content:
            'In the UK construction and DIY market, the vast majority of wood and drywall screws use the Pozidriv (PZ) standard, not Phillips (PH). A Phillips driver has tapered flanks that intentionally cam out under high torque to prevent overtightening. If you use a PH driver in a PZ screw, it only contacts the outer edges, inevitably chewing out the screw head.',
          tip: 'Look for the tiny radial tick marks at 45 degrees on the screw head: that signifies a Pozidriv recess.',
        },
        {
          title: '2. 1000V VDE Insulation vs Standard Drivers',
          content:
            'VDE-certified screwdrivers (such as Ionos insulated drivers) are tested individually submerged in water under a 10,000-volt test to guarantee safe protection up to 1,000V AC. Standard plastic handles do not offer certified dielectric protection against electrical flashover.',
          warning: 'Never use damaged or chipped insulated screwdrivers on live circuits.',
        },
        {
          title: '3. Precision Screwdrivers for Control Panels & Terminals',
          content:
            'Precision screwdriver sets with free-spinning swivel caps allow delicate single-handed downward pressure while rotating with your fingertips. Ideal for heating controls, fuse spurs, and light fitting terminal blocks.',
        },
      ],
      recommended_skus: ['ION61SDRIVER1P10', 'IONSDRIVERS4P10', 'IONPSDRIVERS6P10', 'IONESDRIVERS1P6'],
      standards_referenced: ['BS EN IEC 60900:2018', 'DIN ISO 2380', 'DIN ISO 8764'],
    },
    {
      id: 'guide-wall-plugs',
      slug: 'selecting-wall-plugs-masonry-fixings',
      title: 'Selecting Wall Plugs & Masonry Fixings: Safe Load Ratings and Substrate Matching',
      meta_description:
        'Substrate matching guide for red, brown, and grey wall plugs in brick, aerated block, plasterboard, and stone. Avoid structural pull-out failures.',
      read_time_minutes: 5,
      published_date: '2026-10-08',
      author: 'ToolCart UK Technical Advice Team',
      category: 'Fixings & Security',
      hero_image: '/images/guides/wall-plugs.svg',
      excerpt:
        'A fixing is only as strong as the wall behind it. Understand drill bit diameters, screw gauges, and expansion plug physics across solid masonry and hollow stud partitions.',
      safety_warnings: [
        'Always scan for embedded electrical cables, copper pipes, and gas lines using a multi-detector prior to drilling.',
        'Never hang heavy radiators, boilers, or wall cabinets with standard plastic plugs in hollow plasterboard.',
      ],
      key_takeaways: [
        'Standard colour coding: Yellow = 5mm hole (No. 4-6 screw), Red = 6mm hole (No. 6-8 screw), Brown = 7mm hole (No. 8-10 screw).',
        'Grey multi-substrate plugs feature winged collars to prevent spinning inside aerated concrete blocks.',
        'Always drill with masonry bit at low hammer speed without wallowing out the hole diameter.',
      ],
      sections: [
        {
          title: '1. Substrate Identification: Solid Brick vs Thermalite vs Plasterboard',
          content:
            'Drilling dust reveals your wall material: red dust indicates solid clay brick; grey gritty dust indicates concrete block; very pale powdery dust indicates lightweight thermalite; white chalk indicates plasterboard.',
          tip: 'When drilling aerated lightweight thermalite, turn off the hammer action on your combi drill to prevent an oversized oval hole.',
        },
        {
          title: '2. Drill Bit and Screw Sizing Matrix',
          content:
            'A 200-piece assorted plug pack provides 5mm, 6mm, and 8mm plugs. Pair a 6mm plug with a 6mm masonry bit and 4.0mm to 5.0mm (No. 8) screws. The screw length must equal the plug length plus fixture thickness plus 5mm tip clearance.',
        },
      ],
      recommended_skus: ['IONWPLUGS200P10', 'IONMASODBSET1P12', 'ION2GCLAMP1P12'],
      standards_referenced: ['BS 8539:2012+A1:2021', 'ETAG 001 Part 1'],
    },
    {
      id: 'guide-masking-tape',
      slug: 'masking-painters-tapes-demystified',
      title: 'Masking & Painter’s Tapes Demystified: Adhesion Levels, Clean Removal & Surface Prep',
      meta_description:
        'Avoid paint bleed and peeled plaster. Technical breakdown of crepe paper masking tape, low-tack painter tape, and cloth tapes for skirting and glass.',
      read_time_minutes: 4,
      published_date: '2026-10-06',
      author: 'ToolCart UK Decorating Specialist',
      category: 'Decorating',
      hero_image: '/images/guides/masking-tape.svg',
      excerpt:
        'Standard utility masking tape left on surfaces for too long will bake onto timber and tear newly applied emulsion paint. Master adhesion grades, dwell times, and clean removal angles.',
      safety_warnings: [
        'Do not apply aggressive solvent-based tapes to freshly plastered or newly painted walls within 24 hours of drying.',
      ],
      key_takeaways: [
        '23mm tape is optimal for window frames and light switch surrounds; 48mm tape protects floorboards and skirting tops.',
        'Remove tape when paint is touch-dry but not fully cured to avoid ripping the paint skin.',
        'Pull the tape back smoothly against itself at a sharp 45-degree angle.',
      ],
      sections: [
        {
          title: '1. Crepe Paper vs Woven Cloth vs BOPP Packaging Tapes',
          content:
            'Crepe paper masking tapes are saturated with rubber adhesive for temporary adhesion and sharp paint cutoff lines. Heavy grey cloth tapes feature polyethylene coating with aggressive adhesive for bundling, waterproofing, and carpet protection, but should never be used on painted trim.',
          tip: 'Firmly press the outer edge of your masking tape using a plastic filling blade to prevent capillary paint seepage.',
        },
      ],
      recommended_skus: ['IONMT48MM1PKX24', 'IONMT23MM2PKX24', 'IONCT48MM1PKX12'],
      standards_referenced: ['PSTC-101 (Adhesion)', 'BS EN 12024'],
    },
    {
      id: 'guide-ladder-safety',
      slug: 'site-access-step-ladder-safety',
      title: 'Site Access & Step Ladder Safety: Complying with EN 131 and EN 14183 Standards',
      meta_description:
        'Safe working heights, weight capacities, and inspection routines for UK trade step ladders and access platforms under Work at Height Regulations 2005.',
      read_time_minutes: 5,
      published_date: '2026-10-04',
      author: 'ToolCart UK Safety Specialist',
      category: 'Workwear & Safety',
      hero_image: '/images/guides/ladder-safety.svg',
      excerpt:
        'Falls from height remain the leading cause of fatal accidents in UK workplaces. Understand BS EN 14183 step stool standards, 150KG maximum load ratings, and mandatory 3-point contact rules.',
      safety_warnings: [
        'Always maintain three points of contact (two feet and one hand) when working on any step ladder.',
        'Never stand on the top handrail or top folding platform step unless certified by the manufacturer as a working stage.',
        'Inspect anti-slip rubber feet before each use; grease or worn rubber causes lateral slide.',
      ],
      key_takeaways: [
        'EN 14183 covers step stools up to 1 metre platform height with 150KG duty rating.',
        'Ensure the folding spreaders or locking braces are fully clicked into place before ascending.',
        'Wear footwear with clean tread and rigid soles; never wear slippers or smooth dress shoes on ladders.',
      ],
      sections: [
        {
          title: '1. UK Work at Height Regulations 2005 Requirements',
          content:
            'Under UK law, short duration light work on step ladders is permitted only where risk assessment demonstrates that using more substantial equipment (e.g., mobile scaffold tower) is not justifiable.',
        },
      ],
      recommended_skus: ['ION3SFLADDER1P1', 'IONWGLOVES1P10', 'IONPEGOGGLES1P12'],
      standards_referenced: ['BS EN 14183:2003', 'BS EN 131-2:2010+A2:2017', 'HSE INDG402'],
    },
    {
      id: 'guide-electrical-tape',
      slug: 'electrical-insulation-tapes-voltage-testing',
      title: 'Electrical Insulation Tapes & Voltage Testing in the UK: BS EN 60454 Compliance',
      meta_description:
        'Harmonised phase colour coding (brown/blue/green-yellow), dielectric insulation breakdown ratings, and safe use of voltage indicators under BS 7671.',
      read_time_minutes: 6,
      published_date: '2026-10-02',
      author: 'ToolCart UK Electrical Technical Lead',
      category: 'Site Equipment',
      hero_image: '/images/guides/electrical-tape.svg',
      excerpt:
        'Electrical PVC tape is not just adhesive tape: it is an engineered dielectric barrier tested to withstand 600V to 1000V. Understand BS EN 60454 flammability ratings and UK wiring regulation colours.',
      safety_warnings: [
        'Neon test screwdrivers should only ever be used as secondary visual indicators. They do not constitute safe isolation verification under the Electricity at Work Regulations 1989.',
        'For dead testing on electrical circuits, always use an approved GS38 two-pole voltage detector and proving unit.',
      ],
      key_takeaways: [
        'BS 7671 Harmonised UK colours: Single Phase Live = Brown, Neutral = Blue, Earth = Green/Yellow.',
        'Old UK wiring colours: Live = Red, Neutral = Black; phase identification tape must be used when connecting new and old cables.',
        'Flame-retardant PVC tape self-extinguishes upon flame removal and prevents cable arcing.',
      ],
      sections: [
        {
          title: '1. UK Harmonised Wiring Colours (BS 7671 18th Edition)',
          content:
            'Since 2006, the UK conforms to European harmonised cable core colours: Brown for single-phase Line, Blue for Neutral, and Green/Yellow for Protective Earth. When modifying existing red/black domestic installations, tradespeople must apply color-coded tape oversleeves to re-identify lines at consumer units and switch boxes.',
          tip: 'Use mixed 5-pack tape rolls containing brown, blue, yellow/green, red, and black to maintain legal compliance on legacy alterations.',
        },
      ],
      recommended_skus: ['IONPVCMC5PKX6', 'IONPVCBLK1PKX12', 'IONNEONTESTS1P10', 'IONWPLIERS1P10'],
      standards_referenced: ['BS EN 60454-3-1:2001', 'BS 7671:2018+A2:2022', 'HSE GS38'],
    },
  ];
}

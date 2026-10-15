import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, getAllProducts } from '@/lib/catalog';
import { PublicProductDTO } from '@/types/product';

export const dynamic = 'force-dynamic';

async function generateGeminiReply(
  prompt: string,
  catalogSummary: { title: string; sku: string; category: string }[],
  safetyContext?: string
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const systemInstruction = `You are the ToolCart UK AI Technical Assistant, an expert British trade and site hardware specialist.
Brand Tone: Professional, concise, authoritative UK trade guidance.
Strict Rules:
1. Prioritize British and European Safety Standards (e.g. BS 7671, BS EN IEC 60900, BS EN 14183).
2. Confidentiality: NEVER disclose or discuss wholesale prices, supplier costs (unit_cost_ex_vat_gbp or case_cost_ex_vat_gbp), or margins.
3. Grounding: Refer only to verified UK trade catalog items where relevant.
4. Keep the answer direct, practical, and under 120 words.`;

    const bodyPayload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `User Query: "${prompt}"\n\nVerified Catalog Context:\n${JSON.stringify(catalogSummary.slice(0, 8))}${safetyContext ? `\nMandatory Safety Requirement: ${safetyContext}` : ''}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 250,
      },
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return candidateText || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const lower = prompt.toLowerCase();
    const allProducts = await getAllProducts();
    const productMap = new Map(allProducts.map((p) => [p.supplier_sku, p]));

    let reply = '';
    let safetyCaveat: string | undefined;
    let recommendedProducts: PublicProductDTO[] = [];

    // Catalog summary for Gemini context grounding
    const catalogSummary = allProducts.map((p) => ({
      title: p.title,
      sku: p.supplier_sku,
      category: p.category,
    }));

    // Safety & High-Risk Intent Detection
    if (lower.includes('live') && (lower.includes('wire') || lower.includes('circuit') || lower.includes('voltage') || lower.includes('shock'))) {
      const standardWarning =
        'SAFETY WARNING: Working on live electrical circuits poses severe risk of fatal shock or arc flash. Under the UK Electricity at Work Regulations 1989 and BS 7671 (IET Wiring Regulations), circuits must always be safely isolated before undertaking work.';
      safetyCaveat =
        'Never use uninsulated tools on electrical equipment. Insulated tools must carry certified BS EN IEC 60900 (1000V VDE) marks. Neon indicator screwdrivers are visual aids only and do not replace certified two-pole voltage testers.';

      const vdeDriver = productMap.get('IONESDRIVERS1P6');
      const neonTester = productMap.get('IONNEONTESTS1P10');
      const elecTape = productMap.get('IONPVCMC5PKX6');
      if (vdeDriver) recommendedProducts.push(vdeDriver);
      if (neonTester) recommendedProducts.push(neonTester);
      if (elecTape) recommendedProducts.push(elecTape);

      const geminiAi = await generateGeminiReply(prompt, catalogSummary, safetyCaveat);
      reply = geminiAi ? `${standardWarning} ${geminiAi}` : standardWarning;
    } else if (lower.includes('shelf') || lower.includes('brick') || lower.includes('plug') || lower.includes('masonry') || lower.includes('fixing')) {
      const defaultShelfReply =
        'For wall fixtures in solid masonry or brick, you must match the plug diameter directly to the masonry drill bit diameter (e.g. 6mm plug requires a 6mm hole) and select screws that exceed the plug length by at least 5mm plus the fixture thickness.';
      safetyCaveat =
        'Always scan for concealed electrical cables and plumbing pipes with a multi-detector prior to drilling. Standard plastic plugs are not suitable for heavy cantilevered loads or overhead ceiling suspensions.';

      const plugs = productMap.get('IONWPLUGS200P10');
      const drillBits = productMap.get('IONMASODBSET1P12');
      const clamps = productMap.get('ION2GCLAMP1P12');
      if (plugs) recommendedProducts.push(plugs);
      if (drillBits) recommendedProducts.push(drillBits);
      if (clamps) recommendedProducts.push(clamps);

      const geminiAi = await generateGeminiReply(prompt, catalogSummary, safetyCaveat);
      reply = geminiAi || defaultShelfReply;
    } else if (lower.includes('ladder') || lower.includes('height') || lower.includes('step') || lower.includes('load limit') || lower.includes('weight')) {
      const defaultLadderReply =
        'Our Ionos 3-step foldable ladder is engineered to BS EN 14183 standards with a verified 150KG maximum load capacity (including user and tools). Features anti-slip ribbed rubber feet and heavy-gauge tubular steel construction.';
      safetyCaveat =
        'Always verify the locking spreaders are fully engaged before ascending. Maintain 3 points of contact at all times. Never lean out sideways beyond the side stiles or stand on the top handrail.';

      const ladder = productMap.get('ION3SFLADDER1P1');
      const gloves = productMap.get('IONWGLOVES1P10');
      const goggles = productMap.get('IONPEGOGGLES1P12');
      if (ladder) recommendedProducts.push(ladder);
      if (gloves) recommendedProducts.push(gloves);
      if (goggles) recommendedProducts.push(goggles);

      const geminiAi = await generateGeminiReply(prompt, catalogSummary, safetyCaveat);
      reply = geminiAi || defaultLadderReply;
    } else if (lower.includes('tape') || lower.includes('paint') || lower.includes('masking') || lower.includes('skirting') || lower.includes('decorat')) {
      const defaultTapeReply =
        'For painting and decorating, use 23mm crepe masking tape for tight window margins and switch plates, and 48mm tape for skirting boards and floor protection. Pair with polythene dust sheets to catch paint splatters.';
      safetyCaveat =
        'Remove masking tape while the topcoat is touch-dry at a smooth 45-degree angle. Leaving utility masking tape on surfaces for more than 24 hours can bake adhesive onto wood trim.';

      const tape48 = productMap.get('IONMT48MM1PKX24');
      const tape23 = productMap.get('IONMT23MM2PKX24');
      const dustSheet = productMap.get('IONDUSTS1P24');
      if (tape48) recommendedProducts.push(tape48);
      if (tape23) recommendedProducts.push(tape23);
      if (dustSheet) recommendedProducts.push(dustSheet);

      const geminiAi = await generateGeminiReply(prompt, catalogSummary, safetyCaveat);
      reply = geminiAi || defaultTapeReply;
    } else {
      // General catalog query
      const searchRes = await searchProducts(prompt);
      recommendedProducts = searchRes.products.slice(0, 3);

      const geminiAi = await generateGeminiReply(
        prompt,
        recommendedProducts.map((p) => ({ title: p.title, sku: p.supplier_sku, category: p.category }))
      );

      if (geminiAi) {
        reply = geminiAi;
      } else if (recommendedProducts.length > 0) {
        reply = `Found ${searchRes.total} matching products in our verified UK supplier catalog. Here are the top items matching your requirements:`;
      } else {
        reply =
          'I could not find exact matching products for that query in our catalog. Try searching by tool category (e.g. pliers, screwdrivers, masking tape, wall plugs) or ask about project requirements.';
      }
    }

    return NextResponse.json({
      reply,
      safetyCaveat,
      recommendedProducts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process assistant request', message: error.message },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, getAllProducts } from '@/lib/catalog';
import { PublicProductDTO } from '@/types/product';

export const dynamic = 'force-dynamic';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantProjectPlan {
  title: string;
  steps: string[];
  estimatedMaterials?: { name: string; quantity: string }[];
}

interface GeminiAgentOutput {
  reply: string;
  safetyCaveat?: string;
  suggestedActions?: string[];
  projectPlan?: AssistantProjectPlan;
  relevantSkus?: string[];
}

async function callGeminiAgent(
  prompt: string,
  history: ChatMessage[],
  catalogContext: { title: string; sku: string; category: string; brand: string }[],
  safetyContext?: string
): Promise<GeminiAgentOutput | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const systemInstruction = `You are ToolCart UK's Senior AI Technical Hardware Agent & Trade Consultant.
ToolCart UK is a specialist distributor of verified trade-grade hand tools, fixings, decorating supplies, PPE, and site equipment.

Agent Persona & Tone:
- Authoritative British trade specialist (concise, practical, strictly accurate).
- Cite relevant British & European Standards (BS 7671 18th Edition wiring, BS EN IEC 60900 VDE 1000V insulation, BS EN 14183 step ladders, BS EN 166 eye protection, BS 5268 structural timber fixings).
- Project Estimation: When users mention dimensions, wall types, or project sizes, calculate exact fixing quantities and consumable pack recommendations.
- Zero Hallucinations: Ground tool recommendations solely in the verified ToolCart catalog provided.
- Commercial Confidentiality: NEVER mention or reveal wholesale costs, supplier margins, unit_cost_ex_vat_gbp, or case_cost_ex_vat_gbp.

Output Format:
You MUST respond with ONLY a valid, parseable JSON object adhering to this schema:
{
  "reply": "Direct, structured trade guidance in clean markdown (bullet points for steps where relevant).",
  "safetyCaveat": "Mandatory safety standard notice or HSE regulation warning, or null if low risk.",
  "suggestedActions": ["2 to 4 short, actionable follow-up chips the user can click next"],
  "projectPlan": {
    "title": "Title of project breakdown, or null if simple Q&A",
    "steps": ["Step 1: Preparation & isolation...", "Step 2: Fixing..."],
    "estimatedMaterials": [{"name": "Fixing / consumable name", "quantity": "e.g. 1 pack of 200"}]
  },
  "relevantSkus": ["SKU1", "SKU2"]
}`;

    const recentHistory = (history || []).slice(-6).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const userMessageContent = `Current User Query: "${prompt}"

Verified ToolCart UK Catalog Context (Trade-tested SKUs):
${JSON.stringify(catalogContext.slice(0, 12))}
${safetyContext ? `\nMandatory British Safety Baseline: ${safetyContext}` : ''}

Respond with valid JSON only.`;

    const contents = [
      ...recentHistory,
      {
        role: 'user',
        parts: [{ text: userMessageContent }],
      },
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!rawJson) return null;

    // Clean JSON markdown fences if present
    const cleanJson = rawJson.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleanJson) as GeminiAgentOutput;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, history } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const lower = prompt.toLowerCase();
    const allProducts = await getAllProducts();
    const productMap = new Map(allProducts.map((p) => [p.supplier_sku, p]));

    let reply = '';
    let safetyCaveat: string | undefined;
    let recommendedProducts: PublicProductDTO[] = [];
    let suggestedActions: string[] = [];
    let projectPlan: AssistantProjectPlan | undefined;

    // Compact public catalog summary for Gemini grounding
    const catalogContext = allProducts.map((p) => ({
      title: p.title,
      sku: p.supplier_sku,
      category: p.category,
      brand: p.brand,
    }));

    // Safety & High-Risk Intent Detection (Deterministic Safety Invariants)
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

      suggestedActions = [
        'Check BS EN IEC 60900 VDE Screwdriver Set',
        'Add Safe Isolation Tape & Testers to Basket',
        'View Electricity at Work Safe Isolation Guide',
      ];

      const agentResult = await callGeminiAgent(prompt, history || [], catalogContext, safetyCaveat);
      if (agentResult) {
        reply = `${standardWarning} ${agentResult.reply}`;
        if (agentResult.suggestedActions?.length) {
          suggestedActions = agentResult.suggestedActions;
        }
        if (agentResult.projectPlan) {
          projectPlan = agentResult.projectPlan;
        }
      } else {
        reply = standardWarning;
      }
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

      suggestedActions = [
        'Add Masonry Drill & 200pc Plugs to Basket',
        'Calculate Screws for 3 Shelves',
        'Compare Heavy-Duty Plugs vs Standard',
      ];

      const agentResult = await callGeminiAgent(prompt, history || [], catalogContext, safetyCaveat);
      if (agentResult) {
        reply = agentResult.reply || defaultShelfReply;
        if (agentResult.suggestedActions?.length) {
          suggestedActions = agentResult.suggestedActions;
        }
        if (agentResult.projectPlan) {
          projectPlan = agentResult.projectPlan;
        }
      } else {
        reply = defaultShelfReply;
      }
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

      suggestedActions = [
        'View BS EN 14183 Certification Details',
        'Add 3-Step Ladder & PPE Kit to Basket',
        'Check Safe Working Load for Site Equipment',
      ];

      const agentResult = await callGeminiAgent(prompt, history || [], catalogContext, safetyCaveat);
      if (agentResult) {
        reply = agentResult.reply || defaultLadderReply;
        if (agentResult.suggestedActions?.length) {
          suggestedActions = agentResult.suggestedActions;
        }
        if (agentResult.projectPlan) {
          projectPlan = agentResult.projectPlan;
        }
      } else {
        reply = defaultLadderReply;
      }
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

      suggestedActions = [
        'Add 23mm & 48mm Tape Bundle to Basket',
        'Calculate Dust Sheets for 12m² Room',
        'Best Removal Technique for Clean Lines',
      ];

      const agentResult = await callGeminiAgent(prompt, history || [], catalogContext, safetyCaveat);
      if (agentResult) {
        reply = agentResult.reply || defaultTapeReply;
        if (agentResult.suggestedActions?.length) {
          suggestedActions = agentResult.suggestedActions;
        }
        if (agentResult.projectPlan) {
          projectPlan = agentResult.projectPlan;
        }
      } else {
        reply = defaultTapeReply;
      }
    } else {
      // General catalog query / intelligent agentic dialogue
      const searchRes = await searchProducts(prompt);
      recommendedProducts = searchRes.products.slice(0, 3);

      const agentResult = await callGeminiAgent(
        prompt,
        history || [],
        catalogContext,
        safetyCaveat
      );

      if (agentResult) {
        reply = agentResult.reply;
        if (agentResult.safetyCaveat) {
          safetyCaveat = agentResult.safetyCaveat;
        }
        if (agentResult.suggestedActions?.length) {
          suggestedActions = agentResult.suggestedActions;
        }
        if (agentResult.projectPlan) {
          projectPlan = agentResult.projectPlan;
        }
        // If agent mentioned specific SKUs, blend them into recommendations
        if (agentResult.relevantSkus?.length) {
          for (const sku of agentResult.relevantSkus) {
            const p = productMap.get(sku);
            if (p && !recommendedProducts.some((rp) => rp.supplier_sku === p.supplier_sku)) {
              recommendedProducts.push(p);
            }
          }
          recommendedProducts = recommendedProducts.slice(0, 4);
        }
      } else if (recommendedProducts.length > 0) {
        reply = `Found ${searchRes.total} matching products in our verified UK supplier catalog. Here are the top items matching your trade requirements:`;
        suggestedActions = [
          `Add ${recommendedProducts[0]?.title.slice(0, 24)}... to Basket`,
          'Check Technical Specifications',
          'Calculate Pack Requirements',
        ];
      } else {
        reply =
          'I could not find exact matching products for that query in our catalog. Try searching by tool category (e.g. pliers, screwdrivers, masking tape, wall plugs) or ask about project requirements.';
        suggestedActions = [
          'Show Hand Tools & Screwdrivers',
          'Show Wall Plugs & Fixings',
          'Show Workwear & Safety Goggles',
        ];
      }
    }

    // Always sanitize against wholesale cost disclosure (commercial confidentiality invariant)
    const sanitizedProducts = recommendedProducts.map((p) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ...safeProduct } = p as any;
      delete safeProduct.unit_cost_ex_vat_gbp;
      delete safeProduct.case_cost_ex_vat_gbp;
      delete safeProduct.supplier_margin_gbp;
      return safeProduct as PublicProductDTO;
    });

    return NextResponse.json({
      reply,
      safetyCaveat,
      recommendedProducts: sanitizedProducts,
      suggestedActions,
      projectPlan,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process assistant request', message: error.message },
      { status: 500 }
    );
  }
}


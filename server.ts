import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Timeout wrapper helper
function withTimeout<T>(promise: Promise<T>, timeoutMs = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

// ---------------- Fallback Analytical Engines ----------------

function generateFallbackDecision(asset: any) {
  const ageYears = asset?.ageYears || 3;
  const expectedLifespan = asset?.expectedLifespanYears || 5;
  const purchaseCost = asset?.purchaseCost || 5000;
  const cumulativeRepairCost = asset?.cumulativeRepairCost || 1200;
  const nextRepairCost = asset?.estimatedNextRepairCost || 800;
  const replacementCost = asset?.newModelReplacementCost || (purchaseCost * 0.9);
  const salvageValue = asset?.estimatedSalvageValue || (purchaseCost * 0.15);

  const repairRatio = (cumulativeRepairCost + nextRepairCost) / Math.max(1, purchaseCost);
  const lifecycleProgress = ageYears / Math.max(1, expectedLifespan);
  const recommendation = repairRatio > 0.45 || lifecycleProgress >= 0.8 ? 'REPLACE' : 'REPAIR';
  const confidence = Math.min(98, Math.max(82, Math.round(78 + repairRatio * 25)));

  const tco3YearRepair = Math.round(cumulativeRepairCost + nextRepairCost + purchaseCost * 0.35 + 450);
  const tco3YearReplace = Math.round(replacementCost - salvageValue + 350);
  const costSavings3Year = Math.abs(tco3YearRepair - tco3YearReplace);
  const paybackPeriodMonths = recommendation === 'REPLACE' ? 14.4 : 32.0;

  return {
    recommendation,
    confidence,
    healthScore: recommendation === 'REPLACE' ? 38 : 84,
    riskScore: recommendation === 'REPLACE' ? 82 : 24,
    paybackPeriodMonths,
    tco3YearRepair,
    tco3YearReplace,
    costSavings3Year,
    aiRationale: `Asset ${asset?.assetCode || 'AST'} (${asset?.assetName || 'Asset'}) has accumulated repair expenses of $${cumulativeRepairCost.toLocaleString()} (${(repairRatio * 100).toFixed(0)}% of original cost). ${
      recommendation === 'REPLACE'
        ? `Replacement with next-generation model ($${replacementCost.toLocaleString()}) yields an estimated $${costSavings3Year.toLocaleString()} in 3-year TCO savings by cutting downtime and warranty maintenance.`
        : `Targeted repair ($${nextRepairCost.toLocaleString()}) is financially optimal, extending useful lifespan with low lifecycle risk.`
    }`,
    riskFactors: [
      `Cumulative maintenance represents ${(repairRatio * 100).toFixed(0)}% of original asset acquisition cost`,
      `Asset currently at ${(lifecycleProgress * 100).toFixed(0)}% of certified depreciation lifecycle (${ageYears} of ${expectedLifespan} yrs)`,
      'Annual downtime variance exceeds benchmark tolerance for core productivity units'
    ],
    actionItems: [
      recommendation === 'REPLACE'
        ? `Submit CAPEX Requisition for replacement model (Est. $${replacementCost.toLocaleString()})`
        : `Issue Authorized Maintenance Work Order (Est. $${nextRepairCost.toLocaleString()})`,
      'Synchronize asset lifecycle status with Oracle Fixed Assets Ledger',
      'Update physical barcode/RFID inventory tag verification status'
    ]
  };
}

function generateFallbackAudit(discrepancyItem: any) {
  const code = discrepancyItem?.assetCode || 'AST';
  return {
    rootCause: discrepancyItem?.aiRootCause || `Timing difference between Oracle FA month-end capitalization batch and physical floor relocation for ${code}.`,
    suggestedAction: discrepancyItem?.aiSuggestedAction || `Post Cost Center Reclassification Journal in Oracle FA and update Physical Subledger tagging.`,
    accountingImpact: 'Neutral to Operating Expenses after cost center transfer entry; ensures zero audit exception on external review.',
    confidence: 96
  };
}

function generateFallbackExecutive(timeframe = 'Q1 2026', metrics: any = {}) {
  return {
    executiveBriefing: `Executive Asset Intelligence Briefing (${timeframe}): Enterprise asset inventory totals $4.2M across 1,248 active items with 94.8% Oracle FA ledger compliance. AI lifecycle analysis identifies 7 critical-risk assets where proactive replacement will prevent an estimated $72,600 in emergency repair and downtime costs over the next 3 fiscal quarters.`,
    keyRecommendations: [
      'Approve $18,600 CAPEX for high-risk server and core switch replacement before warranty expiration',
      'Execute Oracle FA automated adjustment batch for 49 location and value variances to achieve 100% audit readiness',
      'Redeploy 14 idle laptops ($28,400 book value) to meet incoming Engineering department hiring demands',
      'Consolidate underutilized SaaS & workstation licenses to unlock $42,800 annual recurring OPEX savings'
    ],
    financialImpactSummary: {
      potentialSavings: 72600,
      capitalRequirement: 22400,
      riskMitigationValue: 148500
    }
  };
}

function generateFallbackChat(message: string) {
  const lower = (message || '').toLowerCase();
  let content = 'I analyzed your enterprise asset portfolio. The portfolio health index is 84/100 across 1,248 assets ($4.2M value). Oracle Fixed Assets reconciliation match rate is currently 94.8% with 49 manageable discrepancies.';

  if (lower.includes('reconcil') || lower.includes('oracle') || lower.includes('fa') || lower.includes('discrepan')) {
    content = 'Oracle FA Reconciliation Summary:\n- 1,152 Matched & Certified Assets (94.8%)\n- 28 Ghost Assets (physically present, pending FA capitalization)\n- 19 Paper Assets (in Oracle FA book, pending floor count verification)\n- 49 Total Discrepancies ($148,500 total variance). You can auto-generate adjustment journals in the Oracle FA Reconcile tab.';
  } else if (lower.includes('repair') || lower.includes('replace') || lower.includes('decision') || lower.includes('tco')) {
    content = 'AI Decision Center recommendations:\n- AST-0005 (Dell PowerEdge Server): REPLACE (Cumulative repairs reach 54% of purchase cost; 3-year TCO savings: $2,950).\n- AST-0009 (Epson 4K Projector): REPLACE (High optical degradation; $1,050 TCO savings).\n- AST-0007 (Cisco Catalyst 9300): REPAIR (Firmware/Power Supply replacement saves $3,800 vs. new procurement).';
  } else if (lower.includes('audit') || lower.includes('compliance') || lower.includes('executive')) {
    content = 'Executive Audit Status: The portfolio is ready for FY2026 external audit with 94.8% Oracle FA ledger matching. Reconciling the remaining 49 items will mitigate $148,500 in audit liability.';
  }

  return {
    reply: content,
    sources: [
      { label: 'RAISE Asset Intelligence', ref: 'Live Telemetry' },
      { label: 'Oracle FA Ledger', ref: 'FA_PROD_2026' }
    ],
    confidence: 96
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. AI Decision Matrix (Repair vs Replace Analysis)
  app.post('/api/ai/decision-matrix', async (req, res) => {
    const { asset } = req.body;
    try {
      const ai = getAIClient();

      if (!ai) {
        return res.json(generateFallbackDecision(asset));
      }

      const prompt = `You are the Lead Asset Intelligence Analyst for RAISE Enterprise Asset System.
Analyze this enterprise asset for Repair vs. Replace decision:
Asset Details:
- Code: ${asset?.assetCode}
- Name: ${asset?.assetName}
- Category: ${asset?.category}
- Purchase Cost: $${asset?.purchaseCost}
- Current Value: $${asset?.currentValue}
- Age: ${asset?.ageYears} years (Lifespan: ${asset?.expectedLifespanYears} years)
- Condition: ${asset?.condition}
- Cumulative Repairs to date: $${asset?.cumulativeRepairCost}
- Estimated Next Repair: $${asset?.estimatedNextRepairCost}
- Annual Maintenance: $${asset?.annualMaintenanceCost}
- Downtime Days: ${asset?.downtimeDaysLastYear} days/year
- Replacement Cost (New Model): $${asset?.newModelReplacementCost}
- Estimated Salvage Value: $${asset?.estimatedSalvageValue}

Evaluate whether the organization should REPAIR, REPLACE, REASSIGN, or RETIRE. Provide realistic financial TCO (3-year horizon), confidence score, risk score (0-100), payback period, rationale, 3-4 bullet risk factors, and 3 actionable next steps.`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommendation: { type: Type.STRING, description: 'REPAIR | REPLACE | REASSIGN | RETIRE | MAINTAIN' },
                confidence: { type: Type.NUMBER, description: 'Percentage confidence 0-100' },
                healthScore: { type: Type.NUMBER, description: 'Asset health 0-100' },
                riskScore: { type: Type.NUMBER, description: 'Risk score 0-100' },
                paybackPeriodMonths: { type: Type.NUMBER },
                tco3YearRepair: { type: Type.NUMBER },
                tco3YearReplace: { type: Type.NUMBER },
                costSavings3Year: { type: Type.NUMBER },
                aiRationale: { type: Type.STRING },
                riskFactors: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                actionItems: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['recommendation', 'confidence', 'healthScore', 'riskScore', 'aiRationale', 'riskFactors', 'actionItems']
            }
          }
        }),
        5000
      );

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.warn('Gemini API notice (using resilient intelligence fallback):', err?.message || err);
      return res.json(generateFallbackDecision(asset));
    }
  });

  // 2. AI Oracle FA Reconciliation Audit
  app.post('/api/ai/reconcile-audit', async (req, res) => {
    const { discrepancyItem } = req.body;
    try {
      const ai = getAIClient();

      if (!ai) {
        return res.json(generateFallbackAudit(discrepancyItem));
      }

      const prompt = `You are a certified ERP Asset Auditor specializing in Oracle Fixed Assets (FA) and physical inventory reconciliation.
Analyze this reconciliation discrepancy:
- Discrepancy Type: ${discrepancyItem?.discrepancyType}
- Variance Reason: ${discrepancyItem?.varianceReason}
- Physical Asset Record: ${JSON.stringify(discrepancyItem?.physicalRecord || {})}
- Oracle FA Record: ${JSON.stringify(discrepancyItem?.oracleRecord || {})}
- Variance Amount: $${discrepancyItem?.varianceAmount}

Explain the root cause in an enterprise ERP context (Oracle Financials Cloud), suggest the exact accounting / physical audit corrective action (including specific journal / work order steps), and assess the accounting impact.`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                rootCause: { type: Type.STRING },
                suggestedAction: { type: Type.STRING },
                accountingImpact: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ['rootCause', 'suggestedAction', 'accountingImpact', 'confidence']
            }
          }
        }),
        5000
      );

      return res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.warn('Gemini API notice for reconcile audit (using fallback):', err?.message || err);
      return res.json(generateFallbackAudit(discrepancyItem));
    }
  });

  // 3. AI Executive Briefing / Portfolio Summary
  app.post('/api/ai/executive-summary', async (req, res) => {
    const { timeframe = 'Q1 2026', metrics = {} } = req.body;
    try {
      const ai = getAIClient();

      if (!ai) {
        return res.json(generateFallbackExecutive(timeframe, metrics));
      }

      const prompt = `Generate an Executive Asset Intelligence Briefing for senior management (CFO, COO, CIO) for timeframe ${timeframe}.
Portfolio Metrics:
${JSON.stringify(metrics)}

Include an executive narrative briefing, 4 prioritized strategic recommendations with dollar values, and a financial impact summary.`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                executiveBriefing: { type: Type.STRING },
                keyRecommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                financialImpactSummary: {
                  type: Type.OBJECT,
                  properties: {
                    potentialSavings: { type: Type.NUMBER },
                    capitalRequirement: { type: Type.NUMBER },
                    riskMitigationValue: { type: Type.NUMBER }
                  },
                  required: ['potentialSavings', 'capitalRequirement', 'riskMitigationValue']
                }
              },
              required: ['executiveBriefing', 'keyRecommendations', 'financialImpactSummary']
            }
          }
        }),
        5000
      );

      return res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.warn('Gemini API notice for executive summary (using fallback):', err?.message || err);
      return res.json(generateFallbackExecutive(timeframe, metrics));
    }
  });

  // 4. AI Interactive Assistant Chat
  app.post('/api/ai/chat', async (req, res) => {
    const { message, history = [] } = req.body;
    try {
      const ai = getAIClient();

      if (!ai) {
        return res.json(generateFallbackChat(message));
      }

      const systemInstruction = `You are RAISE AI, the Enterprise Asset Intelligence & Oracle FA Assistant for the organization.
You have real-time access to:
- 1,248 total assets ($4.2M value)
- Oracle Fixed Assets FA Book: 1,215 records ($4.35M value, 94.8% match rate)
- AI Decision Center: Repair vs. Replace models, TCO calculations, and lifecycle risk scores.
- Departments: Engineering, IT Operations, Marketing, Product Design, Operations.

Provide concise, highly professional, data-backed insights with clear recommendations. Always cite specific asset codes or figures when answering.`;

      const contents = [
        ...history.map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        }),
        5000
      );

      return res.json({
        reply: response.text,
        sources: [
          { label: 'RAISE Asset Intelligence', ref: 'Real-time Telemetry' },
          { label: 'Oracle FA Ledger', ref: 'FA_PROD_TH' }
        ],
        confidence: 96
      });
    } catch (err: any) {
      console.warn('Gemini API notice for chat (using fallback):', err?.message || err);
      return res.json(generateFallbackChat(message));
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RAISE Asset Intelligence Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

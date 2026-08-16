export interface AssetDecisionProfile {
  assetId: string;
  assetCode: string;
  assetName: string;
  category: string;
  department: string;
  location: string;
  purchaseCost: number;
  currentValue: number;
  ageYears: number;
  expectedLifespanYears: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  status: string;
  
  // Maintenance metrics
  cumulativeRepairCost: number;
  estimatedNextRepairCost: number;
  annualMaintenanceCost: number;
  downtimeDaysLastYear: number;
  failureRatePerYear: number;
  mtbfHours: number; // Mean Time Between Failures
  mttrHours: number; // Mean Time To Repair
  
  // Replacement metrics
  newModelReplacementCost: number;
  newModelEnergySavingsYear: number;
  estimatedSalvageValue: number;
  
  // AI calculated
  healthScore: number; // 0-100 (100 = best)
  riskScore: number; // 0-100 (100 = highest risk)
  recommendation: 'REPAIR' | 'REPLACE' | 'REASSIGN' | 'RETIRE' | 'MAINTAIN';
  recommendationConfidence: number; // %
  paybackPeriodMonths: number;
  tco3YearRepair: number;
  tco3YearReplace: number;
  costSavings3Year: number;
  aiRationale: string;
  riskFactors: string[];
  actionItems: string[];
}

export const sampleDecisionProfiles: AssetDecisionProfile[] = [
  {
    assetId: 'a5',
    assetCode: 'AST-0005',
    assetName: 'Dell PowerEdge R750 Server',
    category: 'IT Equipment',
    department: 'IT Operations',
    location: 'Server Room B',
    purchaseCost: 12500,
    currentValue: 3200,
    ageYears: 4.2,
    expectedLifespanYears: 5,
    condition: 'Fair',
    status: 'In Maintenance',
    cumulativeRepairCost: 6800,
    estimatedNextRepairCost: 2800,
    annualMaintenanceCost: 2400,
    downtimeDaysLastYear: 12,
    failureRatePerYear: 3.5,
    mtbfHours: 720,
    mttrHours: 18,
    newModelReplacementCost: 11200,
    newModelEnergySavingsYear: 1100,
    estimatedSalvageValue: 800,
    healthScore: 38,
    riskScore: 84,
    recommendation: 'REPLACE',
    recommendationConfidence: 94,
    paybackPeriodMonths: 14.5,
    tco3YearRepair: 14200,
    tco3YearReplace: 10400,
    costSavings3Year: 3800,
    aiRationale: 'Cumulative maintenance ($6.8k) already exceeds 54% of initial purchase price. The estimated next repair ($2.8k) plus ongoing downtime costs render replacement with modern energy-efficient Dell PowerEdge R760 significantly more cost-effective with a 14.5-month ROI.',
    riskFactors: [
      'Cumulative repairs exceed 50% threshold of acquisition cost',
      'High MTTR (18h) causes unacceptable critical service SLA outages',
      'OEM warranty expired; spare parts lead time > 14 days',
      'High thermal load and power consumption compared to modern Gen16 architecture'
    ],
    actionItems: [
      'Submit CAPEX Purchase Requisition for Dell PowerEdge R760 ($11,200)',
      'Schedule VM migration to standby cluster node prior to decommissioning',
      'Initiate e-Waste trade-in valuation with certified ITAD partner (est. $800 salvage)'
    ]
  },
  {
    assetId: 'a9',
    assetCode: 'AST-0009',
    assetName: 'Epson PowerLite Pro L1505UH Projector',
    category: 'Office Equipment',
    department: 'Operations',
    location: 'Main Auditorium',
    purchaseCost: 8900,
    currentValue: 1400,
    ageYears: 5.1,
    expectedLifespanYears: 5,
    condition: 'Poor',
    status: 'Available',
    cumulativeRepairCost: 4100,
    estimatedNextRepairCost: 1950,
    annualMaintenanceCost: 950,
    downtimeDaysLastYear: 8,
    failureRatePerYear: 2.8,
    mtbfHours: 480,
    mttrHours: 24,
    newModelReplacementCost: 7400,
    newModelEnergySavingsYear: 450,
    estimatedSalvageValue: 300,
    healthScore: 32,
    riskScore: 88,
    recommendation: 'REPLACE',
    recommendationConfidence: 91,
    paybackPeriodMonths: 18.2,
    tco3YearRepair: 8800,
    tco3YearReplace: 6950,
    costSavings3Year: 1850,
    aiRationale: 'Lamp unit degraded to 70% life with color misalignment. Optical engine repair exceeds 139% of current book value. A high-efficiency Laser LED display provides superior lumens, zero lamp replacement costs, and 5-year maintenance-free operation.',
    riskFactors: [
      'Overdue preventive maintenance by 8+ days',
      'Lamp hours at critical limit with sudden burnout risk during executive meetings',
      'Depreciated below scrap baseline ($1,400 book value)'
    ],
    actionItems: [
      'Create Procurement RFP for Laser Projector / 4K LED Display Wall',
      'Set status to "Restricted Use / Non-Critical Events Only"',
      'Reconcile with Oracle FA ledger for retirement write-off'
    ]
  },
  {
    assetId: 'a7',
    assetCode: 'AST-0007',
    assetName: 'Cisco Catalyst 9300 48-Port Switch',
    category: 'IT Equipment',
    department: 'IT Operations',
    location: 'IDF Rack 3, Floor 2',
    purchaseCost: 6200,
    currentValue: 3900,
    ageYears: 2.3,
    expectedLifespanYears: 7,
    condition: 'Good',
    status: 'Assigned',
    cumulativeRepairCost: 400,
    estimatedNextRepairCost: 650,
    annualMaintenanceCost: 350,
    downtimeDaysLastYear: 1,
    failureRatePerYear: 0.2,
    mtbfHours: 45000,
    mttrHours: 2,
    newModelReplacementCost: 6800,
    newModelEnergySavingsYear: 120,
    estimatedSalvageValue: 2400,
    healthScore: 82,
    riskScore: 28,
    recommendation: 'REPAIR',
    recommendationConfidence: 96,
    paybackPeriodMonths: 36,
    tco3YearRepair: 1700,
    tco3YearReplace: 5200,
    costSavings3Year: 3500,
    aiRationale: 'Asset is in the prime of its lifecycle (2.3/7 years) with excellent hardware health and high MTBF (45,000 hrs). Minor firmware/power supply servicing is 67% cheaper than premature replacement.',
    riskFactors: [
      'Requires urgent IOS-XE security patch (CVE-2025-1142)',
      'Power supply module B showing fan RPM variance (+12%)'
    ],
    actionItems: [
      'Schedule maintenance window this Saturday 02:00 AM for firmware upgrade',
      'Replace secondary power supply under Smart Net Total Care contract ($0 parts cost)',
      'Update Cisco Smart Account license entitlement'
    ]
  },
  {
    assetId: 'a11',
    assetCode: 'AST-0011',
    assetName: 'Apple MacBook Air 13" M2 (16GB/512GB)',
    category: 'IT Equipment',
    department: 'HQ Storage',
    location: 'Cabinet IT-04',
    purchaseCost: 1499,
    currentValue: 1050,
    ageYears: 1.1,
    expectedLifespanYears: 4,
    condition: 'Excellent',
    status: 'Available',
    cumulativeRepairCost: 0,
    estimatedNextRepairCost: 0,
    annualMaintenanceCost: 0,
    downtimeDaysLastYear: 0,
    failureRatePerYear: 0,
    mtbfHours: 80000,
    mttrHours: 1,
    newModelReplacementCost: 1499,
    newModelEnergySavingsYear: 0,
    estimatedSalvageValue: 850,
    healthScore: 95,
    riskScore: 12,
    recommendation: 'REASSIGN',
    recommendationConfidence: 98,
    paybackPeriodMonths: 0,
    tco3YearRepair: 0,
    tco3YearReplace: 1499,
    costSavings3Year: 1499,
    aiRationale: 'Asset has been sitting idle for 94 days in storage despite pristine hardware condition and 2.9 years remaining useful life. Immediate redeployment satisfies pending Engineering onboarding request, saving $1,499 in new hardware procurement.',
    riskFactors: [
      'Unrealized depreciation loss during idle storage ($37/month)',
      'Battery self-discharge risk if left uncharged > 6 months'
    ],
    actionItems: [
      'Assign to Engineering department for new hire onboarding',
      'Run Apple Diagnostics battery calibration check',
      'Generate Employee Asset Transfer Handover Slip'
    ]
  },
  {
    assetId: 'a13',
    assetCode: 'AST-0013',
    assetName: 'Dell OptiPlex 7090 Micro',
    category: 'IT Equipment',
    department: 'Warehouse',
    location: 'Shelf Scrap-A',
    purchaseCost: 980,
    currentValue: 0,
    ageYears: 4.8,
    expectedLifespanYears: 4,
    condition: 'Poor',
    status: 'Retired',
    cumulativeRepairCost: 820,
    estimatedNextRepairCost: 450,
    annualMaintenanceCost: 180,
    downtimeDaysLastYear: 45,
    failureRatePerYear: 4,
    mtbfHours: 200,
    mttrHours: 48,
    newModelReplacementCost: 890,
    newModelEnergySavingsYear: 60,
    estimatedSalvageValue: 40,
    healthScore: 10,
    riskScore: 95,
    recommendation: 'RETIRE',
    recommendationConfidence: 99,
    paybackPeriodMonths: 0,
    tco3YearRepair: 1540,
    tco3YearReplace: 890,
    costSavings3Year: 650,
    aiRationale: 'Fully depreciated ($0 net book value) with motherboard and fan failure. Continued storage incurs warehousing overhead ($15/mo). Certified recycling and write-off closure is recommended immediately.',
    riskFactors: [
      'Hard drive contains uncertified historical data requiring NIST 800-88 purge',
      'Occupying physical warehouse space beyond 6-month retention policy'
    ],
    actionItems: [
      'Execute cryptographic SSD data wipe & sign certificate of destruction',
      'Submit Oracle FA Asset Disposal Entry (Gain/Loss: $0)',
      'Consign to certified ITAD e-waste recycling vendor'
    ]
  }
];

export interface DecisionSimulationInput {
  assetId: string;
  repairCost: number;
  replacementCost: number;
  downtimeCostPerDay: number;
  expectedLifespanExtensionYears: number;
  salvageValue: number;
  annualEnergyInflationRate: number;
}

export function calculateSimulation(input: DecisionSimulationInput, baseProfile: AssetDecisionProfile) {
  const years = 3;
  const downtimeDaysYear = baseProfile.downtimeDaysLastYear;
  
  // 3-Year Repair TCO
  const repairTco = 
    input.repairCost + 
    (baseProfile.annualMaintenanceCost * years * 1.15) + 
    (downtimeDaysYear * input.downtimeCostPerDay * years);

  // 3-Year Replace TCO (including energy savings & salvage deduction)
  const replaceTco = 
    (input.replacementCost - input.salvageValue) + 
    (baseProfile.annualMaintenanceCost * 0.25 * years) - 
    (baseProfile.newModelEnergySavingsYear * years * (1 + input.annualEnergyInflationRate / 100));

  const netSavings = repairTco - replaceTco;
  const roiPercent = ((netSavings / (input.replacementCost || 1)) * 100);
  const breakEvenMonths = Math.max(1, Math.min(36, ((input.replacementCost - input.salvageValue) / Math.max(1, (repairTco - replaceTco) / 36))));
  
  const recommendedAction = netSavings > 500 ? 'REPLACE' : netSavings < -500 ? 'REPAIR' : 'MAINTAIN';
  const confidence = Math.min(99, Math.max(70, Math.round(75 + Math.abs(netSavings) / 200)));

  return {
    repairTco: Math.round(repairTco),
    replaceTco: Math.round(replaceTco),
    netSavings: Math.round(netSavings),
    roiPercent: Math.round(roiPercent),
    breakEvenMonths: Number(breakEvenMonths.toFixed(1)),
    recommendedAction,
    confidence
  };
}

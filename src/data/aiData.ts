import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Clock,
  Lightbulb,
  TrendingDown,
  Package,
  ShieldCheck,
  Activity,
  Zap,
} from 'lucide-react';

export type InsightSeverity = 'high' | 'medium' | 'low' | 'info';
export type InsightCategory = 'risk' | 'optimization' | 'warranty' | 'utilization' | 'cost';

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  category: InsightCategory;
  icon: LucideIcon;
  count: number;
  confidence: number;
  evidence: string[];
  actionLabel: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  assetCode: string;
  assetName: string;
  confidence: number;
  severity: InsightSeverity;
  evidence: string[];
  recommendation: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: { label: string; ref: string }[];
  confidence?: number;
  actions?: { label: string; action: string }[];
}

export const aiInsights: AIInsight[] = [
  {
    id: 'ins-1',
    title: 'High Lifecycle Risk',
    description: '7 assets have high lifecycle risk due to age and warranty status',
    severity: 'high',
    category: 'risk',
    icon: AlertTriangle,
    count: 7,
    confidence: 82,
    evidence: [
      'Warranty expires within 90 days',
      'Asset age exceeds 4 years',
      'Low utilization score detected',
    ],
    actionLabel: 'View Assets',
  },
  {
    id: 'ins-2',
    title: 'Idle Assets Detected',
    description: '14 assets have been idle for more than 90 days',
    severity: 'medium',
    category: 'utilization',
    icon: Clock,
    count: 14,
    confidence: 91,
    evidence: [
      'No assignment recorded in 90+ days',
      'Last activity timestamp exceeds threshold',
      'Located in storage or unassigned',
    ],
    actionLabel: 'Review Idle',
  },
  {
    id: 'ins-3',
    title: 'Warranty Expiry Approaching',
    description: '23 assets have warranties expiring within 60 days',
    severity: 'medium',
    category: 'warranty',
    icon: ShieldCheck,
    count: 23,
    confidence: 96,
    evidence: [
      'Warranty end date within 60-day window',
      '3 assets are critical infrastructure',
      'Extended coverage available from vendor',
    ],
    actionLabel: 'View Warranties',
  },
  {
    id: 'ins-4',
    title: 'Cost Optimization',
    description: 'Potential $42,800 annual savings from license consolidation',
    severity: 'info',
    category: 'cost',
    icon: Lightbulb,
    count: 5,
    confidence: 78,
    evidence: [
      '4 software licenses have unused seats exceeding 20%',
      '2 duplicate tool subscriptions detected',
      'Annual renewal cycle approaching for 3 contracts',
    ],
    actionLabel: 'View Report',
  },
  {
    id: 'ins-5',
    title: 'Depreciation Acceleration',
    description: 'Monthly depreciation increased 8.2% vs. previous period',
    severity: 'low',
    category: 'cost',
    icon: TrendingDown,
    count: 0,
    confidence: 88,
    evidence: [
      'Batch of 32 assets crossed 50% value threshold',
      'Infrastructure assets aging faster than expected',
      'Current book value deviates from projected curve',
    ],
    actionLabel: 'View Analysis',
  },
];

export const aiRecommendations: AIRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Reassign Idle MacBook Air',
    description: 'AST-0011 has been idle for 94 days in HQ storage',
    assetCode: 'AST-0011',
    assetName: 'MacBook Air M2',
    confidence: 87,
    severity: 'medium',
    evidence: [
      'No assignment since purchase date',
      'Located in available storage',
      'Engineering team has 3 open requests for laptops',
    ],
    recommendation: 'Assign to Engineering team — 3 pending laptop requests match this asset profile.',
    status: 'pending',
  },
  {
    id: 'rec-2',
    title: 'Schedule Preventive Maintenance',
    description: 'AST-0007 Cisco Catalyst 9300 due for firmware upgrade',
    assetCode: 'AST-0007',
    assetName: 'Cisco Catalyst 9300',
    confidence: 93,
    severity: 'high',
    evidence: [
      'Current firmware 6 months behind latest release',
      'Security advisory CVE-2025-1142 affects current version',
      'Maintenance window available this weekend',
    ],
    recommendation: 'Schedule urgent firmware upgrade during weekend maintenance window.',
    status: 'pending',
  },
  {
    id: 'rec-3',
    title: 'Renew Expiring License',
    description: 'JetBrains All Products Pack expires in 34 days',
    assetCode: 'N/A',
    assetName: 'JetBrains All Products Pack',
    confidence: 95,
    severity: 'medium',
    evidence: [
      '74 of 80 seats actively used (92.5% utilization)',
      'Renewal discount of 15% available before expiry',
      'No alternative vendor evaluation in progress',
    ],
    recommendation: 'Renew now to lock in 15% early-bird discount and avoid service interruption.',
    status: 'pending',
  },
  {
    id: 'rec-4',
    title: 'Dispose Retired Asset',
    description: 'AST-0013 Dell OptiPlex 7090 has been retired for 12 months',
    assetCode: 'AST-0013',
    assetName: 'Dell OptiPlex 7090',
    confidence: 84,
    severity: 'low',
    evidence: [
      'Retired since March 2024',
      'Current value: $0',
      'Storage costs accumulating at $15/month',
      'IT asset disposal policy requires action after 6 months',
    ],
    recommendation: 'Process disposal through approved e-waste vendor to free storage space.',
    status: 'pending',
  },
  {
    id: 'rec-5',
    title: 'Consolidate Software Licenses',
    description: 'Zoom Phone Pro has 44 unused seats',
    assetCode: 'N/A',
    assetName: 'Zoom Phone Pro',
    confidence: 81,
    severity: 'info',
    evidence: [
      '200 seats purchased, only 156 in use',
      '22% seat waste rate',
      'Annual cost: $36,000 — potential savings $7,920',
    ],
    recommendation: 'Reduce seat count to 175 at next renewal to save $7,920 annually.',
    status: 'pending',
  },
];

export const aiSuggestedQuestions = [
  'Which assets are at high risk?',
  'Show me idle assets in storage',
  'What warranties expire this quarter?',
  'How can I reduce software costs?',
  'Which assets need maintenance soon?',
];

export const aiChatHistory: AIChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: "Good morning, Alex. I've analyzed your asset portfolio. Here are 3 things that need your attention today:",
    timestamp: '9:00 AM',
    sources: [
      { label: 'Asset Database', ref: '1,248 assets' },
      { label: 'Maintenance Log', ref: '7 records' },
    ],
    confidence: 94,
    actions: [
      { label: 'View Insights', action: 'insights' },
      { label: 'Open Recommendations', action: 'recommendations' },
    ],
  },
];

export const aiChatResponses: Record<string, AIChatMessage> = {
  'high risk': {
    id: 'resp-risk',
    role: 'assistant',
    content: 'I found 7 assets with high lifecycle risk. The primary factors are warranty expiry within 90 days, asset age exceeding 4 years, and declining utilization scores. The most critical is the Dell PowerEdge R750 (AST-0005) — it is currently in maintenance with a warranty expiring in 90 days.',
    timestamp: 'now',
    sources: [
      { label: 'Asset Records', ref: 'AST-0005, AST-0009, AST-0013' },
      { label: 'Warranty Database', ref: '7 entries' },
    ],
    confidence: 82,
    actions: [
      { label: 'View At-Risk Assets', action: 'assets' },
      { label: 'Export Report', action: 'export' },
    ],
  },
  'idle': {
    id: 'resp-idle',
    role: 'assistant',
    content: '14 assets have been idle for more than 90 days. 5 are in HQ Storage, 3 in Branch - Boston, and 6 in the Warehouse. The MacBook Air M2 (AST-0011) has the longest idle period at 94 days. I recommend reassigning it to Engineering where 3 laptop requests are pending.',
    timestamp: 'now',
    sources: [
      { label: 'Assignment History', ref: '14 records' },
      { label: 'Storage Inventory', ref: '3 locations' },
    ],
    confidence: 91,
    actions: [
      { label: 'View Idle Assets', action: 'assets' },
      { label: 'Review Recommendations', action: 'recommendations' },
    ],
  },
  'warranty': {
    id: 'resp-warranty',
    role: 'assistant',
    content: '23 assets have warranties expiring within 60 days. 3 of these are critical infrastructure components (servers, routers). The total replacement cost if not renewed is estimated at $48,200. I recommend prioritizing the Dell PowerEdge R750 and Cisco Catalyst 9300 for extended warranty coverage.',
    timestamp: 'now',
    sources: [
      { label: 'Warranty Registry', ref: '23 entries' },
      { label: 'Vendor Contracts', ref: '5 vendors' },
    ],
    confidence: 96,
    actions: [
      { label: 'View Warranty Report', action: 'reports' },
      { label: 'Contact Vendors', action: 'vendors' },
    ],
  },
  'cost': {
    id: 'resp-cost',
    role: 'assistant',
    content: 'I identified $42,800 in potential annual savings. The main opportunities are: (1) Consolidate Zoom Phone Pro seats from 200 to 175 — saves $7,920/year. (2) Evaluate alternatives to Oracle Database 19c (expired) — saves $9,600/year. (3) Negotiate volume discount on Microsoft 365 E5 — projected 12% reduction saves $34,200/year.',
    timestamp: 'now',
    sources: [
      { label: 'License Database', ref: '8 products' },
      { label: 'Usage Analytics', ref: 'Q2 2025' },
    ],
    confidence: 78,
    actions: [
      { label: 'View Cost Report', action: 'reports' },
      { label: 'Review Licenses', action: 'licenses' },
    ],
  },
  'maintenance': {
    id: 'resp-maint',
    role: 'assistant',
    content: '5 assets have maintenance scheduled or overdue. The most urgent is the Epson PowerLite Projector (AST-0009) — maintenance is 8 days overdue. The Dell PowerEdge R750 (AST-0005) is currently in corrective maintenance. I also recommend scheduling a firmware upgrade for the Cisco Catalyst 9300 due to a security advisory.',
    timestamp: 'now',
    sources: [
      { label: 'Maintenance Log', ref: '7 records' },
      { label: 'Security Advisories', ref: '2 active' },
    ],
    confidence: 89,
    actions: [
      { label: 'View Maintenance', action: 'maintenance' },
      { label: 'Schedule Service', action: 'schedule' },
    ],
  },
};

export function getAIResponse(query: string): AIChatMessage {
  const lower = query.toLowerCase();
  if (lower.includes('risk') || lower.includes('high')) return aiChatResponses['high risk'];
  if (lower.includes('idle')) return aiChatResponses['idle'];
  if (lower.includes('warranty') || lower.includes('warrant') || lower.includes('quarter')) return aiChatResponses['warranty'];
  if (lower.includes('cost') || lower.includes('save') || lower.includes('license') || lower.includes('software')) return aiChatResponses['cost'];
  if (lower.includes('maintenance') || lower.includes('maintain') || lower.includes('repair')) return aiChatResponses['maintenance'];
  return {
    id: 'resp-default',
    role: 'assistant',
    content: "I can help you analyze your asset portfolio. Try asking about high-risk assets, idle equipment, warranty expirations, cost optimization, or maintenance schedules. You can also ask me to show specific assets or generate reports.",
    timestamp: 'now',
    sources: [{ label: 'RAISE Knowledge Base', ref: 'Asset Management v4.2' }],
    confidence: 99,
    actions: [],
  };
}

export const aiHealthScores: Record<string, { score: number; risk: 'low' | 'medium' | 'high'; findings: string[]; recommendation: string }> = {
  'a1': {
    score: 88,
    risk: 'low',
    findings: [
      'Warranty active until January 2027',
      'Excellent physical condition',
      'Battery cycle count low (22 of 1000)',
      'Assigned to active user in Engineering',
    ],
    recommendation: 'Asset is in optimal condition. No action needed. Next checkup in 6 months.',
  },
  'a5': {
    score: 42,
    risk: 'high',
    findings: [
      'Currently in corrective maintenance',
      'Warranty expires in 90 days',
      'Asset age approaching 3-year replacement cycle',
      'Fair condition with hardware issues reported',
    ],
    recommendation: 'Evaluate replacement vs. repair. Extended warranty recommended if retained.',
  },
  'a9': {
    score: 38,
    risk: 'high',
    findings: [
      'Warranty expired 12 months ago',
      'Lamp hours at 70% of rated life (4,200/6,000)',
      'Fair condition with visible wear',
      'Maintenance overdue by 8 days',
    ],
    recommendation: 'Schedule lamp replacement and preventive maintenance. Consider replacement planning.',
  },
  'a13': {
    score: 12,
    risk: 'high',
    findings: [
      'Retired for 12 months',
      'Current value: $0',
      'Fan failure and motherboard issues',
      'Storage costs accumulating',
    ],
    recommendation: 'Process disposal through approved e-waste vendor immediately.',
  },
  'a15': {
    score: 55,
    risk: 'medium',
    findings: [
      'Currently in maintenance',
      'Battery cycle count high (340)',
      'Fair condition reported',
      'Warranty active until July 2026',
    ],
    recommendation: 'Monitor battery health. Consider battery replacement during current maintenance.',
  },
};

export function getAssetHealth(assetId: string) {
  return aiHealthScores[assetId] ?? {
    score: 75,
    risk: 'low' as const,
    findings: [
      'Warranty active',
      'Good physical condition',
      'Normal utilization patterns',
    ],
    recommendation: 'Asset is in good condition. Continue regular monitoring.',
  };
}

export const aiExecutiveSummary = {
  period: 'Q2 2025',
  summary: 'Asset utilization increased 8% compared to the previous period. Total portfolio value stands at $4.2M with 1,248 active assets across 9 locations.',
  keyFindings: [
    '14 assets idle for more than 90 days — potential reassignment value $28,400',
    '7 assets approaching warranty expiry within 60 days — replacement cost estimate $48,200',
    'IT Operations has the highest asset concentration at 286 units (23% of portfolio)',
    'Software license utilization averages 87% — 3 licenses below 80% threshold',
    'Monthly depreciation accelerated 8.2% due to infrastructure aging',
  ],
  trends: [
    { metric: 'Asset Utilization', value: '+8%', direction: 'up' as const },
    { metric: 'Maintenance Cost', value: '-3.2%', direction: 'down' as const },
    { metric: 'License Waste', value: '-1.4%', direction: 'down' as const },
    { metric: 'Depreciation Rate', value: '+8.2%', direction: 'up' as const },
  ],
  recommendations: [
    'Reassign 5 idle laptops to Engineering (3 pending requests)',
    'Renew 2 critical infrastructure warranties before expiry',
    'Consolidate Zoom Phone Pro seats (44 unused)',
    'Schedule firmware upgrade for Cisco Catalyst 9300 (security advisory)',
  ],
};

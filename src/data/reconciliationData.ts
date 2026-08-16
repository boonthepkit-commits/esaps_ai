export type DiscrepancyType = 
  | 'MATCHED'
  | 'PHYSICAL_ONLY' // Ghost asset (in floor, missing in Oracle FA)
  | 'ORACLE_ONLY'   // Paper asset (in Oracle FA, missing on floor)
  | 'VALUE_MISMATCH'// Cost / Net Book Value differs
  | 'LOCATION_MISMATCH'; // Cost Center / Department / Custodian differs

export interface OracleFARecord {
  faAssetNumber: string;
  tagNumber: string;
  assetDescription: string;
  category: string;
  costCenter: string;
  department: string;
  originalCost: number;
  netBookValue: number;
  accumulatedDepreciation: number;
  datePlacedInService: string;
  serialNumber: string;
  poNumber: string;
  oracleStatus: 'CAPITALIZED' | 'FULLY_DEPRECIATED' | 'RETIRED' | 'CIP';
}

export interface PhysicalAssetRecord {
  assetCode: string;
  tagNumber: string;
  assetName: string;
  category: string;
  department: string;
  location: string;
  custodian: string;
  recordedCost: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Missing';
  lastPhysicalAuditDate: string;
  auditMethod: 'RFID' | 'BARCODE_SCAN' | 'MANUAL_COUNT' | 'UNVERIFIED';
  serialNumber: string;
}

export interface ReconciliationItem {
  id: string;
  discrepancyType: DiscrepancyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  oracleRecord?: OracleFARecord;
  physicalRecord?: PhysicalAssetRecord;
  varianceAmount: number;
  varianceReason: string;
  aiSuggestedAction: string;
  aiRootCause: string;
  aiConfidence: number;
  status: 'PENDING_REVIEW' | 'ACTION_REQUIRED' | 'RESOLVED' | 'AUTO_ADJUSTED';
  assignedAuditor: string;
  resolutionNotes?: string;
  auditTrail: {
    timestamp: string;
    action: string;
    user: string;
  }[];
}

export const sampleReconciliationItems: ReconciliationItem[] = [
  {
    id: 'REC-001',
    discrepancyType: 'PHYSICAL_ONLY',
    severity: 'high',
    physicalRecord: {
      assetCode: 'AST-0089',
      tagNumber: 'TAG-89211',
      assetName: 'Apple Studio Display 27" 5K Nano-Texture',
      category: 'IT Equipment',
      department: 'Product Design',
      location: 'Design Studio Lab 3',
      custodian: 'Ploy Supaporn',
      recordedCost: 1899,
      condition: 'Excellent',
      lastPhysicalAuditDate: '2026-02-14',
      auditMethod: 'RFID',
      serialNumber: 'AP-DISP-9921-X'
    },
    varianceAmount: 1899,
    varianceReason: 'Physical asset scanned via RFID in Design Studio, but no matching Asset Number in Oracle FA Book "CORP_FA_BOOK".',
    aiRootCause: 'Asset was expedited through department petty cash or direct departmental credit card expense instead of centralized PO capitalization workflow in FY2025-Q4.',
    aiSuggestedAction: 'Create Retroactive Oracle FA Capitalization Entry under Major Category "IT-DISPLAY-2026", link to PO #PO-908221, and generate standard barcode asset plate.',
    aiConfidence: 96,
    status: 'ACTION_REQUIRED',
    assignedAuditor: 'Somchai Prasert',
    auditTrail: [
      { timestamp: '2026-02-14 09:30', action: 'RFID Auto-Scan logged in Room 302', user: 'RFID Portal #3' },
      { timestamp: '2026-02-15 11:00', action: 'Oracle FA Reconciliation Job flagged Ghost Asset', user: 'RAISE Engine' }
    ]
  },
  {
    id: 'REC-002',
    discrepancyType: 'ORACLE_ONLY',
    severity: 'critical',
    oracleRecord: {
      faAssetNumber: 'FA-104928',
      tagNumber: 'TAG-44102',
      assetDescription: 'Lenovo ThinkPad P1 Gen 5 Workstation',
      category: 'IT Equipment',
      costCenter: 'CC-302-ENG',
      department: 'Engineering',
      originalCost: 3200,
      netBookValue: 1680,
      accumulatedDepreciation: 1520,
      datePlacedInService: '2024-03-15',
      serialNumber: 'PF-39821-LNV',
      poNumber: 'PO-77491',
      oracleStatus: 'CAPITALIZED'
    },
    varianceAmount: 1680,
    varianceReason: 'Asset is actively depreciating on Oracle FA General Ledger, but not detected in 2 consecutive physical barcode/RFID audit rounds.',
    aiRootCause: 'Employee offboarded in Nov 2025 without completing IT asset handover check-out, or asset was misplaced during recent floor renovation.',
    aiSuggestedAction: 'Issue Urgent Audit Work Order #WO-8812 to Engineering Team Lead. If untraceable after 14 days, initiate Oracle FA Loss Write-off Entry #GL-WO-2026.',
    aiConfidence: 93,
    status: 'PENDING_REVIEW',
    assignedAuditor: 'Nipon Kiatkun',
    auditTrail: [
      { timestamp: '2026-01-20 14:00', action: 'Physical count missing in Floor 4 IDF', user: 'Mobile Barcode Scanner' },
      { timestamp: '2026-02-10 16:30', action: 'Second verification scan failed', user: 'Audit Team A' }
    ]
  },
  {
    id: 'REC-003',
    discrepancyType: 'LOCATION_MISMATCH',
    severity: 'medium',
    oracleRecord: {
      faAssetNumber: 'FA-102844',
      tagNumber: 'AST-0003',
      assetDescription: 'Dell UltraSharp 32" 4K USB-C Monitor (U3223QE)',
      category: 'IT Equipment',
      costCenter: 'CC-101-MKT',
      department: 'Marketing',
      originalCost: 920,
      netBookValue: 640,
      accumulatedDepreciation: 280,
      datePlacedInService: '2024-08-10',
      serialNumber: 'CN-0K791X-74261',
      poNumber: 'PO-65120',
      oracleStatus: 'CAPITALIZED'
    },
    physicalRecord: {
      assetCode: 'AST-0003',
      tagNumber: 'AST-0003',
      assetName: 'Dell UltraSharp 32" 4K Monitor',
      category: 'IT Equipment',
      department: 'Product Design',
      location: 'Design Floor 2, Desk 14',
      custodian: 'David Kim',
      recordedCost: 920,
      condition: 'Excellent',
      lastPhysicalAuditDate: '2026-02-12',
      auditMethod: 'BARCODE_SCAN',
      serialNumber: 'CN-0K791X-74261'
    },
    varianceAmount: 0,
    varianceReason: 'Serial & tag match 100%, but Oracle Cost Center is CC-101 (Marketing) whereas asset is deployed in Product Design (CC-401).',
    aiRootCause: 'Inter-departmental transfer occurred when David Kim transitioned teams in Q3 2025 without triggering Oracle FA Transfer Workflow.',
    aiSuggestedAction: 'Auto-generate Oracle FA Transfer Batch Transaction: Transfer from Cost Center CC-101-MKT to CC-401-DES with zero depreciation impact.',
    aiConfidence: 98,
    status: 'ACTION_REQUIRED',
    assignedAuditor: 'Alex Morgan',
    auditTrail: [
      { timestamp: '2026-02-12 10:15', action: 'Scanned at Desk 14 Product Design', user: 'Mobile Barcode App' }
    ]
  },
  {
    id: 'REC-004',
    discrepancyType: 'VALUE_MISMATCH',
    severity: 'medium',
    oracleRecord: {
      faAssetNumber: 'FA-100512',
      tagNumber: 'AST-0005',
      assetDescription: 'Dell PowerEdge R750 Rack Server',
      category: 'IT Equipment',
      costCenter: 'CC-201-IT',
      department: 'IT Operations',
      originalCost: 14200,
      netBookValue: 4800,
      accumulatedDepreciation: 9400,
      datePlacedInService: '2022-01-10',
      serialNumber: 'DELL-PE-750-SRV01',
      poNumber: 'PO-43990',
      oracleStatus: 'CAPITALIZED'
    },
    physicalRecord: {
      assetCode: 'AST-0005',
      tagNumber: 'AST-0005',
      assetName: 'Dell PowerEdge R750 Server',
      category: 'IT Equipment',
      department: 'IT Operations',
      location: 'Server Room B, Rack 2',
      custodian: 'Alex Morgan',
      recordedCost: 12500,
      condition: 'Fair',
      lastPhysicalAuditDate: '2026-02-10',
      auditMethod: 'RFID',
      serialNumber: 'DELL-PE-750-SRV01'
    },
    varianceAmount: 1700,
    varianceReason: 'Oracle FA Historical Cost ($14,200) differs from Physical Register Cost ($12,500) by $1,700.',
    aiRootCause: 'Oracle FA cost capitalized invoice shipping & hardware upgrade installation fees ($1,700) which were recorded in general expenses on the physical subledger.',
    aiSuggestedAction: 'Harmonize Physical Subledger baseline value to $14,200 to mirror Oracle FA GAAP capitalization basis.',
    aiConfidence: 95,
    status: 'ACTION_REQUIRED',
    assignedAuditor: 'Somchai Prasert',
    auditTrail: [
      { timestamp: '2026-02-10 13:20', action: 'Cost variance detected during Ledger comparison', user: 'RAISE Engine' }
    ]
  },
  {
    id: 'REC-005',
    discrepancyType: 'MATCHED',
    severity: 'low',
    oracleRecord: {
      faAssetNumber: 'FA-100101',
      tagNumber: 'AST-0001',
      assetDescription: 'MacBook Pro 16" M3 Max (36GB/1TB)',
      category: 'IT Equipment',
      costCenter: 'CC-302-ENG',
      department: 'Engineering',
      originalCost: 3499,
      netBookValue: 2850,
      accumulatedDepreciation: 649,
      datePlacedInService: '2024-01-15',
      serialNumber: 'C02G1234MD6R',
      poNumber: 'PO-88190',
      oracleStatus: 'CAPITALIZED'
    },
    physicalRecord: {
      assetCode: 'AST-0001',
      tagNumber: 'AST-0001',
      assetName: 'MacBook Pro 16" M3 Max',
      category: 'IT Equipment',
      department: 'Engineering',
      location: 'HQ - Floor 3',
      custodian: 'Sarah Chen',
      recordedCost: 3499,
      condition: 'Excellent',
      lastPhysicalAuditDate: '2026-02-11',
      auditMethod: 'BARCODE_SCAN',
      serialNumber: 'C02G1234MD6R'
    },
    varianceAmount: 0,
    varianceReason: 'Full match across Tag, Serial, Cost, Net Book Value, and Cost Center.',
    aiRootCause: 'Clean reconciliation status.',
    aiSuggestedAction: 'No action required. Tag verified and certified for FY2026 Q1.',
    aiConfidence: 99,
    status: 'RESOLVED',
    assignedAuditor: 'Alex Morgan',
    auditTrail: [
      { timestamp: '2026-02-11 15:40', action: 'Verified & Reconciled with Oracle FA', user: 'Alex Morgan' }
    ]
  },
  {
    id: 'REC-006',
    discrepancyType: 'MATCHED',
    severity: 'low',
    oracleRecord: {
      faAssetNumber: 'FA-100204',
      tagNumber: 'AST-0002',
      assetDescription: 'Dell XPS 15 9530 (i9/32GB/1TB)',
      category: 'IT Equipment',
      costCenter: 'CC-401-DES',
      department: 'Product Design',
      originalCost: 2399,
      netBookValue: 1890,
      accumulatedDepreciation: 509,
      datePlacedInService: '2024-03-20',
      serialNumber: 'DL-XPS-99281-K',
      poNumber: 'PO-89012',
      oracleStatus: 'CAPITALIZED'
    },
    physicalRecord: {
      assetCode: 'AST-0002',
      tagNumber: 'AST-0002',
      assetName: 'Dell XPS 15 9530',
      category: 'IT Equipment',
      department: 'Product Design',
      location: 'HQ - Floor 2',
      custodian: 'Marcus Vance',
      recordedCost: 2399,
      condition: 'Good',
      lastPhysicalAuditDate: '2026-02-09',
      auditMethod: 'BARCODE_SCAN',
      serialNumber: 'DL-XPS-99281-K'
    },
    varianceAmount: 0,
    varianceReason: 'Full match across Tag, Serial, Cost, and Department.',
    aiRootCause: 'Clean reconciliation status.',
    aiSuggestedAction: 'Certified for FY2026 Q1.',
    aiConfidence: 99,
    status: 'RESOLVED',
    assignedAuditor: 'Alex Morgan',
    auditTrail: [
      { timestamp: '2026-02-09 11:20', action: 'Verified & Reconciled with Oracle FA', user: 'Alex Morgan' }
    ]
  }
];

export const reconciliationSummaryStats = {
  totalPhysicalAssets: 1248,
  totalPhysicalCost: 4210000,
  totalOracleAssets: 1215,
  totalOracleBookCost: 4358500,
  matchedCount: 1152,
  matchRatePercent: 94.8,
  ghostAssetsCount: 28, // Physical only
  paperAssetsCount: 19, // Oracle only
  discrepanciesCount: 49, // Value or Location
  totalVarianceValue: 148500,
  lastSyncTimestamp: '2026-02-15 08:30:00 (Oracle ERP Integration Pipeline)',
  oracleInstance: 'Oracle Fusion Cloud Applications (FA_PROD_TH)'
};

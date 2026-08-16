import { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Upload,
  Download,
  Filter,
  Search,
  Sparkles,
  ShieldCheck,
  Building2,
  Layers,
  ArrowRightLeft,
  DollarSign,
  Clock,
  ChevronRight,
  Check,
  X,
  FileText,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, Button, Badge, Input, Select, useToast } from '@/components/ui';
import { DonutChart, ProgressBarChart } from '@/components/Charts';
import {
  sampleReconciliationItems,
  reconciliationSummaryStats,
  type ReconciliationItem,
  type DiscrepancyType
} from '@/data/reconciliationData';
import { cn } from '@/lib/cn';

interface ReconciliationProps {
  onNavigate: (id: string, aid?: string) => void;
}

export function Reconciliation({ onNavigate }: ReconciliationProps) {
  const { addToast } = useToast();
  const [items, setItems] = useState<ReconciliationItem[]>(sampleReconciliationItems);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<ReconciliationItem | null>(sampleReconciliationItems[0]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isMatching, setIsMatching] = useState<boolean>(false);

  // Filter items
  const filteredItems = items.filter((item) => {
    if (filterType !== 'ALL' && item.discrepancyType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const code = item.physicalRecord?.assetCode?.toLowerCase() || '';
      const name = item.physicalRecord?.assetName?.toLowerCase() || '';
      const faNo = item.oracleRecord?.faAssetNumber?.toLowerCase() || '';
      const faDesc = item.oracleRecord?.assetDescription?.toLowerCase() || '';
      return code.includes(q) || name.includes(q) || faNo.includes(q) || faDesc.includes(q);
    }
    return true;
  });

  const stats = {
    all: items.length,
    matched: items.filter((i) => i.discrepancyType === 'MATCHED').length,
    ghost: items.filter((i) => i.discrepancyType === 'PHYSICAL_ONLY').length,
    paper: items.filter((i) => i.discrepancyType === 'ORACLE_ONLY').length,
    discrepancy: items.filter((i) => i.discrepancyType === 'VALUE_MISMATCH' || i.discrepancyType === 'LOCATION_MISMATCH').length,
  };

  // Run AI analysis on single discrepancy
  const handleDeepAIAnalysis = async (item: ReconciliationItem) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/reconcile-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discrepancyItem: item })
      });
      const data = await res.json();
      
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                aiRootCause: data.rootCause || i.aiRootCause,
                aiSuggestedAction: data.suggestedAction || i.aiSuggestedAction,
                aiConfidence: data.confidence || i.aiConfidence,
              }
            : i
        )
      );

      if (selectedItem?.id === item.id) {
        setSelectedItem((prev) =>
          prev
            ? {
                ...prev,
                aiRootCause: data.rootCause || prev.aiRootCause,
                aiSuggestedAction: data.suggestedAction || prev.aiSuggestedAction,
                aiConfidence: data.confidence || prev.aiConfidence,
              }
            : null
        );
      }
      addToast('Gemini AI Reconciliation Analysis completed', 'success');
    } catch (err) {
      addToast('Reconciliation analysis refreshed', 'info');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run Auto-Match Job
  const handleRunAutoMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      addToast('Oracle FA Auto-Matching Job finished: 1,152 matched (94.8% compliance rate)', 'success');
    }, 1200);
  };

  // Resolve item action
  const handleResolveAction = (item: ReconciliationItem, actionName: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              status: 'RESOLVED',
              auditTrail: [
                ...i.auditTrail,
                { timestamp: 'Just now', action: actionName, user: 'Alex Morgan (Auditor)' }
              ]
            }
          : i
      )
    );
    if (selectedItem?.id === item.id) {
      setSelectedItem((prev) =>
        prev
          ? {
              ...prev,
              status: 'RESOLVED',
              auditTrail: [
                ...prev.auditTrail,
                { timestamp: 'Just now', action: actionName, user: 'Alex Morgan (Auditor)' }
              ]
            }
          : null
      );
    }
    addToast(`Action executed: ${actionName}`, 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-surface-900 via-brand-950 to-surface-900 text-white rounded-xl p-6 shadow-md border border-surface-700/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-caption font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Oracle Financials Cloud Connected
              </span>
              <span className="text-caption text-surface-400">FA Book: <strong className="text-white">CORP_FA_BOOK_TH</strong></span>
            </div>
            <h1 className="text-display font-bold tracking-tight text-white">Oracle FA & Asset Reconciliation</h1>
            <p className="text-body text-surface-300 max-w-2xl mt-1">
              Automated reconciliation between Physical Barcode/RFID asset subledgers and Oracle Fixed Assets (FA) General Ledger registers.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="md"
              leftIcon={<RefreshCw className={cn('h-4 w-4 text-brand-300', isMatching && 'animate-spin')} />}
              onClick={handleRunAutoMatch}
              loading={isMatching}
              className="border-surface-600 bg-white/10 hover:bg-white/20 text-white"
            >
              Run Auto-Match Job
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => addToast('Exporting Official Reconciliation Audit Statement (Excel)...', 'success')}
            >
              Export Audit Pack
            </Button>
          </div>
        </div>

        {/* Sync Info Footer */}
        <div className="flex items-center justify-between text-caption text-surface-400 mt-5 pt-3 border-t border-surface-800 flex-wrap gap-2">
          <span>Last automated sync: <strong className="text-surface-200">{reconciliationSummaryStats.lastSyncTimestamp}</strong></span>
          <span>Instance: <strong className="text-surface-200">{reconciliationSummaryStats.oracleInstance}</strong></span>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Match Rate */}
        <Card
          onClick={() => setFilterType('MATCHED')}
          className={cn(
            'p-5 border-l-4 border-l-emerald-500 cursor-pointer transition-all hover:shadow-md',
            filterType === 'MATCHED' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
          )}
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-caption font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              {reconciliationSummaryStats.matchRatePercent}% Match Rate
            </span>
          </div>
          <p className="text-display font-bold text-surface-900 mt-4">{reconciliationSummaryStats.matchedCount}</p>
          <p className="text-body font-medium text-surface-700 mt-0.5">Matched & Verified Assets</p>
          <p className="text-caption text-surface-500 mt-1">Both in Physical & Oracle FA</p>
        </Card>

        {/* Ghost Assets (Physical Only) */}
        <Card
          onClick={() => setFilterType('PHYSICAL_ONLY')}
          className={cn(
            'p-5 border-l-4 border-l-amber-500 cursor-pointer transition-all hover:shadow-md',
            filterType === 'PHYSICAL_ONLY' ? 'ring-2 ring-amber-500 bg-amber-50/20' : ''
          )}
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Building2 className="h-5 w-5" />
            </div>
            <Badge variant="warning">Ghost Assets</Badge>
          </div>
          <p className="text-display font-bold text-surface-900 mt-4">{reconciliationSummaryStats.ghostAssetsCount}</p>
          <p className="text-body font-medium text-surface-700 mt-0.5">Physical Only (Unrecorded in FA)</p>
          <p className="text-caption text-surface-500 mt-1">Found on site without Oracle tag</p>
        </Card>

        {/* Paper Assets (Oracle Only) */}
        <Card
          onClick={() => setFilterType('ORACLE_ONLY')}
          className={cn(
            'p-5 border-l-4 border-l-error-500 cursor-pointer transition-all hover:shadow-md',
            filterType === 'ORACLE_ONLY' ? 'ring-2 ring-error-500 bg-error-50/20' : ''
          )}
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-lg bg-error-50 flex items-center justify-center text-error-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <Badge variant="error">Paper Assets</Badge>
          </div>
          <p className="text-display font-bold text-surface-900 mt-4">{reconciliationSummaryStats.paperAssetsCount}</p>
          <p className="text-body font-medium text-surface-700 mt-0.5">Oracle Only (Missing Physical)</p>
          <p className="text-caption text-surface-500 mt-1">In ledger but unverified in scan</p>
        </Card>

        {/* Value / Location Variances */}
        <Card
          onClick={() => setFilterType('VALUE_MISMATCH')}
          className={cn(
            'p-5 border-l-4 border-l-brand-500 cursor-pointer transition-all hover:shadow-md',
            filterType === 'VALUE_MISMATCH' ? 'ring-2 ring-brand-500 bg-brand-50/20' : ''
          )}
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <span className="text-caption font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded">
              ${(reconciliationSummaryStats.totalVarianceValue / 1000).toFixed(1)}k Variance
            </span>
          </div>
          <p className="text-display font-bold text-surface-900 mt-4">{reconciliationSummaryStats.discrepanciesCount}</p>
          <p className="text-body font-medium text-surface-700 mt-0.5">Value & Location Discrepancies</p>
          <p className="text-caption text-surface-500 mt-1">Cost center or depreciation timing</p>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Discrepancy Filter & List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'ALL', label: 'All Items' },
                  { id: 'PHYSICAL_ONLY', label: 'Physical Only' },
                  { id: 'ORACLE_ONLY', label: 'Oracle Only' },
                  { id: 'LOCATION_MISMATCH', label: 'Location Mismatch' },
                  { id: 'VALUE_MISMATCH', label: 'Value Mismatch' },
                  { id: 'MATCHED', label: 'Matched' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-caption font-medium transition-colors whitespace-nowrap',
                      filterType === tab.id
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search code, name, FA #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-surface-200 rounded-lg">
              <table className="w-full text-body text-left">
                <thead className="bg-surface-50 border-b border-surface-200 text-caption font-bold text-surface-600 uppercase">
                  <tr>
                    <th className="px-3.5 py-3">Discrepancy Type</th>
                    <th className="px-3.5 py-3">Physical Asset Record</th>
                    <th className="px-3.5 py-3">Oracle FA Book Record</th>
                    <th className="px-3.5 py-3">Variance</th>
                    <th className="px-3.5 py-3">Status</th>
                    <th className="px-3.5 py-3 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-surface-400">
                        No reconciliation items matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      const typeConfig = {
                        MATCHED: { label: 'Matched', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                        PHYSICAL_ONLY: { label: 'Physical Only (Ghost)', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
                        ORACLE_ONLY: { label: 'Oracle Only (Paper)', bg: 'bg-error-50 text-error-700 border-error-200' },
                        VALUE_MISMATCH: { label: 'Value Mismatch', bg: 'bg-brand-50 text-brand-700 border-brand-200' },
                        LOCATION_MISMATCH: { label: 'Location Mismatch', bg: 'bg-accent-50 text-accent-700 border-accent-200' },
                      }[item.discrepancyType];

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={cn(
                            'cursor-pointer transition-colors',
                            isSelected ? 'bg-brand-50/70 font-medium' : 'hover:bg-surface-50'
                          )}
                        >
                          <td className="px-3.5 py-3.5">
                            <span className={cn('text-caption font-bold px-2 py-0.5 rounded-full border', typeConfig.bg)}>
                              {typeConfig.label}
                            </span>
                            <div className="text-[11px] text-surface-400 mt-1 font-mono">{item.id}</div>
                          </td>

                          <td className="px-3.5 py-3.5">
                            {item.physicalRecord ? (
                              <div>
                                <div className="font-semibold text-surface-900 truncate max-w-[180px]">
                                  {item.physicalRecord.assetName}
                                </div>
                                <div className="text-caption text-surface-500 font-mono">
                                  {item.physicalRecord.assetCode} · {item.physicalRecord.department}
                                </div>
                              </div>
                            ) : (
                              <span className="text-caption text-error-500 italic">Not detected on floor</span>
                            )}
                          </td>

                          <td className="px-3.5 py-3.5">
                            {item.oracleRecord ? (
                              <div>
                                <div className="font-semibold text-surface-900 truncate max-w-[180px]">
                                  {item.oracleRecord.assetDescription}
                                </div>
                                <div className="text-caption text-surface-500 font-mono">
                                  {item.oracleRecord.faAssetNumber} · {item.oracleRecord.costCenter}
                                </div>
                              </div>
                            ) : (
                              <span className="text-caption text-amber-600 italic">Unrecorded in Oracle FA</span>
                            )}
                          </td>

                          <td className="px-3.5 py-3.5">
                            {item.varianceAmount > 0 ? (
                              <span className="font-bold text-surface-900">${item.varianceAmount.toLocaleString()}</span>
                            ) : (
                              <span className="text-surface-400 font-normal">$0</span>
                            )}
                          </td>

                          <td className="px-3.5 py-3.5">
                            <span className={cn(
                              'text-[11px] font-bold px-2 py-0.5 rounded uppercase',
                              item.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                              item.status === 'ACTION_REQUIRED' ? 'bg-error-100 text-error-800' : 'bg-amber-100 text-amber-800'
                            )}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="px-3.5 py-3.5 text-right">
                            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Deep Discrepancy Auditor & AI Action Resolver */}
        <div className="flex flex-col gap-4">
          {selectedItem ? (
            <Card className="p-5 border-2 border-brand-500/30 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-surface-200">
                <div>
                  <span className="text-caption font-bold text-surface-500 font-mono">{selectedItem.id}</span>
                  <h3 className="text-title font-bold text-surface-900 mt-0.5">Discrepancy Deep Audit</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Sparkles className="h-3.5 w-3.5 text-brand-600" />}
                  onClick={() => handleDeepAIAnalysis(selectedItem)}
                  loading={isAnalyzing}
                >
                  AI Re-Audit
                </Button>
              </div>

              {/* Side-by-Side Detail Grid */}
              <div className="grid grid-cols-2 gap-3 my-4">
                {/* Physical Panel */}
                <div className="p-3 bg-surface-50 rounded-lg border border-surface-200">
                  <div className="flex items-center gap-1.5 text-caption font-bold text-surface-600 mb-2 uppercase">
                    <Building2 className="h-3.5 w-3.5 text-brand-600" />
                    Physical Audit
                  </div>
                  {selectedItem.physicalRecord ? (
                    <div className="space-y-1.5 text-caption">
                      <p><strong className="text-surface-900">{selectedItem.physicalRecord.assetName}</strong></p>
                      <p className="text-surface-600">Tag: <span className="font-mono text-surface-900">{selectedItem.physicalRecord.tagNumber}</span></p>
                      <p className="text-surface-600">Dept: <span className="text-surface-900">{selectedItem.physicalRecord.department}</span></p>
                      <p className="text-surface-600">Cost: <strong className="text-surface-900">${selectedItem.physicalRecord.recordedCost.toLocaleString()}</strong></p>
                      <p className="text-surface-600">Audit: <span className="text-surface-900">{selectedItem.physicalRecord.auditMethod} ({selectedItem.physicalRecord.lastPhysicalAuditDate})</span></p>
                    </div>
                  ) : (
                    <p className="text-caption text-error-600 italic">Not found during physical scan</p>
                  )}
                </div>

                {/* Oracle FA Panel */}
                <div className="p-3 bg-brand-50/50 rounded-lg border border-brand-100">
                  <div className="flex items-center gap-1.5 text-caption font-bold text-brand-700 mb-2 uppercase">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-brand-600" />
                    Oracle FA Ledger
                  </div>
                  {selectedItem.oracleRecord ? (
                    <div className="space-y-1.5 text-caption">
                      <p><strong className="text-surface-900">{selectedItem.oracleRecord.assetDescription}</strong></p>
                      <p className="text-surface-600">FA #: <span className="font-mono text-surface-900">{selectedItem.oracleRecord.faAssetNumber}</span></p>
                      <p className="text-surface-600">Cost Center: <span className="text-surface-900">{selectedItem.oracleRecord.costCenter}</span></p>
                      <p className="text-surface-600">Net Book Value: <strong className="text-surface-900">${selectedItem.oracleRecord.netBookValue.toLocaleString()}</strong></p>
                      <p className="text-surface-600">Status: <span className="text-surface-900">{selectedItem.oracleRecord.oracleStatus}</span></p>
                    </div>
                  ) : (
                    <p className="text-caption text-amber-600 italic">Unrecorded in Oracle FA Ledger</p>
                  )}
                </div>
              </div>

              {/* AI Discrepancy Root Cause */}
              <div className="space-y-3">
                <div className="p-3.5 bg-surface-50 rounded-xl border border-surface-200">
                  <div className="flex items-center gap-1.5 text-caption font-bold text-brand-700 mb-1">
                    <Sparkles className="h-4 w-4 text-brand-600" />
                    AI Root Cause Analysis ({selectedItem.aiConfidence}% confidence)
                  </div>
                  <p className="text-caption text-surface-800 leading-relaxed">
                    {selectedItem.aiRootCause}
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <div className="text-caption font-bold text-emerald-800 mb-1">
                    Recommended Corrective & Accounting Action:
                  </div>
                  <p className="text-caption text-emerald-900 leading-relaxed">
                    {selectedItem.aiSuggestedAction}
                  </p>
                </div>

                {/* Audit Trail */}
                <div className="pt-2">
                  <p className="text-caption font-semibold text-surface-500 uppercase mb-1.5">Audit History</p>
                  <div className="space-y-1 text-caption text-surface-600">
                    {selectedItem.auditTrail.map((at, idx) => (
                      <div key={idx} className="flex justify-between py-0.5 border-b border-surface-100 last:border-0">
                        <span>{at.action}</span>
                        <span className="text-surface-400">{at.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Resolver Workflow */}
              <div className="mt-5 pt-4 border-t border-surface-200 space-y-2">
                <p className="text-caption font-bold text-surface-700 uppercase">One-Click Resolution Workflows</p>
                
                {selectedItem.discrepancyType === 'PHYSICAL_ONLY' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => handleResolveAction(selectedItem, 'Post Oracle FA Retroactive Capitalization Entry #CAP-2026-08')}
                  >
                    Post Oracle FA Capitalization Entry
                  </Button>
                )}

                {selectedItem.discrepancyType === 'ORACLE_ONLY' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center bg-error-600 hover:bg-error-700 text-white"
                    onClick={() => handleResolveAction(selectedItem, 'Issue Priority Search Work Order #WO-9912 & Loss Reserve')}
                  >
                    Issue Physical Search Work Order
                  </Button>
                )}

                {selectedItem.discrepancyType === 'LOCATION_MISMATCH' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => handleResolveAction(selectedItem, 'Auto-Post Oracle Cost Center Transfer GL Journal')}
                  >
                    Auto-Post Cost Center Transfer GL Journal
                  </Button>
                )}

                {selectedItem.discrepancyType === 'VALUE_MISMATCH' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => handleResolveAction(selectedItem, 'Harmonize Subledger Valuation with Oracle GAAP Basis')}
                  >
                    Harmonize Subledger Value Basis
                  </Button>
                )}

                {selectedItem.discrepancyType === 'MATCHED' && (
                  <div className="text-center py-2 text-caption text-emerald-700 bg-emerald-50 rounded-lg font-medium">
                    ✓ Asset is certified and fully reconciled.
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-surface-400">
              <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Select any reconciliation item to view detailed audit telemetry and resolution actions.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

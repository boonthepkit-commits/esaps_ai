import { useState } from 'react';
import {
  ArrowLeft,
  QrCode,
  UserPlus,
  ArrowRightLeft,
  Wrench,
  Trash2,
  Printer,
  FileText,
  KeyRound,
  MessageSquare,
  History,
  ClipboardList,
  Settings,
  DollarSign,
  Shield,
  Calendar,
  Building2,
  User,
  Package,
  Download,
  Paperclip,
  Cpu,
  Sparkles,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, Button, Badge, StatusBadge, Avatar, Tabs, EmptyState, Progress, useToast, SectionCard } from '@/components/ui';
import { assets, employees, maintenanceRecords, softwareLicenses } from '@/data/mockData';
import { getAssetHealth } from '@/data/aiData';
import { cn } from '@/lib/cn';

interface AssetDetailProps {
  assetId: string;
  onNavigate: (id: string) => void;
}

export function AssetDetail({ assetId, onNavigate }: AssetDetailProps) {
  const { push } = useToast();
  const [tab, setTab] = useState('overview');
  const asset = assets.find((a) => a.id === assetId) ?? assets[0];
  const Icon = asset.icon;
  const assetMaintenance = maintenanceRecords.filter((m) => m.assetCode === asset.code);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Settings className="h-4 w-4" /> },
    { id: 'history', label: 'History', icon: <History className="h-4 w-4" />, count: 5 },
    { id: 'files', label: 'Files', icon: <FileText className="h-4 w-4" />, count: 3 },
    { id: 'license', label: 'License', icon: <KeyRound className="h-4 w-4" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="h-4 w-4" />, count: assetMaintenance.length },
    { id: 'audit', label: 'Audit', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'comments', label: 'Comments', icon: <MessageSquare className="h-4 w-4" />, count: 2 },
  ];

  const quickActions = [
    { label: 'Assign', icon: UserPlus, onClick: () => push({ variant: 'info', title: 'Assign asset', message: asset.name }) },
    { label: 'Transfer', icon: ArrowRightLeft, onClick: () => push({ variant: 'info', title: 'Transfer asset', message: asset.name }) },
    { label: 'Maintenance', icon: Wrench, onClick: () => push({ variant: 'info', title: 'Maintenance scheduled', message: asset.name }) },
    { label: 'Dispose', icon: Trash2, onClick: () => push({ variant: 'warning', title: 'Disposal requested', message: asset.name }), danger: true },
    { label: 'Print QR', icon: QrCode, onClick: () => push({ variant: 'info', title: 'QR code ready', message: asset.code }) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => onNavigate('assets')} className="inline-flex items-center gap-1.5 text-body text-surface-500 hover:text-surface-800 transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Assets
      </button>

      {/* Header card */}
      <Card className="overflow-hidden">
        <div className="p-5 flex flex-col lg:flex-row gap-5">
          <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 flex items-center justify-center shrink-0 border border-surface-200">
            <Icon className="h-10 w-10 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-heading font-bold text-surface-900">{asset.name}</h1>
              <StatusBadge status={asset.status} />
              <Badge variant="neutral">{asset.condition}</Badge>
            </div>
            <p className="text-body text-surface-500 mt-1">{asset.code} · {asset.serialNumber}</p>
            <div className="flex items-center gap-4 mt-3 flex-wrap text-caption text-surface-500">
              <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{asset.department}</span>
              <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" />{asset.location}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Purchased {asset.purchaseDate}</span>
              <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{asset.assignedTo ?? 'Unassigned'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {quickActions.map((a) => (
              <Button
                key={a.label}
                variant={a.danger ? 'outline' : 'outline'}
                size="sm"
                leftIcon={<a.icon className="h-4 w-4" />}
                onClick={a.onClick}
                className={a.danger ? 'text-error-600 hover:bg-error-50 border-error-200' : ''}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>
        <Tabs items={tabs} active={tab} onChange={setTab} className="px-5" />
      </Card>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <SectionCard title="General Information" description="Core asset details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <InfoRow label="Asset Code" value={asset.code} />
                <InfoRow label="Serial Number" value={asset.serialNumber} />
                <InfoRow label="Category" value={asset.category} />
                <InfoRow label="Type" value={asset.type} />
                <InfoRow label="Vendor" value={asset.vendor} />
                <InfoRow label="Condition" value={asset.condition} />
                <InfoRow label="Department" value={asset.department} />
                <InfoRow label="Location" value={asset.location} />
              </div>
            </SectionCard>

            {asset.specs && asset.specs.length > 0 && (
              <SectionCard title="Technical Specifications" description="Hardware and system configuration">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {asset.specs.map((spec) => (
                    <InfoRow key={spec.label} label={spec.label} value={spec.value} />
                  ))}
                </div>
              </SectionCard>
            )}

            {/* AI Asset Analysis */}
            {(() => {
              const health = getAssetHealth(asset.id);
              const riskConfig = {
                low: { bg: 'bg-success-50', text: 'text-success-600', border: 'border-success-200', label: 'Low Risk', icon: CheckCircle2 },
                medium: { bg: 'bg-warning-50', text: 'text-warning-600', border: 'border-warning-200', label: 'Medium Risk', icon: AlertTriangle },
                high: { bg: 'bg-error-50', text: 'text-error-600', border: 'border-error-200', label: 'High Risk', icon: AlertTriangle },
              }[health.risk];
              const RiskIcon = riskConfig.icon;
              const scoreColor = health.score >= 70 ? 'bg-success-500' : health.score >= 40 ? 'bg-warning-500' : 'bg-error-500';
              return (
                <SectionCard title="AI Asset Analysis" description="AI-powered health assessment and recommendations">
                  <div className="flex flex-col gap-4">
                    {/* Health Score */}
                    <div className={cn('flex items-center gap-4 p-4 rounded-lg border', riskConfig.bg, riskConfig.border)}>
                      <div className="relative h-16 w-16 shrink-0">
                        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-surface-200" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className={riskConfig.text} strokeDasharray={`${(health.score / 100) * 176} 176`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-title font-bold text-surface-900">{health.score}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <RiskIcon className={cn('h-4 w-4', riskConfig.text)} />
                          <span className={cn('text-body font-semibold', riskConfig.text)}>{riskConfig.label}</span>
                        </div>
                        <p className="text-caption text-surface-600 mt-0.5">Health Score: {health.score}/100</p>
                        <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden mt-2 max-w-[200px]">
                          <div className={cn('h-full rounded-full transition-all', scoreColor)} style={{ width: `${health.score}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* AI Findings */}
                    <div>
                      <p className="text-caption font-semibold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                        AI Detected
                      </p>
                      <div className="space-y-2">
                        {health.findings.map((finding, i) => (
                          <div key={i} className="flex items-start gap-2 text-body text-surface-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-surface-300 mt-2 shrink-0" />
                            {finding}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="p-3 rounded-lg bg-brand-50 border border-brand-100">
                      <p className="text-caption font-medium text-brand-600 mb-1 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5" />
                        AI Recommendation
                      </p>
                      <p className="text-body text-surface-800">{health.recommendation}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" leftIcon={<Sparkles className="h-4 w-4 text-brand-600" />}>
                        Explain
                      </Button>
                      <Button variant="outline" size="sm" leftIcon={<FileText className="h-4 w-4" />}>
                        View Evidence
                      </Button>
                    </div>
                  </div>
                </SectionCard>
              );
            })()}
          </div>

          <div className="flex flex-col gap-4">
            <SectionCard title="Financial Information">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-caption text-surface-500">Purchase Cost</p>
                  <p className="text-heading font-bold text-surface-900">${asset.purchaseCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-caption text-surface-500">Current Value</p>
                  <p className="text-heading font-bold text-surface-900">${asset.currentValue.toLocaleString()}</p>
                  <Progress value={asset.currentValue} max={asset.purchaseCost} className="mt-2" barClass="bg-brand-500" />
                  <p className="text-caption text-surface-400 mt-1">{Math.round((asset.currentValue / asset.purchaseCost) * 100)}% of original value</p>
                </div>
                <div>
                  <p className="text-caption text-surface-500">Depreciation</p>
                  <p className="text-body font-semibold text-error-600">-${(asset.purchaseCost - asset.currentValue).toLocaleString()}</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Warranty">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-surface-400" />
                  <span className="text-body text-surface-700">Expires {asset.warrantyExpiry}</span>
                </div>
                <Badge variant={new Date(asset.warrantyExpiry) < new Date() ? 'error' : 'success'} dot>
                  {new Date(asset.warrantyExpiry) < new Date() ? 'Expired' : 'Active'}
                </Badge>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <Card>
          <CardHeader title="Assignment History" description="Timeline of assignments and transfers" />
          <div className="p-5">
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-px bg-surface-200" />
              {[
                { date: '2024-01-15', title: 'Assigned to Sarah Chen', desc: 'Engineering · HQ - Floor 4', user: 'Admin' },
                { date: '2023-12-01', title: 'Transferred from Storage', desc: 'Moved to HQ - Floor 4', user: 'IT Operations' },
                { date: '2023-11-20', title: 'Received from Vendor', desc: 'Purchase order PO-2023-0142', user: 'Procurement' },
                { date: '2023-11-15', title: 'Asset Registered', desc: 'Created in system', user: 'Admin' },
                { date: '2023-11-10', title: 'Purchase Order Created', desc: 'Apple Inc. · $3,299', user: 'James Wilson' },
              ].map((h, i) => (
                <div key={i} className="relative pb-6 last:pb-0">
                  <div className="absolute -left-4 top-1 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-white" />
                  <p className="text-caption text-surface-400">{h.date}</p>
                  <p className="text-body font-medium text-surface-900 mt-0.5">{h.title}</p>
                  <p className="text-caption text-surface-500">{h.desc}</p>
                  <p className="text-caption text-surface-400 mt-0.5">by {h.user}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {tab === 'files' && (
        <Card>
          <CardHeader title="Documents" description="Attached files and documents" action={<Button size="sm" variant="outline" leftIcon={<Paperclip className="h-4 w-4" />}>Attach</Button>} />
          <div className="p-3">
            {[
              { name: 'Purchase_Receipt.pdf', size: '124 KB', date: '2024-01-15' },
              { name: 'Warranty_Certificate.pdf', size: '89 KB', date: '2024-01-15' },
              { name: 'Asset_Photo.jpg', size: '2.4 MB', date: '2024-01-16' },
            ].map((f) => (
              <div key={f.name} className="flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-surface-50 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><FileText className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium text-surface-900 truncate">{f.name}</p>
                  <p className="text-caption text-surface-500">{f.size} · {f.date}</p>
                </div>
                <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'license' && (
        <Card>
          <CardHeader title="Software Licenses" description="Licenses associated with this asset" />
          <div className="p-5">
            {softwareLicenses.slice(0, 2).map((l) => (
              <div key={l.id} className="flex items-center gap-3 py-3 border-b border-surface-100 last:border-0">
                <div className="h-10 w-10 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center"><KeyRound className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-surface-900">{l.product}</p>
                  <p className="text-caption text-surface-500">{l.vendor} · {l.type}</p>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'maintenance' && (
        <Card>
          <CardHeader title="Maintenance History" description="All maintenance records for this asset" action={<Button size="sm" leftIcon={<Wrench className="h-4 w-4" />}>Schedule</Button>} />
          {assetMaintenance.length === 0 ? (
            <EmptyState icon={<Wrench className="h-6 w-6" />} title="No maintenance records" description="This asset has no maintenance history yet." action={<Button size="sm" variant="outline">Schedule Maintenance</Button>} />
          ) : (
            <div className="p-3">
              {assetMaintenance.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-2 py-3 rounded-md hover:bg-surface-50 transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-warning-50 text-warning-600 flex items-center justify-center shrink-0"><Wrench className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-surface-900">{m.type}</p>
                    <p className="text-caption text-surface-500">{m.scheduledDate} · {m.technician} · ${m.cost}</p>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'audit' && (
        <Card>
          <CardHeader title="Audit Logs" description="System audit trail for this asset" />
          <div className="p-5">
            <div className="space-y-2">
              {[
                { action: 'Asset status changed to "In Maintenance"', user: 'David Kim', time: '2025-07-28 14:32' },
                { action: 'Asset details updated', user: 'Sarah Chen', time: '2025-07-15 09:12' },
                { action: 'Asset assigned', user: 'Admin', time: '2024-01-15 10:00' },
                { action: 'Asset created', user: 'Admin', time: '2024-01-10 08:30' },
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                  <ClipboardList className="h-4 w-4 text-surface-400 shrink-0" />
                  <p className="text-body text-surface-700 flex-1">{log.action}</p>
                  <p className="text-caption text-surface-500">{log.user}</p>
                  <p className="text-caption text-surface-400 w-32 text-right">{log.time}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {tab === 'comments' && (
        <Card>
          <CardHeader title="Comments" description="Team discussion about this asset" />
          <div className="p-5">
            <div className="flex gap-3 mb-6">
              <Avatar initials="AM" color="bg-brand-500" size="sm" />
              <div className="flex-1">
                <textarea placeholder="Add a comment..." className="input-base min-h-16 resize-none" />
                <div className="flex justify-end mt-2"><Button size="sm">Post Comment</Button></div>
              </div>
            </div>
            {[
              { name: 'Sarah Chen', initials: 'SC', color: 'bg-brand-500', text: 'Battery life has been degrading. Might need a replacement soon.', time: '2 days ago' },
              { name: 'David Kim', initials: 'DK', color: 'bg-warning-500', text: 'I will schedule a diagnostic check for next week.', time: '1 day ago' },
            ].map((c, i) => (
              <div key={i} className="flex gap-3 py-3 border-t border-surface-100">
                <Avatar initials={c.initials} color={c.color} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-body font-medium text-surface-900">{c.name}</p>
                    <p className="text-caption text-surface-400">{c.time}</p>
                  </div>
                  <p className="text-body text-surface-700 mt-1">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption text-surface-500">{label}</p>
      <p className="text-body font-medium text-surface-900 mt-0.5">{value}</p>
    </div>
  );
}

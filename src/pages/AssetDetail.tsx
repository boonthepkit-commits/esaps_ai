import { useState, useMemo } from 'react';
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
  Clock,
  Send,
  Plus,
  MapPin,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  PauseCircle
} from 'lucide-react';
import { Card, CardHeader, Button, Badge, StatusBadge, Avatar, Tabs, EmptyState, Progress, useToast, SectionCard, Drawer, Modal, Input, Select, Textarea } from '@/components/ui';
import { assets, employees, softwareLicenses } from '@/data/mockData';
import { getAssetHealth } from '@/data/aiData';
import {
  initialRequisitions,
  type ITRequisitionTicket,
  type RequisitionStatus,
  type TicketCategory,
  type PriorityLevel
} from '@/data/requisitionData';
import { cn } from '@/lib/cn';

interface AssetDetailProps {
  assetId: string;
  onNavigate: (id: string, aid?: string) => void;
}

const priorityConfig: Record<PriorityLevel, { variant: 'error' | 'warning' | 'accent' | 'default'; sla: string; color: string }> = {
  Critical: { variant: 'error', sla: '2 Hours SLA', color: 'text-error-600 bg-error-50 border-error-200' },
  High: { variant: 'warning', sla: '8 Hours SLA', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  Medium: { variant: 'accent', sla: '24 Hours SLA', color: 'text-brand-700 bg-brand-50 border-brand-200' },
  Low: { variant: 'default', sla: '48 Hours SLA', color: 'text-surface-600 bg-surface-100 border-surface-200' },
};

const categoryOptions: { label: string; value: TicketCategory }[] = [
  { label: 'Hardware Fault & Repair', value: 'Hardware Fault & Repair' },
  { label: 'Equipment Replacement / Upgrade', value: 'Equipment Replacement' },
  { label: 'Software & OS Issue', value: 'Software & OS Issue' },
  { label: 'Network & Wi-Fi', value: 'Network & Wi-Fi' },
  { label: 'Peripherals & Accessories', value: 'Peripherals & Accessories' },
  { label: 'Account & Access', value: 'Account & Access' },
  { label: 'Preventive Maintenance', value: 'Preventive Maintenance' },
];

export function AssetDetail({ assetId, onNavigate }: AssetDetailProps) {
  const { push } = useToast();
  const [tab, setTab] = useState('overview');
  const asset = assets.find((a) => a.id === assetId) ?? assets[0];
  const Icon = asset.icon;

  // Local state for tickets linked to this asset
  const [tickets, setTickets] = useState<ITRequisitionTicket[]>(initialRequisitions);
  const assetTickets = useMemo(() => {
    return tickets.filter((t) => t.asset.id === asset.id || t.asset.code === asset.code);
  }, [tickets, asset]);

  // Active (in-flight) ticket on this asset
  const activeTicket = useMemo(() => {
    return assetTickets.find((t) => ['PENDING_DEPT_APPROVAL', 'PENDING_IT_DISPATCH', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD'].includes(t.status));
  }, [assetTickets]);

  // Modals & Drawers
  const [selectedTicket, setSelectedTicket] = useState<ITRequisitionTicket | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  // Form states for new ticket
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<TicketCategory>('Hardware Fault & Repair');
  const [formPriority, setFormPriority] = useState<PriorityLevel>('Medium');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState(asset.location || 'HQ - Floor 4');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Settings className="h-4 w-4" /> },
    { id: 'history', label: 'History', icon: <History className="h-4 w-4" />, count: 5 },
    { id: 'files', label: 'Files', icon: <FileText className="h-4 w-4" />, count: 3 },
    { id: 'license', label: 'License', icon: <KeyRound className="h-4 w-4" /> },
    { id: 'maintenance', label: 'Maintenance & Tickets', icon: <Wrench className="h-4 w-4" />, count: assetTickets.length },
    { id: 'audit', label: 'Audit', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'comments', label: 'Comments', icon: <MessageSquare className="h-4 w-4" />, count: 2 },
  ];

  const quickActions = [
    { label: 'Assign', icon: UserPlus, onClick: () => push({ variant: 'info', title: 'Assign asset', message: asset.name }) },
    { label: 'Transfer', icon: ArrowRightLeft, onClick: () => push({ variant: 'info', title: 'Transfer asset', message: asset.name }) },
    {
      label: 'Request IT Service',
      icon: Wrench,
      onClick: () => {
        setFormTitle(`Service request for ${asset.name}`);
        setFormLocation(asset.location || 'HQ - Floor 4');
        setIsNewTicketModalOpen(true);
      }
    },
    { label: 'Dispose', icon: Trash2, onClick: () => push({ variant: 'warning', title: 'Disposal requested', message: asset.name }), danger: true },
    { label: 'Print QR', icon: QrCode, onClick: () => push({ variant: 'info', title: 'QR code ready', message: asset.code }) },
  ];

  const handleCreateTicket = () => {
    if (!formTitle.trim()) {
      push({ variant: 'warning', title: 'Subject Required', message: 'Please provide a title or issue summary.' });
      return;
    }

    const newCode = `REQ-2026-${(tickets.length + 1).toString().padStart(4, '0')}`;
    const slaHours = formPriority === 'Critical' ? 2 : formPriority === 'High' ? 8 : formPriority === 'Medium' ? 24 : 48;

    const newTicket: ITRequisitionTicket = {
      id: `req-${Date.now()}`,
      ticketCode: newCode,
      category: formCategory,
      priority: formPriority,
      slaTargetHours: slaHours,
      title: formTitle,
      description: formDescription || 'Issue submitted directly from Asset Details ledger.',
      location: formLocation,
      createdAt: 'Just now',
      status: 'PENDING_DEPT_APPROVAL',
      requester: {
        id: 'emp-101',
        name: 'Sarah Chen',
        department: asset.department || 'Engineering',
        jobTitle: 'Senior Full Stack Engineer',
        email: 'sarah.chen@company.com',
        avatarColor: 'bg-indigo-600',
        initials: 'SC',
      },
      asset: {
        id: asset.id,
        code: asset.code,
        name: asset.name,
        type: asset.type,
        serialNumber: asset.serialNumber || 'SN-UNKNOWN-99',
        location: asset.location || 'HQ - Floor 4',
        isMyAssignedAsset: asset.assignedTo === 'Sarah Chen',
        purchaseCost: asset.purchaseCost,
        currentValue: asset.currentValue,
      },
      departmentApproval: {
        status: 'Pending',
        approverName: 'David Chen',
        approverTitle: 'Principal Lead Engineer (Acting Approver)',
        isDelegated: true,
        delegatedBy: 'Sarah Jenkins (VP of Engineering - On Leave)',
      },
      itAssignment: {
        assignedBy: 'Alex Rivera (IT Service Desk Lead)',
      },
      itExecution: {
        currentStatus: 'Pending Dispatch',
      },
      timeline: [
        {
          id: `t-${Date.now()}`,
          stage: 'Creation',
          actorName: 'Sarah Chen',
          actorRole: 'Requester',
          timestamp: 'Just now',
          action: 'Requisition submitted directly via Asset Details.',
        }
      ]
    };

    setTickets([newTicket, ...tickets]);
    setIsNewTicketModalOpen(false);
    setFormTitle('');
    setFormDescription('');

    push({
      variant: 'success',
      title: 'IT Requisition Created',
      message: `${newCode} has been routed to Department Approver for sign-off.`
    });
  };

  const getStatusBadge = (status: RequisitionStatus) => {
    switch (status) {
      case 'PENDING_DEPT_APPROVAL':
        return <Badge variant="warning" dot>1. Dept Approval</Badge>;
      case 'PENDING_IT_DISPATCH':
        return <Badge variant="brand" dot>2. IT Dispatch</Badge>;
      case 'PLANNING':
        return <Badge variant="accent" dot>3. Planning</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning" dot>3. In-Progress</Badge>;
      case 'ON_HOLD':
        return <Badge variant="error" dot>3. On-Hold</Badge>;
      case 'DONE':
        return <Badge variant="success" dot>4. Resolved</Badge>;
      case 'REJECTED_BY_DEPT':
        return <Badge variant="error" dot>Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

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
              {activeTicket && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                  <Wrench className="h-3 w-3 text-amber-700" /> Active Ticket: {activeTicket.ticketCode}
                </span>
              )}
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

      {/* Tab 1: Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* Active Ticket Banner in Overview if present */}
            {activeTicket && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-amber-950">{activeTicket.ticketCode}</span>
                      {getStatusBadge(activeTicket.status)}
                      <Badge variant={priorityConfig[activeTicket.priority].variant} dot>
                        {activeTicket.priority} ({priorityConfig[activeTicket.priority].sla})
                      </Badge>
                    </div>
                    <p className="text-body font-semibold text-surface-900 mt-1">{activeTicket.title}</p>
                    <p className="text-caption text-surface-600 mt-0.5">
                      Assigned: {activeTicket.itAssignment.technicianName || 'Pending Dispatch'} · Requester: {activeTicket.requester.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate('ticket-detail', activeTicket.ticketCode)}
                  >
                    View Ticket
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<ExternalLink className="h-4 w-4" />}
                    onClick={() => onNavigate('maintenance')}
                  >
                    Maintenance Desk
                  </Button>
                </div>
              </div>
            )}

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
          </div>

          <div className="flex flex-col gap-4">
            <SectionCard title="Warranty & Coverage">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-surface-400" />
                  <span className="text-body text-surface-700">Expires {asset.warrantyExpiry}</span>
                </div>
                <Badge variant={new Date(asset.warrantyExpiry) < new Date() ? 'error' : 'success'} dot>
                  {new Date(asset.warrantyExpiry) < new Date() ? 'Expired' : 'Active Warranty'}
                </Badge>
              </div>
            </SectionCard>

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
        </div>
      )}

      {/* Tab 2: History */}
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
                { date: '2023-11-10', title: 'Purchase Order Created', desc: 'Apple Inc. · Verified & Inspected', user: 'James Wilson' },
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

      {/* Tab 3: Files */}
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

      {/* Tab 4: License */}
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

      {/* Tab 5: Maintenance & IT Requisition Tickets (Standardized with Maintenance.tsx) */}
      {tab === 'maintenance' && (
        <div className="flex flex-col gap-4">
          {/* Summary KPIs for this Asset */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-surface-50 rounded-xl border border-surface-200">
              <span className="text-caption text-surface-500 font-medium">Total Tickets</span>
              <p className="text-title font-bold text-surface-900 mt-1">{assetTickets.length}</p>
            </div>
            <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200">
              <span className="text-caption text-amber-700 font-medium">Active / Open</span>
              <p className="text-title font-bold text-amber-900 mt-1">
                {assetTickets.filter(t => t.status !== 'DONE' && t.status !== 'REJECTED_BY_DEPT').length}
              </p>
            </div>
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <span className="text-caption text-emerald-700 font-medium">Resolved & Closed</span>
              <p className="text-title font-bold text-emerald-900 mt-1">
                {assetTickets.filter(t => t.status === 'DONE').length}
              </p>
            </div>
            <div className="p-3.5 bg-brand-50/50 rounded-xl border border-brand-200">
              <span className="text-caption text-brand-700 font-medium">SLA Resolution Target</span>
              <p className="text-title font-bold text-brand-900 mt-1">
                100% On-Track
              </p>
            </div>
          </div>

          <Card>
            <CardHeader
              title="IT Requisition & Maintenance Tickets (REQ-xxxx)"
              description="Full audit history of repairs, upgrades, and IT servicing for this asset"
              action={
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ExternalLink className="h-4 w-4" />}
                    onClick={() => onNavigate('maintenance')}
                  >
                    Open Maintenance Desk
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => {
                      setFormTitle(`Report issue with ${asset.name}`);
                      setFormLocation(asset.location || 'HQ - Floor 4');
                      setIsNewTicketModalOpen(true);
                    }}
                  >
                    New Requisition
                  </Button>
                </div>
              }
            />

            {assetTickets.length === 0 ? (
              <EmptyState
                icon={<Wrench className="h-8 w-8 text-surface-400" />}
                title="No IT Requisition Tickets Recorded"
                description="This asset is currently in good condition with no open or past maintenance requisitions."
                action={
                  <Button
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => {
                      setFormTitle(`Report issue with ${asset.name}`);
                      setIsNewTicketModalOpen(true);
                    }}
                  >
                    Report IT Issue / Request Service
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-surface-100">
                {assetTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onNavigate('ticket-detail', t.ticketCode)}
                    className="p-4 hover:bg-surface-50 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-surface-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Wrench className="h-5 w-5 text-brand-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-surface-900">{t.ticketCode}</span>
                          <Badge variant={priorityConfig[t.priority].variant} dot>
                            {t.priority}
                          </Badge>
                          {getStatusBadge(t.status)}
                        </div>
                        <h4 className="text-body font-semibold text-surface-900 mt-1 truncate">{t.title}</h4>
                        <p className="text-caption text-surface-500 mt-0.5 flex items-center gap-3 flex-wrap">
                          <span>{t.category}</span>
                          <span>·</span>
                          <span>Created: {t.createdAt} by {t.requester.name}</span>
                          {t.itAssignment.technicianName && (
                            <>
                              <span>·</span>
                              <span className="text-brand-700 font-medium">Tech: {t.itAssignment.technicianName}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right text-caption">
                        <span className="text-surface-400 block text-[11px]">SLA Target</span>
                        <span className="font-medium text-surface-800">
                          {priorityConfig[t.priority].sla}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4 text-surface-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 6: Audit Logs */}
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

      {/* Tab 7: Comments */}
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

      {/* ========================================================================= */}
      {/* Slide-Over Ticket Detail Drawer (Unified with Maintenance.tsx)            */}
      {/* ========================================================================= */}
      <Drawer
        open={isDetailDrawerOpen && !!selectedTicket}
        onClose={() => setIsDetailDrawerOpen(false)}
        title={selectedTicket ? `Ticket: ${selectedTicket.ticketCode}` : 'Ticket Details'}
        description={selectedTicket ? `${selectedTicket.category} · Priority: ${selectedTicket.priority}` : ''}
        width="max-w-xl"
      >
        {selectedTicket && (
          <div className="flex flex-col gap-5 py-2">
            {/* Status & Priority Highlight Card */}
            <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedTicket.status)}
                  <Badge variant={priorityConfig[selectedTicket.priority].variant} dot>
                    {selectedTicket.priority} ({priorityConfig[selectedTicket.priority].sla})
                  </Badge>
                </div>
                <span className="text-caption text-surface-500 font-mono">Created: {selectedTicket.createdAt}</span>
              </div>
              <h3 className="text-heading font-bold text-surface-900 mt-2">{selectedTicket.title}</h3>
              <p className="text-body text-surface-600 mt-1">{selectedTicket.description}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-surface-200 text-caption">
                <div>
                  <span className="text-surface-400 block text-[11px]">Location</span>
                  <span className="font-medium text-surface-800 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-surface-400" /> {selectedTicket.location}
                  </span>
                </div>
                <div>
                  <span className="text-surface-400 block text-[11px]">Requester</span>
                  <span className="font-medium text-surface-800">{selectedTicket.requester.name} ({selectedTicket.requester.department})</span>
                </div>
                <div>
                  <span className="text-surface-400 block text-[11px]">Assigned Tech</span>
                  <span className="font-medium text-surface-800">{selectedTicket.itAssignment.technicianName || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* 4-Stage Workflow Governance Audit Timeline */}
            <div className="border border-surface-200 rounded-xl p-4 bg-white">
              <h4 className="text-caption font-bold text-surface-900 mb-3 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-brand-600" /> 4-Stage Governance & Audit Trail
              </h4>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-200">
                {/* Step 1: User Requisition */}
                <div className="relative flex items-start gap-3 pl-1">
                  <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold z-10">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-caption font-bold text-surface-900">1. User Requisition Submitted</p>
                      <span className="text-[10px] text-surface-400">{selectedTicket.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-surface-600">
                      By <strong>{selectedTicket.requester.name}</strong> ({selectedTicket.requester.jobTitle})
                    </p>
                  </div>
                </div>

                {/* Step 2: Department Approval */}
                <div className="relative flex items-start gap-3 pl-1">
                  <div className={cn(
                    'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 text-white',
                    selectedTicket.departmentApproval.approvedAt ? 'bg-emerald-600' : 'bg-surface-400'
                  )}>
                    {selectedTicket.departmentApproval.approvedAt ? '✓' : '2'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-caption font-bold text-surface-900">2. Department Sign-Off</p>
                      {selectedTicket.departmentApproval.approvedAt && (
                        <span className="text-[10px] text-surface-400">{selectedTicket.departmentApproval.approvedAt}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-surface-600">
                      Approver: <strong>{selectedTicket.departmentApproval.approverName}</strong>
                      {selectedTicket.departmentApproval.isDelegated && (
                        <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                          Delegated Acting Authority
                        </span>
                      )}
                    </p>
                    {selectedTicket.departmentApproval.comments && (
                      <p className="text-[11px] bg-surface-50 p-2 rounded border border-surface-200 mt-1 italic text-surface-700">
                        "{selectedTicket.departmentApproval.comments}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 3: IT Dispatch & Assignment */}
                <div className="relative flex items-start gap-3 pl-1">
                  <div className={cn(
                    'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 text-white',
                    selectedTicket.itAssignment.technicianName ? 'bg-emerald-600' : 'bg-surface-400'
                  )}>
                    {selectedTicket.itAssignment.technicianName ? '✓' : '3'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-caption font-bold text-surface-900">3. IT Dispatch Desk</p>
                      {selectedTicket.itAssignment.assignedAt && (
                        <span className="text-[10px] text-surface-400">{selectedTicket.itAssignment.assignedAt}</span>
                      )}
                    </div>
                    {selectedTicket.itAssignment.technicianName ? (
                      <p className="text-[11px] text-surface-600">
                        Assigned to <strong>{selectedTicket.itAssignment.technicianName}</strong> ({selectedTicket.itAssignment.technicianRole}) · Est Cost: ${selectedTicket.itAssignment.estimatedCost}
                      </p>
                    ) : (
                      <p className="text-[11px] text-surface-400 italic">Awaiting technician dispatch assignment</p>
                    )}
                  </div>
                </div>

                {/* Step 4: Technician Triage & Resolution */}
                <div className="relative flex items-start gap-3 pl-1">
                  <div className={cn(
                    'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 text-white',
                    selectedTicket.status === 'DONE' ? 'bg-emerald-600' : selectedTicket.status === 'ON_HOLD' ? 'bg-warning-500' : ['PLANNING', 'IN_PROGRESS'].includes(selectedTicket.status) ? 'bg-brand-600' : 'bg-surface-400'
                  )}>
                    {selectedTicket.status === 'DONE' ? '✓' : '4'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-caption font-bold text-surface-900">4. IT Servicing & Resolution</p>
                      {selectedTicket.itExecution.completedAt && (
                        <span className="text-[10px] text-surface-400">{selectedTicket.itExecution.completedAt}</span>
                      )}
                    </div>
                    {selectedTicket.itExecution.diagnosticNotes && (
                      <div className="mt-1 bg-surface-50 p-2.5 rounded border border-surface-200 text-[11px] space-y-1">
                        <p className="font-semibold text-surface-800">Diagnostic Notes:</p>
                        <p className="text-surface-600">{selectedTicket.itExecution.diagnosticNotes}</p>
                      </div>
                    )}

                    {selectedTicket.itExecution.holdReason && (
                      <div className="mt-1.5 bg-warning-50 p-2.5 rounded border border-warning-200 text-[11px]">
                        <p className="font-semibold text-warning-800">⚠️ Hold Reason ({selectedTicket.itExecution.holdCategory}):</p>
                        <p className="text-warning-700">{selectedTicket.itExecution.holdReason}</p>
                      </div>
                    )}

                    {selectedTicket.itExecution.resolutionNotes && (
                      <div className="mt-1.5 bg-emerald-50 p-2.5 rounded border border-emerald-200 text-[11px]">
                        <p className="font-semibold text-emerald-800">Resolution & Sign-Off:</p>
                        <p className="text-emerald-700">{selectedTicket.itExecution.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions in Drawer */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-200">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={() => {
                  push({
                    variant: 'info',
                    title: 'Work Order Printed',
                    message: `Sent work order for ${selectedTicket.ticketCode} to printer.`
                  });
                }}
              >
                Print Work Order
              </Button>
              <Button
                size="sm"
                leftIcon={<ExternalLink className="h-4 w-4" />}
                onClick={() => {
                  setIsDetailDrawerOpen(false);
                  onNavigate('maintenance');
                }}
              >
                Go to Maintenance Desk
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* New IT Requisition Modal for this Asset                                    */}
      {/* ========================================================================= */}
      <Modal
        open={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        title="Submit IT Requisition / Report Issue"
        description={`Creating a service request for ${asset.name} (${asset.code})`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsNewTicketModalOpen(false)}>
              Cancel
            </Button>
            <Button leftIcon={<Send className="h-4 w-4" />} onClick={handleCreateTicket}>
              Submit Requisition
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          {/* Target Asset Locked Info */}
          <div className="p-3 bg-surface-50 rounded-xl border border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-surface-900">{asset.name}</p>
                <p className="text-caption text-surface-500 font-mono">{asset.code} · {asset.serialNumber}</p>
              </div>
            </div>
            <Badge variant="neutral">{asset.type}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Issue Category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as TicketCategory)}
              options={categoryOptions}
            />

            <Select
              label="Priority & SLA"
              value={formPriority}
              onChange={(e) => setFormPriority(e.target.value as PriorityLevel)}
              options={[
                { value: 'Critical', label: '🔴 Critical (2 Hours SLA - Escalated)' },
                { value: 'High', label: '🟠 High (8 Hours SLA)' },
                { value: 'Medium', label: '🔵 Medium (24 Hours SLA)' },
                { value: 'Low', label: '⚪ Low (48 Hours SLA)' },
              ]}
            />
          </div>

          <Input
            label="Subject / Issue Summary"
            placeholder="e.g. Screen flickering under load, Battery swelling, OS freeze"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <Textarea
            label="Detailed Description & Symptoms"
            placeholder="Describe what happened, frequency of error, error messages, or parts requiring upgrade..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
          />

          <Input
            label="Device Location / Desk Pickup"
            value={formLocation}
            onChange={(e) => setFormLocation(e.target.value)}
            placeholder="e.g. HQ - Floor 4, Desk E-412"
          />

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-caption text-amber-800 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Automated Routing & Governance:</p>
              <p>This request will be routed to your Department Approver (David Chen - Delegated) before dispatching to IT Technicians.</p>
            </div>
          </div>
        </div>
      </Modal>
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


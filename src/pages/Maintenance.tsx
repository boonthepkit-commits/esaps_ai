import { useState, useMemo } from 'react';
import {
  Plus,
  Wrench,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Users,
  ShieldCheck,
  Send,
  ArrowRight,
  Filter,
  Search,
  Laptop,
  Monitor,
  Smartphone,
  Server,
  Router,
  Printer,
  ChevronRight,
  Check,
  X,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Info,
  Building,
  MapPin,
  Tag,
  ExternalLink,
  Kanban,
  List,
  Flame,
  UserCheck,
  Settings,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  StatusBadge,
  useToast,
  Modal,
  Drawer,
  Input,
  Select,
  Textarea,
  Tabs
} from '@/components/ui';
import {
  initialRequisitions,
  initialTechnicians,
  initialDelegationSettings,
  type ITRequisitionTicket,
  type RequisitionStatus,
  type TicketCategory,
  type PriorityLevel,
  type ITTechnician,
  type DelegatedApproverSetting
} from '@/data/requisitionData';
import { assets, employees } from '@/data/mockData';
import { cn } from '@/lib/cn';

interface MaintenanceProps {
  onNavigate: (id: string, aid?: string) => void;
}

type RolePerspective = 'ALL' | 'USER' | 'DEPT_APPROVER' | 'IT_MANAGER' | 'IT_TECH';

const categoryOptions: { label: string; value: TicketCategory; icon: string }[] = [
  { label: 'Hardware Fault & Repair', value: 'Hardware Fault & Repair', icon: '💻' },
  { label: 'Equipment Replacement / Upgrade', value: 'Equipment Replacement', icon: '🔄' },
  { label: 'Software & OS Issue', value: 'Software & OS Issue', icon: '🖥️' },
  { label: 'Network & Wi-Fi', value: 'Network & Wi-Fi', icon: '📡' },
  { label: 'Peripherals & Accessories', value: 'Peripherals & Accessories', icon: '⌨️' },
  { label: 'Account & Access', value: 'Account & Access', icon: '🔑' },
  { label: 'Preventive Maintenance', value: 'Preventive Maintenance', icon: '🛠️' },
];

const priorityConfig: Record<PriorityLevel, { variant: 'error' | 'warning' | 'accent' | 'default'; sla: string; color: string }> = {
  Critical: { variant: 'error', sla: '2 Hours SLA', color: 'text-error-600 bg-error-50 border-error-200' },
  High: { variant: 'warning', sla: '8 Hours SLA', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  Medium: { variant: 'accent', sla: '24 Hours SLA', color: 'text-brand-700 bg-brand-50 border-brand-200' },
  Low: { variant: 'default', sla: '48 Hours SLA', color: 'text-surface-600 bg-surface-100 border-surface-200' },
};

export function Maintenance({ onNavigate }: MaintenanceProps) {
  const { addToast } = useToast();

  // Primary State
  const [tickets, setTickets] = useState<ITRequisitionTicket[]>(initialRequisitions);
  const [technicians, setTechnicians] = useState<ITTechnician[]>(initialTechnicians);
  const [delegationSettings, setDelegationSettings] = useState<DelegatedApproverSetting[]>(initialDelegationSettings);
  
  // Perspective & Filtering
  const [perspective, setPerspective] = useState<RolePerspective>('ALL');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Active Drawers / Modals
  const [selectedTicket, setSelectedTicket] = useState<ITRequisitionTicket | null>(null);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false);
  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false);

  // Form states for New Requisition
  const [formCategory, setFormCategory] = useState<TicketCategory>('Hardware Fault & Repair');
  const [formPriority, setFormPriority] = useState<PriorityLevel>('Medium');
  const [formAssetMode, setFormAssetMode] = useState<'my' | 'general'>('my');
  const [formSelectedAssetCode, setFormSelectedAssetCode] = useState<string>('AST-0001');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('HQ - Floor 4, Desk E-412');

  // Form states for Approval
  const [approvalAction, setApprovalAction] = useState<'Approve' | 'Reject'>('Approve');
  const [approvalComments, setApprovalComments] = useState('');
  const [useDelegatedApprover, setUseDelegatedApprover] = useState(true);

  // Form states for IT Dispatch
  const [dispatchTechId, setDispatchTechId] = useState('tech-1');
  const [dispatchEstimatedCost, setDispatchEstimatedCost] = useState('150');
  const [dispatchTargetDate, setDispatchTargetDate] = useState('2026-08-18');
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Form states for IT Technician Status Update
  const [updateTargetStatus, setUpdateTargetStatus] = useState<'Planning' | 'In-Progress' | 'On-Hold' | 'Done'>('In-Progress');
  const [updateHoldCategory, setUpdateHoldCategory] = useState<'Waiting for Spare Parts' | 'Awaiting User Response' | 'Vendor Escalation' | 'Scheduled Maintenance Window'>('Waiting for Spare Parts');
  const [updateHoldReason, setUpdateHoldReason] = useState('');
  const [updateResolutionNotes, setUpdateResolutionNotes] = useState('');
  const [updateActualCost, setUpdateActualCost] = useState('85');
  const [updateDowntimeHours, setUpdateDowntimeHours] = useState('2.5');
  const [updatePartsUsed, setUpdatePartsUsed] = useState('Replacement Cable, Screws');

  // My Assigned Assets for Sarah Chen (current user mockup)
  const myAssignedAssets = useMemo(() => {
    return assets.filter(a => a.assignedTo === 'Sarah Chen');
  }, []);

  const sharedAssets = useMemo(() => {
    return assets.filter(a => a.assignedTo !== 'Sarah Chen');
  }, []);

  // Filtered Tickets based on Perspective & Search
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Perspective filtering
      if (perspective === 'USER' && ticket.requester.name !== 'Sarah Chen') return false;
      if (perspective === 'DEPT_APPROVER' && ticket.status !== 'PENDING_DEPT_APPROVAL') return false;
      if (perspective === 'IT_MANAGER' && ticket.status !== 'PENDING_IT_DISPATCH') return false;
      if (perspective === 'IT_TECH' && !['PLANNING', 'IN_PROGRESS', 'ON_HOLD'].includes(ticket.status)) return false;

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'ACTIVE' && !['PLANNING', 'IN_PROGRESS', 'ON_HOLD'].includes(ticket.status)) return false;
        else if (statusFilter !== 'ACTIVE' && ticket.status !== statusFilter) return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && ticket.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ticket.title.toLowerCase().includes(q);
        const matchCode = ticket.ticketCode.toLowerCase().includes(q);
        const matchAsset = ticket.asset.name.toLowerCase().includes(q) || ticket.asset.code.toLowerCase().includes(q);
        const matchRequester = ticket.requester.name.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchAsset && !matchRequester) return false;
      }

      return true;
    });
  }, [tickets, perspective, statusFilter, categoryFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    return {
      pendingDept: tickets.filter(t => t.status === 'PENDING_DEPT_APPROVAL').length,
      pendingDispatch: tickets.filter(t => t.status === 'PENDING_IT_DISPATCH').length,
      activeJobs: tickets.filter(t => ['PLANNING', 'IN_PROGRESS'].includes(t.status)).length,
      onHold: tickets.filter(t => t.status === 'ON_HOLD').length,
      done: tickets.filter(t => t.status === 'DONE').length,
      total: tickets.length
    };
  }, [tickets]);

  // Handlers
  const handleCreateRequisition = () => {
    if (!formTitle.trim()) {
      addToast('Please enter a request summary title', 'error');
      return;
    }

    const selectedAsset = assets.find(a => a.code === formSelectedAssetCode) || assets[0];
    const isMyAsset = formAssetMode === 'my';

    const newTicket: ITRequisitionTicket = {
      id: `req-${Date.now()}`,
      ticketCode: `REQ-2026-00${tickets.length + 42}`,
      title: formTitle,
      category: formCategory,
      priority: formPriority,
      slaTargetHours: formPriority === 'Critical' ? 2 : formPriority === 'High' ? 8 : formPriority === 'Medium' ? 24 : 48,
      description: formDescription || 'User submitted IT equipment requisition / repair request.',
      location: formLocation,
      createdAt: 'Just now',
      status: 'PENDING_DEPT_APPROVAL',
      requester: {
        id: 'emp-1',
        name: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        jobTitle: 'Senior Full Stack Engineer',
        department: 'Engineering',
        initials: 'SC',
        avatarColor: 'bg-indigo-600'
      },
      asset: {
        id: selectedAsset.id,
        code: selectedAsset.code,
        name: selectedAsset.name,
        type: selectedAsset.type,
        serialNumber: selectedAsset.serialNumber,
        location: selectedAsset.location,
        isMyAssignedAsset: isMyAsset,
        purchaseCost: selectedAsset.purchaseCost,
        currentValue: selectedAsset.currentValue
      },
      departmentApproval: {
        status: 'Pending',
        approverName: 'Sarah Jenkins (VP of Engineering)',
        approverTitle: 'VP of Engineering',
        isDelegated: true,
        delegatedBy: 'David Chen (Acting Lead Engineer - Delegated)'
      },
      itAssignment: {},
      itExecution: {
        currentStatus: 'Pending Dispatch'
      },
      timeline: [
        {
          id: `tl-${Date.now()}`,
          stage: 'Creation',
          actorName: 'Sarah Chen',
          actorRole: 'Requester (Engineering)',
          timestamp: 'Just now',
          action: 'Created IT Requisition Ticket',
          notes: `Asset ${selectedAsset.code} (${selectedAsset.name}) attached from ${isMyAsset ? 'My Assigned Assets' : 'Department Inventory'}`
        }
      ]
    };

    setTickets([newTicket, ...tickets]);
    setIsNewTicketModalOpen(false);
    setFormTitle('');
    setFormDescription('');
    addToast('IT Requisition Submitted', 'success', `Ticket ${newTicket.ticketCode} routed to Department Approver.`);
  };

  const handleApproveReject = () => {
    if (!selectedTicket) return;

    const isApproved = approvalAction === 'Approve';
    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: isApproved ? ('PENDING_IT_DISPATCH' as RequisitionStatus) : ('REJECTED_BY_DEPT' as RequisitionStatus),
          departmentApproval: {
            ...t.departmentApproval,
            status: isApproved ? ('Approved' as const) : ('Rejected' as const),
            isDelegated: useDelegatedApprover,
            delegatedBy: useDelegatedApprover ? 'David Chen (Principal Lead - Delegated Approver)' : undefined,
            approvedAt: 'Just now',
            comments: approvalComments || (isApproved ? 'Approved for IT resolution.' : 'Rejected by department head.')
          },
          timeline: [
            ...t.timeline,
            {
              id: `tl-${Date.now()}`,
              stage: 'Dept Approval' as const,
              actorName: useDelegatedApprover ? 'David Chen (Acting for Sarah Jenkins)' : 'Sarah Jenkins',
              actorRole: useDelegatedApprover ? 'Delegated Approver' : 'Department Head',
              timestamp: 'Just now',
              action: isApproved ? 'Department Head Approved Ticket' : 'Department Head Rejected Ticket',
              notes: approvalComments || (isApproved ? 'Proceed with IT resolution' : 'Request rejected'),
              badge: useDelegatedApprover ? 'Delegated Approver' : undefined
            }
          ]
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id) || null);
    setIsApproveModalOpen(false);
    setApprovalComments('');

    addToast(
      isApproved ? 'Ticket Approved by Department' : 'Ticket Rejected',
      isApproved ? 'success' : 'warning',
      isApproved ? `${selectedTicket.ticketCode} sent to IT Dispatch Queue.` : 'Requester notified.'
    );
  };

  const handleDispatchIT = () => {
    if (!selectedTicket) return;

    const tech = technicians.find(tc => tc.id === dispatchTechId) || technicians[0];
    const cost = parseFloat(dispatchEstimatedCost) || 0;

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'PLANNING' as RequisitionStatus,
          itAssignment: {
            assignedBy: 'Michael Chang (IT Operations Lead)',
            assignedAt: 'Just now',
            technicianId: tech.id,
            technicianName: tech.name,
            technicianRole: tech.role,
            technicianAvatar: tech.avatarColor,
            estimatedCost: cost,
            targetResolutionDate: dispatchTargetDate
          },
          itExecution: {
            ...t.itExecution,
            currentStatus: 'Planning' as const,
            diagnosticNotes: dispatchNotes || 'Assigned to specialist for hardware/software triage.'
          },
          timeline: [
            ...t.timeline,
            {
              id: `tl-${Date.now()}`,
              stage: 'IT Assignment' as const,
              actorName: 'Michael Chang',
              actorRole: 'IT Operations Lead',
              timestamp: 'Just now',
              action: `Assigned to ${tech.name} (${tech.role})`,
              notes: `Target Date: ${dispatchTargetDate} | Est Cost: $${cost}`
            }
          ]
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id) || null);
    setIsDispatchModalOpen(false);
    setDispatchNotes('');

    addToast('IT Technician Assigned', 'success', `Assigned ${tech.name} to ${selectedTicket.ticketCode}.`);
  };

  const handleUpdateExecutionStatus = () => {
    if (!selectedTicket) return;

    const target = updateTargetStatus;
    let newStatus: RequisitionStatus = 'IN_PROGRESS';
    if (target === 'Planning') newStatus = 'PLANNING';
    if (target === 'In-Progress') newStatus = 'IN_PROGRESS';
    if (target === 'On-Hold') newStatus = 'ON_HOLD';
    if (target === 'Done') newStatus = 'DONE';

    const cost = parseFloat(updateActualCost) || 0;
    const downtime = parseFloat(updateDowntimeHours) || 0;
    const parts = updatePartsUsed.split(',').map(p => p.trim()).filter(Boolean);

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        const newExecution = {
          ...t.itExecution,
          currentStatus: target,
          holdCategory: target === 'On-Hold' ? updateHoldCategory : undefined,
          holdReason: target === 'On-Hold' ? updateHoldReason : undefined,
          resolutionNotes: target === 'Done' ? updateResolutionNotes || 'Issue successfully resolved and verified.' : t.itExecution.resolutionNotes,
          actualCost: target === 'Done' ? cost : t.itExecution.actualCost,
          downtimeHours: target === 'Done' ? downtime : t.itExecution.downtimeHours,
          partsUsed: parts.length > 0 ? parts : t.itExecution.partsUsed,
          completedAt: target === 'Done' ? 'Just now' : undefined,
          userSatisfactionRating: target === 'Done' ? 5 : undefined
        };

        return {
          ...t,
          status: newStatus,
          itExecution: newExecution,
          timeline: [
            ...t.timeline,
            {
              id: `tl-${Date.now()}`,
              stage: target === 'Done' ? ('Resolution' as const) : (target as any),
              actorName: t.itAssignment.technicianName || 'Assigned Technician',
              actorRole: t.itAssignment.technicianRole || 'IT Specialist',
              timestamp: 'Just now',
              action: `Status updated to ${target.toUpperCase()}`,
              notes: target === 'On-Hold' ? `Hold Reason: ${updateHoldReason}` : target === 'Done' ? `Resolution: ${updateResolutionNotes || 'Verified working'}` : 'Diagnostic and repair progress logged.'
            }
          ]
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id) || null);
    setIsStatusUpdateModalOpen(false);

    addToast('Status Updated', 'info', `${selectedTicket.ticketCode} is now ${target}.`);
  };

  const getStatusBadge = (status: RequisitionStatus) => {
    switch (status) {
      case 'PENDING_DEPT_APPROVAL':
        return <Badge variant="warning" dot>1. Pending Dept Approval</Badge>;
      case 'REJECTED_BY_DEPT':
        return <Badge variant="error" dot>Dept Rejected</Badge>;
      case 'PENDING_IT_DISPATCH':
        return <Badge variant="accent" dot>2. Pending IT Dispatch</Badge>;
      case 'PLANNING':
        return <Badge variant="default" dot>3. IT Planning</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="brand" dot>3. In-Progress</Badge>;
      case 'ON_HOLD':
        return <Badge variant="warning" dot>3. On-Hold</Badge>;
      case 'DONE':
        return <Badge variant="success" dot>4. Done / Resolved</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'laptop': return <Laptop className="h-4 w-4 text-indigo-600" />;
      case 'monitor': return <Monitor className="h-4 w-4 text-blue-600" />;
      case 'smartphone': return <Smartphone className="h-4 w-4 text-purple-600" />;
      case 'server': return <Server className="h-4 w-4 text-emerald-600" />;
      case 'router':
      case 'switch':
      case 'router / switch': return <Router className="h-4 w-4 text-amber-600" />;
      case 'printer': return <Printer className="h-4 w-4 text-surface-600" />;
      default: return <Wrench className="h-4 w-4 text-brand-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-surface-900 via-surface-900 to-brand-950 text-white rounded-xl p-5 border border-surface-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-brand-600/30 border border-brand-500/30 flex items-center justify-center text-brand-300 shrink-0 shadow-inner">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-caption font-semibold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  IT Service Desk & Requisition
                </span>
                <span className="text-caption text-surface-400">4-Stage Governance Workflow</span>
              </div>
              <h1 className="text-title font-bold text-white mt-1">
                IT Requisition & Asset Maintenance (ระบบแจ้งซ่อมและเบิก/ร้องขอไอที)
              </h1>
              <p className="text-caption text-surface-300 mt-0.5">
                User Requisition ➔ Department Head Approval (with Delegated Approver) ➔ IT Dispatch ➔ Technician Resolution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="border-surface-700 bg-surface-800/80 hover:bg-surface-700 text-white"
              leftIcon={<ShieldCheck className="h-4 w-4 text-amber-400" />}
              onClick={() => setIsDelegationModalOpen(true)}
            >
              Delegated Approvers
            </Button>
            <Button
              size="sm"
              className="bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setFormAssetMode('my');
                setFormSelectedAssetCode(myAssignedAssets[0]?.code || 'AST-0001');
                setIsNewTicketModalOpen(true);
              }}
            >
              New IT Requisition
            </Button>
          </div>
        </div>

        {/* Role Perspective Simulator Bar */}
        <div className="mt-5 pt-4 border-t border-surface-800/80 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-caption font-medium text-surface-400 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-brand-400" /> Perspective / Role:
            </span>
            <div className="inline-flex bg-surface-800/90 rounded-lg p-0.5 border border-surface-700">
              <button
                onClick={() => setPerspective('ALL')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-caption font-medium transition-all',
                  perspective === 'ALL' ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-300 hover:text-white'
                )}
              >
                All Workflows
              </button>
              <button
                onClick={() => setPerspective('USER')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-caption font-medium transition-all',
                  perspective === 'USER' ? 'bg-indigo-600 text-white shadow-xs' : 'text-surface-300 hover:text-white'
                )}
              >
                👤 Employee (Sarah Chen)
              </button>
              <button
                onClick={() => setPerspective('DEPT_APPROVER')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-caption font-medium transition-all flex items-center gap-1',
                  perspective === 'DEPT_APPROVER' ? 'bg-amber-600 text-white shadow-xs' : 'text-surface-300 hover:text-white'
                )}
              >
                👔 Dept Approver
                {stats.pendingDept > 0 && (
                  <span className="h-4 px-1.5 rounded-full bg-amber-400 text-surface-950 font-bold text-[10px] flex items-center justify-center">
                    {stats.pendingDept}
                  </span>
                )}
              </button>
              <button
                onClick={() => setPerspective('IT_MANAGER')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-caption font-medium transition-all flex items-center gap-1',
                  perspective === 'IT_MANAGER' ? 'bg-brand-600 text-white shadow-xs' : 'text-surface-300 hover:text-white'
                )}
              >
                🛠️ IT Dispatch
                {stats.pendingDispatch > 0 && (
                  <span className="h-4 px-1.5 rounded-full bg-brand-300 text-surface-950 font-bold text-[10px] flex items-center justify-center">
                    {stats.pendingDispatch}
                  </span>
                )}
              </button>
              <button
                onClick={() => setPerspective('IT_TECH')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-caption font-medium transition-all flex items-center gap-1',
                  perspective === 'IT_TECH' ? 'bg-emerald-600 text-white shadow-xs' : 'text-surface-300 hover:text-white'
                )}
              >
                🔧 IT Technician
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex bg-surface-800 rounded-lg p-0.5 border border-surface-700">
              <button
                onClick={() => setViewMode('board')}
                className={cn(
                  'p-1.5 rounded-md text-caption transition-all',
                  viewMode === 'board' ? 'bg-surface-700 text-white' : 'text-surface-400 hover:text-white'
                )}
                title="Kanban Board View"
              >
                <Kanban className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded-md text-caption transition-all',
                  viewMode === 'list' ? 'bg-surface-700 text-white' : 'text-surface-400 hover:text-white'
                )}
                title="Data Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card
          className={cn(
            'p-3.5 cursor-pointer transition-all border',
            statusFilter === 'PENDING_DEPT_APPROVAL' ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500' : 'hover:border-surface-300'
          )}
          onClick={() => setStatusFilter(statusFilter === 'PENDING_DEPT_APPROVAL' ? 'ALL' : 'PENDING_DEPT_APPROVAL')}
        >
          <div className="flex items-center justify-between text-caption text-surface-500">
            <span>1. Dept Approval</span>
            <ShieldCheck className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-title font-bold text-surface-900 mt-1">{stats.pendingDept}</p>
          <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Needs Dept Head sign</p>
        </Card>

        <Card
          className={cn(
            'p-3.5 cursor-pointer transition-all border',
            statusFilter === 'PENDING_IT_DISPATCH' ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500' : 'hover:border-surface-300'
          )}
          onClick={() => setStatusFilter(statusFilter === 'PENDING_IT_DISPATCH' ? 'ALL' : 'PENDING_IT_DISPATCH')}
        >
          <div className="flex items-center justify-between text-caption text-surface-500">
            <span>2. IT Dispatch</span>
            <Users className="h-4 w-4 text-brand-600" />
          </div>
          <p className="text-title font-bold text-surface-900 mt-1">{stats.pendingDispatch}</p>
          <p className="text-[11px] text-brand-700 mt-0.5 font-medium">Ready to assign tech</p>
        </Card>

        <Card
          className={cn(
            'p-3.5 cursor-pointer transition-all border',
            statusFilter === 'PLANNING' ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500' : 'hover:border-surface-300'
          )}
          onClick={() => setStatusFilter(statusFilter === 'PLANNING' ? 'ALL' : 'PLANNING')}
        >
          <div className="flex items-center justify-between text-caption text-surface-500">
            <span>3. Planning</span>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-title font-bold text-surface-900 mt-1">{tickets.filter(t => t.status === 'PLANNING').length}</p>
          <p className="text-[11px] text-indigo-700 mt-0.5 font-medium">Sourcing parts / window</p>
        </Card>

        <Card
          className={cn(
            'p-3.5 cursor-pointer transition-all border',
            statusFilter === 'IN_PROGRESS' ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500' : 'hover:border-surface-300'
          )}
          onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
        >
          <div className="flex items-center justify-between text-caption text-surface-500">
            <span>3. In-Progress</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-title font-bold text-surface-900 mt-1">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</p>
          <p className="text-[11px] text-blue-700 mt-0.5 font-medium">Active technician triage</p>
        </Card>

        <Card
          className={cn(
            'p-3.5 cursor-pointer transition-all border',
            statusFilter === 'ON_HOLD' ? 'border-warning-500 bg-warning-50/40 ring-1 ring-warning-500' : 'hover:border-surface-300'
          )}
          onClick={() => setStatusFilter(statusFilter === 'ON_HOLD' ? 'ALL' : 'ON_HOLD')}
        >
          <div className="flex items-center justify-between text-caption text-surface-500">
            <span>3. On-Hold</span>
            <PauseCircle className="h-4 w-4 text-warning-600" />
          </div>
          <p className="text-title font-bold text-surface-900 mt-1">{stats.onHold}</p>
          <p className="text-[11px] text-warning-700 mt-0.5 font-medium">Awaiting vendor / parts</p>
        </Card>

        <Card
          className={cn(
            'p-3.5 cursor-pointer transition-all border',
            statusFilter === 'DONE' ? 'border-success-500 bg-success-50/40 ring-1 ring-success-500' : 'hover:border-surface-300'
          )}
          onClick={() => setStatusFilter(statusFilter === 'DONE' ? 'ALL' : 'DONE')}
        >
          <div className="flex items-center justify-between text-caption text-surface-500">
            <span>4. Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-success-600" />
          </div>
          <p className="text-title font-bold text-surface-900 mt-1">{stats.done}</p>
          <p className="text-[11px] text-success-700 mt-0.5 font-medium">Verified & closed</p>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-surface-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search by ticket code, asset name, serial, or requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-9 text-caption h-9 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-base text-caption h-9 w-auto"
          >
            <option value="ALL">All Categories</option>
            {categoryOptions.map(c => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>

          {statusFilter !== 'ALL' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('ALL')}
              leftIcon={<X className="h-3.5 w-3.5" />}
            >
              Clear Status Filter
            </Button>
          )}
        </div>
      </div>

      {/* Main View Area: Kanban Board or Table View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {/* Column 1: Stage 1 - Dept Approval */}
          <div className="bg-surface-50 rounded-xl p-3 border border-surface-200 flex flex-col gap-3 min-h-[500px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <h3 className="text-body font-semibold text-surface-900">1. Dept Approval</h3>
              </div>
              <Badge variant="warning">
                {filteredTickets.filter(t => t.status === 'PENDING_DEPT_APPROVAL').length}
              </Badge>
            </div>

            <div className="flex flex-col gap-2.5">
              {filteredTickets.filter(t => t.status === 'PENDING_DEPT_APPROVAL').map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={() => setSelectedTicket(ticket)}
                  onAction={() => {
                    setSelectedTicket(ticket);
                    setIsApproveModalOpen(true);
                  }}
                  actionLabel="Approve / Review"
                  actionVariant="primary"
                />
              ))}

              {filteredTickets.filter(t => t.status === 'PENDING_DEPT_APPROVAL').length === 0 && (
                <div className="p-8 text-center text-caption text-surface-400 border border-dashed border-surface-200 rounded-lg bg-white/50">
                  No tickets pending department approval
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Stage 2 - IT Dispatch */}
          <div className="bg-surface-50 rounded-xl p-3 border border-surface-200 flex flex-col gap-3 min-h-[500px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                <h3 className="text-body font-semibold text-surface-900">2. IT Dispatch Queue</h3>
              </div>
              <Badge variant="brand">
                {filteredTickets.filter(t => t.status === 'PENDING_IT_DISPATCH').length}
              </Badge>
            </div>

            <div className="flex flex-col gap-2.5">
              {filteredTickets.filter(t => t.status === 'PENDING_IT_DISPATCH').map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={() => setSelectedTicket(ticket)}
                  onAction={() => {
                    setSelectedTicket(ticket);
                    setIsDispatchModalOpen(true);
                  }}
                  actionLabel="Assign Tech"
                  actionVariant="brand"
                />
              ))}

              {filteredTickets.filter(t => t.status === 'PENDING_IT_DISPATCH').length === 0 && (
                <div className="p-8 text-center text-caption text-surface-400 border border-dashed border-surface-200 rounded-lg bg-white/50">
                  No tickets waiting for IT assignment
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Stage 3 - Technician Working (Planning, In-Progress, On-Hold) */}
          <div className="bg-surface-50 rounded-xl p-3 border border-surface-200 flex flex-col gap-3 min-h-[500px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <h3 className="text-body font-semibold text-surface-900">3. Active IT Jobs</h3>
              </div>
              <Badge variant="accent">
                {filteredTickets.filter(t => ['PLANNING', 'IN_PROGRESS', 'ON_HOLD'].includes(t.status)).length}
              </Badge>
            </div>

            <div className="flex flex-col gap-2.5">
              {filteredTickets.filter(t => ['PLANNING', 'IN_PROGRESS', 'ON_HOLD'].includes(t.status)).map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={() => setSelectedTicket(ticket)}
                  onAction={() => {
                    setSelectedTicket(ticket);
                    setUpdateTargetStatus(ticket.status === 'PLANNING' ? 'In-Progress' : ticket.status === 'IN_PROGRESS' ? 'Done' : 'In-Progress');
                    setIsStatusUpdateModalOpen(true);
                  }}
                  actionLabel="Update Status"
                  actionVariant="outline"
                />
              ))}

              {filteredTickets.filter(t => ['PLANNING', 'IN_PROGRESS', 'ON_HOLD'].includes(t.status)).length === 0 && (
                <div className="p-8 text-center text-caption text-surface-400 border border-dashed border-surface-200 rounded-lg bg-white/50">
                  No active technician jobs
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Stage 4 - Resolved / Closed */}
          <div className="bg-surface-50 rounded-xl p-3 border border-surface-200 flex flex-col gap-3 min-h-[500px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <h3 className="text-body font-semibold text-surface-900">4. Resolved & Verified</h3>
              </div>
              <Badge variant="success">
                {filteredTickets.filter(t => t.status === 'DONE').length}
              </Badge>
            </div>

            <div className="flex flex-col gap-2.5">
              {filteredTickets.filter(t => t.status === 'DONE').map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={() => setSelectedTicket(ticket)}
                  onAction={() => setSelectedTicket(ticket)}
                  actionLabel="View Summary"
                  actionVariant="ghost"
                />
              ))}

              {filteredTickets.filter(t => t.status === 'DONE').length === 0 && (
                <div className="p-8 text-center text-caption text-surface-400 border border-dashed border-surface-200 rounded-lg bg-white/50">
                  No resolved tickets
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body border-collapse">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200 text-caption font-semibold text-surface-600">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Asset / Device</th>
                  <th className="py-3 px-4">Category & Priority</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Workflow Status</th>
                  <th className="py-3 px-4">Assigned Tech</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {filteredTickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-surface-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-surface-900">{ticket.ticketCode}</p>
                      <p className="text-caption text-surface-500 line-clamp-1">{ticket.title}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {getAssetIcon(ticket.asset.type)}
                        <div>
                          <p className="font-medium text-surface-900 text-caption">{ticket.asset.name}</p>
                          <p className="text-[11px] text-surface-500">{ticket.asset.code} · S/N: {ticket.asset.serialNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant="neutral">{ticket.category}</Badge>
                        <Badge variant={priorityConfig[ticket.priority].variant} dot>
                          {ticket.priority} ({priorityConfig[ticket.priority].sla})
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={cn('h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold', ticket.requester.avatarColor)}>
                          {ticket.requester.initials}
                        </span>
                        <div>
                          <p className="text-caption font-medium text-surface-900">{ticket.requester.name}</p>
                          <p className="text-[11px] text-surface-500">{ticket.requester.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="py-3.5 px-4">
                      {ticket.itAssignment.technicianName ? (
                        <div>
                          <p className="text-caption font-medium text-surface-900">{ticket.itAssignment.technicianName}</p>
                          <p className="text-[11px] text-surface-500">{ticket.itAssignment.technicianRole}</p>
                        </div>
                      ) : (
                        <span className="text-caption text-surface-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 1. Modal: New IT Requisition Form (For Employee / User)                   */}
      {/* ========================================================================= */}
      <Modal
        open={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        title="Create IT Requisition / แจ้งปัญหาไอที"
        description="Submit a service ticket or equipment request. Routed to your department head for approval."
        size="lg"
      >
        <div className="flex flex-col gap-4 py-2">
          {/* Requester Bar */}
          <div className="bg-surface-50 p-3 rounded-lg border border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-caption flex items-center justify-center">
                SC
              </span>
              <div>
                <p className="text-caption font-semibold text-surface-900">Sarah Chen (You)</p>
                <p className="text-[11px] text-surface-500">Engineering · Senior Full Stack Engineer</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Approver: David Chen (Delegated for Sarah Jenkins)
              </span>
            </div>
          </div>

          {/* Asset Selection Mode: My Assigned Asset vs Shared */}
          <div>
            <label className="block text-caption font-medium text-surface-700 mb-1.5">
              Select Affected Asset (เลือกทรัพย์สินที่ต้องการแจ้งซ่อม/ร้องขอ) <span className="text-error-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  setFormAssetMode('my');
                  setFormSelectedAssetCode(myAssignedAssets[0]?.code || 'AST-0001');
                }}
                className={cn(
                  'flex-1 py-1.5 px-3 rounded-md text-caption font-medium border text-center transition-all',
                  formAssetMode === 'my'
                    ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold shadow-xs'
                    : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                )}
              >
                📱 My Assigned Assets ({myAssignedAssets.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormAssetMode('general');
                  setFormSelectedAssetCode(sharedAssets[0]?.code || 'AST-0004');
                }}
                className={cn(
                  'flex-1 py-1.5 px-3 rounded-md text-caption font-medium border text-center transition-all',
                  formAssetMode === 'general'
                    ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold shadow-xs'
                    : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                )}
              >
                🏢 Shared / Department Asset ({sharedAssets.length})
              </button>
            </div>

            {/* Visual Asset Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border rounded-lg border-surface-200">
              {(formAssetMode === 'my' ? myAssignedAssets : sharedAssets).map(asset => (
                <div
                  key={asset.id}
                  onClick={() => setFormSelectedAssetCode(asset.code)}
                  className={cn(
                    'p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-2.5',
                    formSelectedAssetCode === asset.code
                      ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                      : 'border-surface-200 bg-white hover:border-surface-300'
                  )}
                >
                  <div className="p-2 rounded bg-surface-100 shrink-0">
                    {getAssetIcon(asset.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-caption font-bold text-surface-900 truncate">{asset.name}</p>
                    <p className="text-[11px] text-surface-500 font-mono">{asset.code} · S/N: {asset.serialNumber}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-100 text-surface-600">
                        {asset.location}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-medium">${asset.currentValue.toLocaleString()}</span>
                    </div>
                  </div>
                  {formSelectedAssetCode === asset.code && (
                    <Check className="h-4 w-4 text-brand-600 shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-caption font-medium text-surface-700 mb-1.5">
                Request Category (หมวดหมู่ปัญหา)
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as TicketCategory)}
                className="input-base text-caption w-full h-9"
              >
                {categoryOptions.map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-caption font-medium text-surface-700 mb-1.5">
                Urgency & SLA Level (ความเร่งด่วน)
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as PriorityLevel)}
                className="input-base text-caption w-full h-9"
              >
                <option value="Critical">🔴 Critical (2 Hours SLA - Work Blocked)</option>
                <option value="High">🟠 High (8 Hours SLA - Urgent)</option>
                <option value="Medium">🔵 Medium (24 Hours SLA - Standard)</option>
                <option value="Low">⚪ Low (48 Hours SLA - Minor)</option>
              </select>
            </div>
          </div>

          {/* Request Title */}
          <div>
            <Input
              label="Subject / Problem Summary (หัวข้อสรุปปัญหา)"
              placeholder="e.g. MacBook screen flickering and battery draining rapidly"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
          </div>

          {/* Request Description */}
          <div>
            <Textarea
              label="Detailed Description & Error Behavior (รายละเอียดปัญหาที่พบ)"
              placeholder="Describe symptoms, error codes, steps to reproduce, or upgrade justification..."
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <Input
              label="Physical Location / Desk Number (สถานที่ตั้งเครื่อง)"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              leftIcon={<MapPin className="h-4 w-4 text-surface-400" />}
            />
          </div>

          {/* Workflow Chain Preview Banner */}
          <div className="bg-brand-50/70 border border-brand-200 rounded-lg p-3 text-caption text-brand-900">
            <p className="font-semibold flex items-center gap-1.5 mb-1 text-brand-800">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" /> Automated Approval Routing Chain
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-brand-700 flex-wrap">
              <span className="font-medium bg-white px-2 py-0.5 rounded border border-brand-200">1. User (Sarah Chen)</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium bg-white px-2 py-0.5 rounded border border-brand-200 text-amber-800">2. Dept Approver (David Chen)</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium bg-white px-2 py-0.5 rounded border border-brand-200">3. IT Dispatch Lead</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium bg-white px-2 py-0.5 rounded border border-brand-200 text-emerald-800">4. Specialist Repair</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-surface-200">
          <Button variant="outline" onClick={() => setIsNewTicketModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<Send className="h-4 w-4" />}
            onClick={handleCreateRequisition}
          >
            Submit IT Requisition
          </Button>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. Modal: Department Head Approval Modal                                 */}
      {/* ========================================================================= */}
      <Modal
        open={isApproveModalOpen && !!selectedTicket}
        onClose={() => setIsApproveModalOpen(false)}
        title="Department Approval / พิจารณาอนุมัติคำขอ"
        description={`Reviewing requisition for ${selectedTicket?.requester.name} (${selectedTicket?.requester.department})`}
        size="md"
      >
        {selectedTicket && (
          <div className="flex flex-col gap-4 py-2">
            {/* Ticket Info Card */}
            <div className="bg-surface-50 p-3.5 rounded-lg border border-surface-200">
              <div className="flex items-center justify-between">
                <span className="font-mono text-caption font-bold text-surface-900">{selectedTicket.ticketCode}</span>
                <Badge variant={priorityConfig[selectedTicket.priority].variant} dot>
                  {selectedTicket.priority} Priority
                </Badge>
              </div>
              <h4 className="text-body font-bold text-surface-900 mt-1">{selectedTicket.title}</h4>
              <p className="text-caption text-surface-600 mt-1">{selectedTicket.description}</p>
              
              <div className="mt-3 pt-2.5 border-t border-surface-200 flex items-center justify-between text-caption text-surface-500">
                <span>Device: <strong>{selectedTicket.asset.name}</strong> ({selectedTicket.asset.code})</span>
                <span>Asset Value: <strong>${selectedTicket.asset.currentValue.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Delegated Approver Notice Toggle */}
            <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-caption font-semibold text-amber-900">
                    Signing as Delegated Approver
                  </p>
                </div>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-caption font-medium text-amber-800">
                  <input
                    type="checkbox"
                    checked={useDelegatedApprover}
                    onChange={(e) => setUseDelegatedApprover(e.target.checked)}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Authorize delegation</span>
                </label>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                Authorized: <strong>David Chen (Principal Lead)</strong> is acting on behalf of <strong>Sarah Jenkins (VP Eng)</strong> while on leave.
              </p>
            </div>

            {/* Decision Action Selector */}
            <div>
              <label className="block text-caption font-medium text-surface-700 mb-1.5">
                Approval Decision (ผลการพิจารณา)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setApprovalAction('Approve')}
                  className={cn(
                    'py-2 px-3 rounded-lg border text-caption font-bold text-center transition-all flex items-center justify-center gap-2',
                    approvalAction === 'Approve'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                      : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                  )}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Approve & Forward to IT
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalAction('Reject')}
                  className={cn(
                    'py-2 px-3 rounded-lg border text-caption font-bold text-center transition-all flex items-center justify-center gap-2',
                    approvalAction === 'Reject'
                      ? 'bg-error-50 border-error-500 text-error-700 ring-1 ring-error-500'
                      : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                  )}
                >
                  <X className="h-4 w-4 text-error-600" />
                  Reject Requisition
                </button>
              </div>
            </div>

            {/* Comments */}
            <div>
              <Textarea
                label="Department Comments & Justification (ข้อคิดเห็นหรือเงื่อนไข)"
                placeholder={approvalAction === 'Approve' ? 'e.g. Approved under urgent Q3 project sprint deadline. Please expedite with Apple Care.' : 'Specify reason for rejection...'}
                rows={2}
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-surface-200">
          <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={approvalAction === 'Approve' ? 'primary' : 'danger'}
            onClick={handleApproveReject}
          >
            {approvalAction === 'Approve' ? 'Confirm Department Approval' : 'Confirm Rejection'}
          </Button>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. Modal: IT Manager Dispatch & Technician Assignment Modal              */}
      {/* ========================================================================= */}
      <Modal
        open={isDispatchModalOpen && !!selectedTicket}
        onClose={() => setIsDispatchModalOpen(false)}
        title="IT Dispatch / มอบหมายงานให้ช่างไอที"
        description={`Assigning specialist and setting resolution SLA for ${selectedTicket?.ticketCode}`}
        size="md"
      >
        {selectedTicket && (
          <div className="flex flex-col gap-4 py-2">
            {/* Ticket Summary */}
            <div className="bg-surface-50 p-3 rounded-lg border border-surface-200">
              <div className="flex items-center justify-between text-caption">
                <span className="font-bold text-surface-900">{selectedTicket.ticketCode}: {selectedTicket.title}</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Dept Approved</span>
              </div>
              <p className="text-[11px] text-surface-500 mt-1">
                Asset: {selectedTicket.asset.name} ({selectedTicket.asset.code}) · Location: {selectedTicket.location}
              </p>
            </div>

            {/* Technician Selector */}
            <div>
              <label className="block text-caption font-medium text-surface-700 mb-1.5">
                Assign to IT Specialist (เลือกช่างผู้รับผิดชอบ) <span className="text-error-500">*</span>
              </label>
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto p-1 border rounded-lg border-surface-200">
                {technicians.map(tech => (
                  <div
                    key={tech.id}
                    onClick={() => setDispatchTechId(tech.id)}
                    className={cn(
                      'p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between',
                      dispatchTechId === tech.id
                        ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                        : 'border-surface-200 bg-white hover:border-surface-300'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={cn('h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-caption', tech.avatarColor)}>
                        {tech.initials}
                      </span>
                      <div>
                        <p className="text-caption font-bold text-surface-900">{tech.name}</p>
                        <p className="text-[11px] text-surface-500">{tech.role} · <span className="text-brand-700">{tech.specialty}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-surface-100 text-surface-700">
                        {tech.activeTicketsCount} Active Jobs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Cost & Target Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  label="Estimated Repair / Parts Cost ($)"
                  type="number"
                  value={dispatchEstimatedCost}
                  onChange={(e) => setDispatchEstimatedCost(e.target.value)}
                  leftIcon={<DollarSign className="h-4 w-4 text-surface-400" />}
                />
              </div>
              <div>
                <Input
                  label="Target Resolution Date"
                  type="date"
                  value={dispatchTargetDate}
                  onChange={(e) => setDispatchTargetDate(e.target.value)}
                />
              </div>
            </div>

            {/* Diagnostic Directives */}
            <div>
              <Textarea
                label="Dispatch Directives & Diagnostic Plan (คำแนะนำสำหรับช่าง)"
                placeholder="e.g. Check hardware logic board GPU thermal paste and test battery capacity. Order parts if required."
                rows={2}
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-surface-200">
          <Button variant="outline" onClick={() => setIsDispatchModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<Send className="h-4 w-4" />}
            onClick={handleDispatchIT}
          >
            Confirm Dispatch & Assign Tech
          </Button>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 4. Modal: IT Technician Status & Progress Update Modal                   */}
      {/* ========================================================================= */}
      <Modal
        open={isStatusUpdateModalOpen && !!selectedTicket}
        onClose={() => setIsStatusUpdateModalOpen(false)}
        title="Update Execution Status / บันทึกผลการแก้ไข"
        description={`Updating progress for ${selectedTicket?.ticketCode} (${selectedTicket?.asset.name})`}
        size="md"
      >
        {selectedTicket && (
          <div className="flex flex-col gap-4 py-2">
            {/* Status Step Selector */}
            <div>
              <label className="block text-caption font-medium text-surface-700 mb-1.5">
                Current Execution Status (สถานะการดำเนินงาน)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setUpdateTargetStatus('Planning')}
                  className={cn(
                    'py-2 px-2 rounded-lg border text-caption font-bold text-center transition-all',
                    updateTargetStatus === 'Planning'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                      : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                  )}
                >
                  🟡 Planning
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateTargetStatus('In-Progress')}
                  className={cn(
                    'py-2 px-2 rounded-lg border text-caption font-bold text-center transition-all',
                    updateTargetStatus === 'In-Progress'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                      : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                  )}
                >
                  🔵 In-Progress
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateTargetStatus('On-Hold')}
                  className={cn(
                    'py-2 px-2 rounded-lg border text-caption font-bold text-center transition-all',
                    updateTargetStatus === 'On-Hold'
                      ? 'bg-warning-50 border-warning-500 text-warning-700 ring-1 ring-warning-500'
                      : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                  )}
                >
                  🟠 On-Hold
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateTargetStatus('Done')}
                  className={cn(
                    'py-2 px-2 rounded-lg border text-caption font-bold text-center transition-all',
                    updateTargetStatus === 'Done'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                      : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                  )}
                >
                  🟢 Done
                </button>
              </div>
            </div>

            {/* If On-Hold: Show Reason Details */}
            {updateTargetStatus === 'On-Hold' && (
              <div className="p-3 rounded-lg bg-warning-50/70 border border-warning-200 flex flex-col gap-2.5">
                <div>
                  <label className="block text-caption font-semibold text-warning-900 mb-1">
                    Hold Reason Category (สาเหตุที่พักงานชั่วคราว)
                  </label>
                  <select
                    value={updateHoldCategory}
                    onChange={(e: any) => setUpdateHoldCategory(e.target.value)}
                    className="input-base text-caption w-full h-9 bg-white"
                  >
                    <option value="Waiting for Spare Parts">📦 Waiting for Spare Parts / Delivery</option>
                    <option value="Awaiting User Response">👤 Awaiting User Device Drop-off / Response</option>
                    <option value="Vendor Escalation">🏢 Vendor / Apple / Dell Escalation</option>
                    <option value="Scheduled Maintenance Window">⏰ Scheduled Maintenance Window</option>
                  </select>
                </div>
                <div>
                  <Textarea
                    label="Hold Justification & ETA"
                    placeholder="e.g. Awaiting delivery of replacement battery from certified supplier. ETA: Tomorrow 10 AM."
                    rows={2}
                    value={updateHoldReason}
                    onChange={(e) => setUpdateHoldReason(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* If Done: Show Resolution Summary, Actual Cost, Downtime */}
            {updateTargetStatus === 'Done' && (
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 flex flex-col gap-3">
                <div>
                  <Textarea
                    label="Resolution Summary (สรุปการแก้ไขปัญหา)"
                    placeholder="e.g. Replaced display flex cable and thermal interface. Stress test passed with 0 artifacts."
                    rows={2}
                    value={updateResolutionNotes}
                    onChange={(e) => setUpdateResolutionNotes(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      label="Actual Repair Cost ($)"
                      type="number"
                      value={updateActualCost}
                      onChange={(e) => setUpdateActualCost(e.target.value)}
                      leftIcon={<DollarSign className="h-4 w-4 text-surface-400" />}
                    />
                  </div>
                  <div>
                    <Input
                      label="Asset Downtime (Hours)"
                      type="number"
                      value={updateDowntimeHours}
                      onChange={(e) => setUpdateDowntimeHours(e.target.value)}
                      leftIcon={<Clock className="h-4 w-4 text-surface-400" />}
                    />
                  </div>
                </div>

                <div>
                  <Input
                    label="Spare Parts / Items Used (Comma-separated)"
                    placeholder="e.g. Thermal Paste, Display Flex Cable"
                    value={updatePartsUsed}
                    onChange={(e) => setUpdatePartsUsed(e.target.value)}
                  />
                </div>

                <div className="text-[11px] text-emerald-800 bg-white p-2 rounded border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Cost and downtime will be auto-synced into <strong>AI Decision Center</strong> asset history.</span>
                </div>
              </div>
            )}

            {/* If In-Progress or Planning */}
            {(updateTargetStatus === 'Planning' || updateTargetStatus === 'In-Progress') && (
              <div>
                <Textarea
                  label="Diagnostic & Progress Notes (บันทึกการตรวจสอบ)"
                  placeholder="e.g. Device received at Helpdesk Lab 2. Diagnostics running..."
                  rows={2}
                  value={updateResolutionNotes}
                  onChange={(e) => setUpdateResolutionNotes(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-surface-200">
          <Button variant="outline" onClick={() => setIsStatusUpdateModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateExecutionStatus}
          >
            Save Progress Update
          </Button>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 5. Modal: Delegated Approver Management (ผู้รักษาการแทน)                   */}
      {/* ========================================================================= */}
      <Modal
        open={isDelegationModalOpen}
        onClose={() => setIsDelegationModalOpen(false)}
        title="Delegated Approver Settings / ผู้รักษาการแทนหัวหน้าแผนก"
        description="Configure acting approvers when department heads are on leave or out of office."
        size="lg"
      >
        <div className="flex flex-col gap-4 py-2">
          <p className="text-caption text-surface-600">
            When a Department Head is out of office, delegated approvers receive full signing authority to approve IT requisitions without bottlenecking SLA.
          </p>

          <div className="flex flex-col gap-3">
            {delegationSettings.map((ds, idx) => (
              <div
                key={ds.department}
                className={cn(
                  'p-3.5 rounded-lg border transition-all',
                  ds.isActive ? 'bg-amber-50/50 border-amber-200' : 'bg-surface-50 border-surface-200 opacity-80'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-surface-500" />
                    <h4 className="text-body font-bold text-surface-900">{ds.department} Department</h4>
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ds.isActive}
                      onChange={(e) => {
                        const updated = [...delegationSettings];
                        updated[idx].isActive = e.target.checked;
                        setDelegationSettings(updated);
                        addToast(
                          e.target.checked ? 'Delegation Activated' : 'Delegation Deactivated',
                          'info',
                          `${ds.department}: ${ds.delegatedApprover.name}`
                        );
                      }}
                      className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-caption font-semibold text-surface-800">
                      {ds.isActive ? 'Active Delegation' : 'Inactive'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-2.5 border-t border-surface-200/80 text-caption">
                  <div>
                    <span className="text-surface-500 block text-[11px]">Primary Department Head:</span>
                    <p className="font-semibold text-surface-900">{ds.primaryApprover.name}</p>
                    <p className="text-[11px] text-surface-500">{ds.primaryApprover.title}</p>
                  </div>
                  <div className="bg-white/80 p-2 rounded border border-surface-200">
                    <span className="text-amber-700 font-semibold block text-[11px]">⚡ Acting Delegated Approver:</span>
                    <p className="font-bold text-surface-900">{ds.delegatedApprover.name}</p>
                    <p className="text-[11px] text-surface-600">{ds.delegatedApprover.title}</p>
                  </div>
                </div>

                {ds.isActive && (
                  <div className="mt-2 text-[11px] text-surface-600 flex items-center justify-between">
                    <span>Active Duration: <strong>{ds.startDate}</strong> to <strong>{ds.endDate}</strong></span>
                    <span className="italic text-surface-500">Reason: {ds.reason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-surface-200">
          <Button variant="primary" onClick={() => setIsDelegationModalOpen(false)}>
            Done
          </Button>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 6. Drawer: Ticket Details & 4-Stage Visual Lifecycle Stepper              */}
      {/* ========================================================================= */}
      <Drawer
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.ticketCode}
        description={selectedTicket?.title}
        width="max-w-xl"
      >
        {selectedTicket && (
          <div className="flex flex-col gap-5 py-1">
            {/* Status & Priority Badge Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-surface-200">
              {getStatusBadge(selectedTicket.status)}
              <Badge variant={priorityConfig[selectedTicket.priority].variant} dot>
                {selectedTicket.priority} ({priorityConfig[selectedTicket.priority].sla})
              </Badge>
            </div>

            {/* 4-Stage Visual Workflow Stepper */}
            <div className="bg-surface-50 p-3.5 rounded-xl border border-surface-200">
              <h4 className="text-caption font-bold text-surface-700 mb-3 flex items-center gap-1.5">
                <WorkflowIcon className="h-4 w-4 text-brand-600" />
                4-Stage Governance Workflow Timeline
              </h4>

              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-300">
                {/* Step 1: User Created */}
                <div className="relative flex items-start gap-3 pl-1">
                  <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold z-10">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-caption font-bold text-surface-900">1. User Requisition Created</p>
                      <span className="text-[10px] text-surface-400">{selectedTicket.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-surface-600">
                      By <strong>{selectedTicket.requester.name}</strong> ({selectedTicket.requester.department})
                    </p>
                  </div>
                </div>

                {/* Step 2: Department Approval */}
                <div className="relative flex items-start gap-3 pl-1">
                  <div className={cn(
                    'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 text-white',
                    selectedTicket.departmentApproval.status === 'Approved' ? 'bg-emerald-600' : selectedTicket.departmentApproval.status === 'Rejected' ? 'bg-error-600' : 'bg-amber-500'
                  )}>
                    {selectedTicket.departmentApproval.status === 'Approved' ? '✓' : selectedTicket.departmentApproval.status === 'Rejected' ? '✗' : '2'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-caption font-bold text-surface-900">
                        2. Department Approval ({selectedTicket.departmentApproval.status})
                      </p>
                      {selectedTicket.departmentApproval.approvedAt && (
                        <span className="text-[10px] text-surface-400">{selectedTicket.departmentApproval.approvedAt}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-surface-600">
                      Approver: <strong>{selectedTicket.departmentApproval.approverName}</strong>
                      {selectedTicket.departmentApproval.isDelegated && (
                        <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 font-semibold px-1 rounded">
                          (Delegated: {selectedTicket.departmentApproval.delegatedBy})
                        </span>
                      )}
                    </p>
                    {selectedTicket.departmentApproval.comments && (
                      <p className="text-[11px] text-surface-500 italic mt-0.5 bg-white p-1.5 rounded border border-surface-200">
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
                      <p className="text-caption font-bold text-surface-900">3. IT Dispatch & Assignment</p>
                      {selectedTicket.itAssignment.assignedAt && (
                        <span className="text-[10px] text-surface-400">{selectedTicket.itAssignment.assignedAt}</span>
                      )}
                    </div>
                    {selectedTicket.itAssignment.technicianName ? (
                      <p className="text-[11px] text-surface-600">
                        Assigned to: <strong>{selectedTicket.itAssignment.technicianName}</strong> ({selectedTicket.itAssignment.technicianRole})
                      </p>
                    ) : (
                      <p className="text-[11px] text-surface-400 italic">Waiting for IT Manager dispatch</p>
                    )}
                  </div>
                </div>

                {/* Step 4: Technician Resolution */}
                <div className="relative flex items-start gap-3 pl-1">
                  <div className={cn(
                    'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 text-white',
                    selectedTicket.status === 'DONE' ? 'bg-emerald-600' : 'bg-surface-400'
                  )}>
                    {selectedTicket.status === 'DONE' ? '✓' : '4'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-caption font-bold text-surface-900">4. Technician Resolution & Sign-off</p>
                      {selectedTicket.itExecution.completedAt && (
                        <span className="text-[10px] text-surface-400">{selectedTicket.itExecution.completedAt}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-surface-600">
                      Current Step: <strong>{selectedTicket.itExecution.currentStatus}</strong>
                    </p>
                    {selectedTicket.itExecution.resolutionNotes && (
                      <p className="text-[11px] text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200 mt-1">
                        {selectedTicket.itExecution.resolutionNotes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Affected Asset Details */}
            <div className="border border-surface-200 rounded-lg p-3.5 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-caption font-bold text-surface-700">Affected Asset Profile</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[11px]"
                  rightIcon={<ExternalLink className="h-3 w-3" />}
                  onClick={() => onNavigate('assets', selectedTicket.asset.id)}
                >
                  Open in Asset Ledger
                </Button>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-surface-100 shrink-0">
                  {getAssetIcon(selectedTicket.asset.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-body font-bold text-surface-900">{selectedTicket.asset.name}</h4>
                  <p className="text-caption text-surface-500 font-mono">
                    Code: {selectedTicket.asset.code} · S/N: {selectedTicket.asset.serialNumber}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-surface-100 text-caption">
                    <div>
                      <span className="text-[11px] text-surface-400 block">Purchase Cost:</span>
                      <span className="font-semibold text-surface-800">${selectedTicket.asset.purchaseCost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-surface-400 block">Current Book Value:</span>
                      <span className="font-semibold text-surface-800">${selectedTicket.asset.currentValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Financials & Telemetry (If Available) */}
            {(selectedTicket.itExecution.actualCost || selectedTicket.itExecution.downtimeHours) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-50 rounded-lg border border-surface-200">
                  <span className="text-[11px] text-surface-500 block">Actual Repair Cost:</span>
                  <p className="text-title font-bold text-surface-900">${selectedTicket.itExecution.actualCost}</p>
                </div>
                <div className="p-3 bg-surface-50 rounded-lg border border-surface-200">
                  <span className="text-[11px] text-surface-500 block">Asset Downtime:</span>
                  <p className="text-title font-bold text-surface-900">{selectedTicket.itExecution.downtimeHours} Hours</p>
                </div>
              </div>
            )}

            {/* Quick Context Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              {selectedTicket.status === 'PENDING_DEPT_APPROVAL' && (
                <Button
                  className="w-full"
                  variant="primary"
                  leftIcon={<ShieldCheck className="h-4 w-4" />}
                  onClick={() => setIsApproveModalOpen(true)}
                >
                  Perform Department Approval
                </Button>
              )}

              {selectedTicket.status === 'PENDING_IT_DISPATCH' && (
                <Button
                  className="w-full"
                  variant="primary"
                  leftIcon={<Users className="h-4 w-4" />}
                  onClick={() => setIsDispatchModalOpen(true)}
                >
                  Assign IT Technician
                </Button>
              )}

              {['PLANNING', 'IN_PROGRESS', 'ON_HOLD'].includes(selectedTicket.status) && (
                <Button
                  className="w-full"
                  variant="primary"
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                  onClick={() => setIsStatusUpdateModalOpen(true)}
                >
                  Update Execution Status (Planning / In-Progress / Hold / Done)
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

// Sub-component: Clean Card for Kanban and Board View
function TicketCard({
  ticket,
  onSelect,
  onAction,
  actionLabel,
  actionVariant = 'primary'
}: {
  ticket: ITRequisitionTicket;
  onSelect: () => void;
  onAction: () => void;
  actionLabel: string;
  actionVariant?: 'primary' | 'brand' | 'outline' | 'ghost';
}) {
  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-lg p-3.5 border border-surface-200 shadow-xs hover:shadow-md hover:border-brand-300 transition-all cursor-pointer flex flex-col gap-2.5"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-caption font-bold text-surface-800">{ticket.ticketCode}</span>
        <Badge
          variant={ticket.priority === 'Critical' ? 'error' : ticket.priority === 'High' ? 'warning' : ticket.priority === 'Medium' ? 'accent' : 'default'}
          dot
        >
          {ticket.priority}
        </Badge>
      </div>

      <div>
        <h4 className="text-caption font-bold text-surface-900 line-clamp-1">{ticket.title}</h4>
        <p className="text-[11px] text-surface-500 line-clamp-2 mt-0.5">{ticket.description}</p>
      </div>

      <div className="bg-surface-50 p-2 rounded border border-surface-100 flex items-center justify-between text-[11px]">
        <span className="font-medium text-surface-800 truncate max-w-[160px]">{ticket.asset.name}</span>
        <span className="text-surface-500 font-mono">{ticket.asset.code}</span>
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px] text-surface-500">
        <div className="flex items-center gap-1.5">
          <span className={cn('h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold', ticket.requester.avatarColor)}>
            {ticket.requester.initials}
          </span>
          <span className="truncate max-w-[90px]">{ticket.requester.name}</span>
        </div>

        {ticket.itAssignment.technicianName ? (
          <span className="text-brand-700 font-medium">{ticket.itAssignment.technicianName}</span>
        ) : (
          <span className="text-amber-700 italic">Unassigned</span>
        )}
      </div>

      <div className="pt-2 border-t border-surface-100" onClick={(e) => e.stopPropagation()}>
        <Button
          size="sm"
          variant={actionVariant as any}
          className="w-full h-7 text-caption"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

function WorkflowIcon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="9" y="15" width="6" height="6" rx="1" />
      <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" />
      <path d="M12 12v3" />
    </svg>
  );
}

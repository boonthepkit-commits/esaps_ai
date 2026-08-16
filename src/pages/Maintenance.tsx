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
  FileText,
  Eye,
  Edit,
  Trash2,
  Printer as PrintIcon,
  Layers,
  ArrowRightLeft
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
  Tabs,
  Avatar,
  ConfirmDialog
} from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
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
import { assets, employees, departments } from '@/data/mockData';
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
  const { push } = useToast();

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
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // AI Natural Language Search State
  const [aiQuery, setAiQuery] = useState('');
  const [aiActive, setAiActive] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<{ filters: { label: string; value: string }[]; count: number } | null>(null);

  // Active Drawers / Modals
  const [selectedTicket, setSelectedTicket] = useState<ITRequisitionTicket | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
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

  // AI Natural Language Search Handler
  const handleAISearch = () => {
    if (!aiQuery.trim()) return;
    const lower = aiQuery.toLowerCase();
    const parsedFilters: { label: string; value: string }[] = [];

    // Priority Detection
    if (lower.includes('critical') || lower.includes('urgent') || lower.includes('emergency')) {
      parsedFilters.push({ label: 'Priority', value: 'Critical' });
    } else if (lower.includes('high')) {
      parsedFilters.push({ label: 'Priority', value: 'High' });
    }

    // Status Detection
    if (lower.includes('pending approval') || lower.includes('dept approval') || lower.includes('need approve')) {
      parsedFilters.push({ label: 'Status', value: 'PENDING_DEPT_APPROVAL' });
    } else if (lower.includes('dispatch') || lower.includes('assign tech') || lower.includes('pending dispatch')) {
      parsedFilters.push({ label: 'Status', value: 'PENDING_IT_DISPATCH' });
    } else if (lower.includes('hold') || lower.includes('on-hold') || lower.includes('waiting')) {
      parsedFilters.push({ label: 'Status', value: 'ON_HOLD' });
    } else if (lower.includes('progress') || lower.includes('repairing') || lower.includes('working')) {
      parsedFilters.push({ label: 'Status', value: 'IN_PROGRESS' });
    } else if (lower.includes('done') || lower.includes('resolved') || lower.includes('completed') || lower.includes('closed')) {
      parsedFilters.push({ label: 'Status', value: 'DONE' });
    }

    // Category Detection
    if (lower.includes('hardware') || lower.includes('repair') || lower.includes('screen') || lower.includes('battery')) {
      parsedFilters.push({ label: 'Category', value: 'Hardware Fault & Repair' });
    } else if (lower.includes('software') || lower.includes('os') || lower.includes('license')) {
      parsedFilters.push({ label: 'Category', value: 'Software & OS Issue' });
    } else if (lower.includes('network') || lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('vpn')) {
      parsedFilters.push({ label: 'Category', value: 'Network & Wi-Fi' });
    } else if (lower.includes('upgrade') || lower.includes('replace') || lower.includes('replacement')) {
      parsedFilters.push({ label: 'Category', value: 'Equipment Replacement' });
    }

    // Department Detection
    if (lower.includes('engineering') || lower.includes('eng')) {
      parsedFilters.push({ label: 'Department', value: 'Engineering' });
    } else if (lower.includes('sales')) {
      parsedFilters.push({ label: 'Department', value: 'Sales' });
    } else if (lower.includes('design')) {
      parsedFilters.push({ label: 'Department', value: 'Design' });
    } else if (lower.includes('finance')) {
      parsedFilters.push({ label: 'Department', value: 'Finance' });
    }

    const count = tickets.filter((t) => {
      return parsedFilters.every((f) => {
        if (f.label === 'Priority') return t.priority === f.value;
        if (f.label === 'Status') return t.status === f.value;
        if (f.label === 'Category') return t.category === f.value;
        if (f.label === 'Department') return t.requester.department === f.value;
        return true;
      });
    }).length;

    setAiInterpretation({ filters: parsedFilters, count });
    setAiActive(true);

    if (parsedFilters.some(f => f.label === 'Status')) {
      const sf = parsedFilters.find(f => f.label === 'Status');
      if (sf) setStatusFilter(sf.value);
    }
    if (parsedFilters.some(f => f.label === 'Priority')) {
      const pf = parsedFilters.find(f => f.label === 'Priority');
      if (pf) setPriorityFilter(pf.value);
    }
    if (parsedFilters.some(f => f.label === 'Category')) {
      const cf = parsedFilters.find(f => f.label === 'Category');
      if (cf) setCategoryFilter(cf.value);
    }
    if (parsedFilters.some(f => f.label === 'Department')) {
      const df = parsedFilters.find(f => f.label === 'Department');
      if (df) setDeptFilter(df.value);
    }
  };

  const clearAISearch = () => {
    setAiQuery('');
    setAiInterpretation(null);
    setAiActive(false);
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
    setDeptFilter('ALL');
    setPerspective('ALL');
  };

  const resetAllFilters = () => {
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
    setDeptFilter('ALL');
    setPerspective('ALL');
    setSearchQuery('');
    setAiQuery('');
    setAiInterpretation(null);
    setAiActive(false);
  };

  const hasActiveFilters = statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL' || deptFilter !== 'ALL' || perspective !== 'ALL' || searchQuery.trim() !== '' || aiActive;

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

      // Priority filter
      if (priorityFilter !== 'ALL' && ticket.priority !== priorityFilter) return false;

      // Category filter
      if (categoryFilter !== 'ALL' && ticket.category !== categoryFilter) return false;

      // Department filter
      if (deptFilter !== 'ALL' && ticket.requester.department !== deptFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ticket.title.toLowerCase().includes(q);
        const matchCode = ticket.ticketCode.toLowerCase().includes(q);
        const matchAsset = ticket.asset.name.toLowerCase().includes(q) || ticket.asset.code.toLowerCase().includes(q) || ticket.asset.serialNumber.toLowerCase().includes(q);
        const matchRequester = ticket.requester.name.toLowerCase().includes(q) || ticket.requester.department.toLowerCase().includes(q);
        const matchTech = ticket.itAssignment.technicianName?.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchAsset && !matchRequester && !matchTech) return false;
      }

      return true;
    });
  }, [tickets, perspective, statusFilter, priorityFilter, categoryFilter, deptFilter, searchQuery]);

  // KPI Calculations
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      pendingDept: tickets.filter(t => t.status === 'PENDING_DEPT_APPROVAL').length,
      pendingDispatch: tickets.filter(t => t.status === 'PENDING_IT_DISPATCH').length,
      inProgress: tickets.filter(t => ['PLANNING', 'IN_PROGRESS'].includes(t.status)).length,
      onHold: tickets.filter(t => t.status === 'ON_HOLD').length,
      done: tickets.filter(t => t.status === 'DONE').length,
    };
  }, [tickets]);

  // Handler: Create New Requisition
  const handleCreateRequisition = () => {
    if (!formTitle.trim()) {
      push({ variant: 'warning', title: 'Subject Required', message: 'Please enter a summary title for this requisition' });
      return;
    }

    const selectedAsset = assets.find(a => a.code === formSelectedAssetCode) || assets[0];
    const newId = `REQ-${Date.now().toString().slice(-4)}`;
    const newCode = `ITR-2026-${(tickets.length + 1).toString().padStart(3, '0')}`;
    const slaHours = formPriority === 'Critical' ? 2 : formPriority === 'High' ? 8 : formPriority === 'Medium' ? 24 : 48;

    const newTicket: ITRequisitionTicket = {
      id: newId,
      ticketCode: newCode,
      category: formCategory,
      priority: formPriority,
      slaTargetHours: slaHours,
      title: formTitle,
      description: formDescription || 'User requested inspection and servicing.',
      location: formLocation,
      createdAt: 'Just now',
      status: 'PENDING_DEPT_APPROVAL',
      requester: {
        id: 'emp-101',
        name: 'Sarah Chen',
        department: 'Engineering',
        jobTitle: 'Senior Full Stack Engineer',
        email: 'sarah.chen@enterprise.io',
        avatarColor: 'bg-indigo-600',
        initials: 'SC',
      },
      asset: {
        id: selectedAsset.id,
        code: selectedAsset.code,
        name: selectedAsset.name,
        type: selectedAsset.type,
        serialNumber: selectedAsset.serialNumber || 'SN-UNKNOWN-99',
        location: selectedAsset.location || 'HQ - Floor 4',
        isMyAssignedAsset: formAssetMode === 'my',
        purchaseCost: selectedAsset.purchaseCost,
        currentValue: selectedAsset.currentValue,
      },
      departmentApproval: {
        status: 'Pending',
        approverName: 'David Chen',
        approverTitle: 'Principal Engineering Lead',
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
          actorRole: 'Requester (Senior Engineer)',
          timestamp: 'Just now',
          action: 'Requisition submitted and routed to department head for review.',
        }
      ]
    };

    setTickets([newTicket, ...tickets]);
    setIsNewTicketModalOpen(false);
    setFormTitle('');
    setFormDescription('');

    push({
      variant: 'success',
      title: 'IT Requisition Submitted',
      message: `${newCode} routed to Department Approver (David Chen) for sign-off.`
    });
  };

  // Handler: Department Head Approve / Reject
  const handleApproveReject = () => {
    if (!selectedTicket) return;

    if (approvalAction === 'Approve') {
      const updated = tickets.map(t => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            status: 'PENDING_IT_DISPATCH' as RequisitionStatus,
            departmentApproval: {
              ...t.departmentApproval,
              status: 'Approved' as const,
              approvedAt: 'Just now',
              approverName: useDelegatedApprover ? 'David Chen (Delegated)' : 'Sarah Jenkins',
              comments: approvalComments || 'Approved. Expedite equipment repair as required.',
            }
          };
        }
        return t;
      });
      setTickets(updated);
      setSelectedTicket(updated.find(t => t.id === selectedTicket.id) || null);
      setIsApproveModalOpen(false);
      setApprovalComments('');
      push({
        variant: 'success',
        title: 'Requisition Approved',
        message: `${selectedTicket.ticketCode} passed to IT Dispatch Desk.`
      });
    } else {
      const updated = tickets.map(t => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            status: 'REJECTED_BY_DEPT' as RequisitionStatus,
            departmentApproval: {
              ...t.departmentApproval,
              status: 'Rejected' as const,
              approvedAt: 'Just now (Rejected)',
              comments: approvalComments || 'Request rejected by department authority.',
            }
          };
        }
        return t;
      });
      setTickets(updated);
      setSelectedTicket(updated.find(t => t.id === selectedTicket.id) || null);
      setIsApproveModalOpen(false);
      push({
        variant: 'info',
        title: 'Requisition Rejected',
        message: `${selectedTicket.ticketCode} returned to requester.`
      });
    }
  };

  // Handler: IT Dispatch Assignment
  const handleDispatchAssign = () => {
    if (!selectedTicket) return;
    const tech = technicians.find(t => t.id === dispatchTechId) || technicians[0];

    const updated = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'IN_PROGRESS' as RequisitionStatus,
          itAssignment: {
            ...t.itAssignment,
            assignedAt: 'Just now',
            assignedBy: 'Alex Rivera (IT Lead)',
            technicianId: tech.id,
            technicianName: tech.name,
            technicianRole: tech.specialty,
            estimatedCost: Number(dispatchEstimatedCost) || 0,
            targetResolutionDate: dispatchTargetDate,
          },
          itExecution: {
            ...t.itExecution,
            currentStatus: 'In-Progress' as const,
            diagnosticNotes: dispatchNotes || 'Assigned to specialist technician.',
          }
        };
      }
      return t;
    });

    setTickets(updated);
    setSelectedTicket(updated.find(t => t.id === selectedTicket.id) || null);
    setIsDispatchModalOpen(false);
    push({
      variant: 'success',
      title: 'Technician Assigned',
      message: `${tech.name} has been dispatched for ${selectedTicket.ticketCode}.`
    });
  };

  // Handler: IT Technician Status Update (In-Progress, Hold, Done)
  const handleTechnicianStatusUpdate = () => {
    if (!selectedTicket) return;

    let nextStatus: RequisitionStatus = 'IN_PROGRESS';
    if (updateTargetStatus === 'Planning') nextStatus = 'PLANNING';
    if (updateTargetStatus === 'In-Progress') nextStatus = 'IN_PROGRESS';
    if (updateTargetStatus === 'On-Hold') nextStatus = 'ON_HOLD';
    if (updateTargetStatus === 'Done') nextStatus = 'DONE';

    const updated = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: nextStatus,
          itExecution: {
            ...t.itExecution,
            currentStatus: updateTargetStatus,
            holdCategory: nextStatus === 'ON_HOLD' ? updateHoldCategory : t.itExecution.holdCategory,
            holdReason: nextStatus === 'ON_HOLD' ? updateHoldReason : t.itExecution.holdReason,
            resolutionNotes: nextStatus === 'DONE' ? (updateResolutionNotes || 'Repaired and functional test verified.') : t.itExecution.resolutionNotes,
            actualCost: nextStatus === 'DONE' ? Number(updateActualCost) : t.itExecution.actualCost,
            downtimeHours: nextStatus === 'DONE' ? Number(updateDowntimeHours) : t.itExecution.downtimeHours,
            partsUsed: nextStatus === 'DONE' ? updatePartsUsed.split(',').map(s => s.trim()) : t.itExecution.partsUsed,
            completedAt: nextStatus === 'DONE' ? 'Just now' : t.itExecution.completedAt,
          }
        };
      }
      return t;
    });

    setTickets(updated);
    setSelectedTicket(updated.find(t => t.id === selectedTicket.id) || null);
    setIsStatusUpdateModalOpen(false);
    push({
      variant: 'success',
      title: `Status Updated: ${updateTargetStatus}`,
      message: `Work log recorded for ${selectedTicket.ticketCode}.`
    });
  };

  // Helper: Asset Icon
  const getAssetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'laptop': return <Laptop className="h-4 w-4 text-brand-600" />;
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

  // Helper: Status Badge
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

  // Columns definition for DataTable (Standardized with Asset Management)
  const columns: Column<ITRequisitionTicket>[] = [
    {
      key: 'ticketCode',
      header: 'Ticket Code & Subject',
      sortable: true,
      sortValue: (r) => r.ticketCode,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-surface-100 flex items-center justify-center shrink-0">
            {getAssetIcon(r.asset.type)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-surface-900">{r.ticketCode}</span>
              <Badge variant={priorityConfig[r.priority].variant} dot>
                {r.priority}
              </Badge>
            </div>
            <p className="text-caption text-surface-600 truncate max-w-xs">{r.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'asset',
      header: 'Asset / Device',
      sortable: true,
      sortValue: (r) => r.asset.name,
      render: (r) => (
        <div className="min-w-0">
          <p className="font-medium text-surface-900 truncate">{r.asset.name}</p>
          <p className="text-caption text-surface-500 font-mono">{r.asset.code} · {r.asset.serialNumber}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category & SLA',
      sortable: true,
      sortValue: (r) => r.category,
      render: (r) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-surface-700 text-caption font-medium">{r.category}</span>
          <span className="text-[11px] text-surface-400 font-mono">{priorityConfig[r.priority].sla}</span>
        </div>
      ),
    },
    {
      key: 'requester',
      header: 'Requester',
      sortable: true,
      sortValue: (r) => r.requester.name,
      render: (r) => (
        <div className="flex items-center gap-2">
          <Avatar
            initials={r.requester.initials}
            size="xs"
            color={r.requester.avatarColor || 'bg-brand-500'}
          />
          <div className="min-w-0">
            <p className="text-caption font-medium text-surface-800 truncate">{r.requester.name}</p>
            <p className="text-[11px] text-surface-400">{r.requester.department}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Workflow Stage',
      sortable: true,
      sortValue: (r) => r.status,
      render: (r) => getStatusBadge(r.status),
    },
    {
      key: 'assignedTech',
      header: 'Assigned Tech',
      sortable: true,
      sortValue: (r) => r.itAssignment.technicianName || '',
      render: (r) => r.itAssignment.technicianName ? (
        <div className="flex items-center gap-1.5">
          <Wrench className="h-3.5 w-3.5 text-brand-600" />
          <div className="min-w-0">
            <span className="text-caption font-medium text-surface-800 truncate block">{r.itAssignment.technicianName}</span>
            <span className="text-[10px] text-surface-400 block">{r.itAssignment.technicianRole}</span>
          </div>
        </div>
      ) : (
        <span className="text-caption text-surface-400 italic">Unassigned</span>
      ),
    },
    {
      key: 'date',
      header: 'Created / Location',
      sortable: true,
      sortValue: (r) => r.createdAt,
      render: (r) => (
        <div className="text-[11px] text-surface-500">
          <p className="font-medium text-surface-700">{r.createdAt}</p>
          <p className="text-surface-400 truncate max-w-[140px]">{r.location}</p>
        </div>
      ),
    },
  ];

  // Row Actions (Dropdown menu for each row in DataTable)
  const rowActions = (row: ITRequisitionTicket) => {
    const actions = [
      {
        label: 'View Ticket Details',
        icon: <Eye className="h-4 w-4" />,
        onClick: () => {
          onNavigate('ticket-detail', row.ticketCode);
        },
      },
    ];

    if (row.status === 'PENDING_DEPT_APPROVAL') {
      actions.push({
        label: 'Department Approval',
        icon: <ShieldCheck className="h-4 w-4 text-amber-600" />,
        onClick: () => {
          setSelectedTicket(row);
          setIsApproveModalOpen(true);
        },
      });
    }

    if (row.status === 'PENDING_IT_DISPATCH') {
      actions.push({
        label: 'Assign IT Technician',
        icon: <Users className="h-4 w-4 text-brand-600" />,
        onClick: () => {
          setSelectedTicket(row);
          setIsDispatchModalOpen(true);
        },
      });
    }

    if (['PLANNING', 'IN_PROGRESS', 'ON_HOLD'].includes(row.status)) {
      actions.push({
        label: 'Update Tech Status',
        icon: <RotateCcw className="h-4 w-4 text-emerald-600" />,
        onClick: () => {
          setSelectedTicket(row);
          setIsStatusUpdateModalOpen(true);
        },
      });
    }

    actions.push(
      {
        label: 'View Asset Profile',
        icon: <Laptop className="h-4 w-4" />,
        onClick: () => onNavigate('assets', row.asset.id),
      },
      {
        label: 'Print Work Order',
        icon: <PrintIcon className="h-4 w-4" />,
        onClick: () => {
          push({
            variant: 'info',
            title: 'Print Work Order',
            message: `Generated printable slip for ${row.ticketCode}`,
          });
        },
      }
    );

    return actions;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Standardized Top Action Bar (Aligned with Asset Management) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="brand">{filteredTickets.length} tickets</Badge>
          
          {/* Role Perspective Quick Pills */}
          <div className="inline-flex bg-surface-100 rounded-lg p-0.5 border border-surface-200 text-caption">
            <button
              onClick={() => setPerspective('ALL')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-all',
                perspective === 'ALL' ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-600 hover:text-surface-900'
              )}
            >
              All Roles
            </button>
            <button
              onClick={() => setPerspective('USER')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-all',
                perspective === 'USER' ? 'bg-brand-600 text-white shadow-xs' : 'text-surface-600 hover:text-surface-900'
              )}
            >
              👤 Employee
            </button>
            <button
              onClick={() => setPerspective('DEPT_APPROVER')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1',
                perspective === 'DEPT_APPROVER' ? 'bg-amber-600 text-white shadow-xs' : 'text-surface-600 hover:text-surface-900'
              )}
            >
              👔 Dept Approver
              {stats.pendingDept > 0 && (
                <span className="h-4 px-1 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                  {stats.pendingDept}
                </span>
              )}
            </button>
            <button
              onClick={() => setPerspective('IT_MANAGER')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1',
                perspective === 'IT_MANAGER' ? 'bg-brand-600 text-white shadow-xs' : 'text-surface-600 hover:text-surface-900'
              )}
            >
              🛠️ IT Dispatch
              {stats.pendingDispatch > 0 && (
                <span className="h-4 px-1 rounded-full bg-brand-200 text-brand-900 font-bold text-[10px]">
                  {stats.pendingDispatch}
                </span>
              )}
            </button>
            <button
              onClick={() => setPerspective('IT_TECH')}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-all',
                perspective === 'IT_TECH' ? 'bg-emerald-600 text-white shadow-xs' : 'text-surface-600 hover:text-surface-900'
              )}
            >
              🔧 Technician
            </button>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<X className="h-3.5 w-3.5" />}
              onClick={resetAllFilters}
            >
              Clear filters
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Board vs List */}
          <div className="inline-flex bg-surface-100 rounded-lg p-0.5 border border-surface-200">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-2.5 py-1 rounded-md text-caption font-medium transition-all flex items-center gap-1.5',
                viewMode === 'list' ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-500 hover:text-surface-800'
              )}
              title="Data Table View"
            >
              <List className="h-4 w-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                'px-2.5 py-1 rounded-md text-caption font-medium transition-all flex items-center gap-1.5',
                viewMode === 'board' ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-500 hover:text-surface-800'
              )}
              title="Kanban Board View"
            >
              <Kanban className="h-4 w-4" />
              <span>Kanban</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<ShieldCheck className="h-4 w-4 text-amber-600" />}
            onClick={() => setIsDelegationModalOpen(true)}
          >
            Delegated Approvers
          </Button>

          <Button
            size="sm"
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

      {/* 2. KPI Summary Cards Grid (Aligned with Enterprise Standards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card
          className={cn(
            'p-3.5 cursor-pointer transition-all border hover:shadow-sm',
            statusFilter === 'PENDING_DEPT_APPROVAL' ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500' : 'hover:border-surface-300'
          )}
          onClick={() => setStatusFilter(statusFilter === 'PENDING_DEPT_APPROVAL' ? 'ALL' : 'PENDING_DEPT_APPROVAL')}
        >
          <div className="flex items-center justify-between text-caption text-surface-500">
            <span className="font-medium">1. Dept Approval</span>
            <div className="h-7 w-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-title font-bold text-surface-900 mt-1">{stats.pendingDept}</p>
          <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Awaiting manager sign-off</p>
        </Card>

        <Card
          className={cn(
            'p-3.5 cursor-pointer transition-all border hover:shadow-sm',
            statusFilter === 'PENDING_IT_DISPATCH' ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500' : 'hover:border-surface-300'
          )}
          onClick={() => setStatusFilter(statusFilter === 'PENDING_IT_DISPATCH' ? 'ALL' : 'PENDING_IT_DISPATCH')}
        >
          <div className="flex items-center justify-between text-caption text-surface-500">
            <span className="font-medium">2. IT Dispatch</span>
            <div className="h-7 w-7 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-title font-bold text-surface-900 mt-1">{stats.pendingDispatch}</p>
          <p className="text-[11px] text-brand-700 mt-0.5 font-medium">Ready to assign technician</p>
        </Card>

        <Card
          className={cn(
            'p-3.5 cursor-pointer transition-all border hover:shadow-sm',
            statusFilter === 'IN_PROGRESS' ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500' : 'hover:border-surface-300'
          )}
          onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
        >
          <div className="flex items-center justify-between text-caption text-surface-500">
            <span className="font-medium">3. In-Progress</span>
            <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-title font-bold text-surface-900 mt-1">{stats.inProgress}</p>
          <p className="text-[11px] text-blue-700 mt-0.5 font-medium">Active technician triage</p>
        </Card>

        <Card
          className={cn(
            'p-3.5 cursor-pointer transition-all border hover:shadow-sm',
            statusFilter === 'ON_HOLD' ? 'border-warning-500 bg-warning-50/40 ring-1 ring-warning-500' : 'hover:border-surface-300'
          )}
          onClick={() => setStatusFilter(statusFilter === 'ON_HOLD' ? 'ALL' : 'ON_HOLD')}
        >
          <div className="flex items-center justify-between text-caption text-surface-500">
            <span className="font-medium">3. On-Hold</span>
            <div className="h-7 w-7 rounded-md bg-warning-50 text-warning-600 flex items-center justify-center">
              <PauseCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-title font-bold text-surface-900 mt-1">{stats.onHold}</p>
          <p className="text-[11px] text-warning-700 mt-0.5 font-medium">Awaiting spare parts / vendor</p>
        </Card>

        <Card
          className={cn(
            'p-3.5 cursor-pointer transition-all border hover:shadow-sm',
            statusFilter === 'DONE' ? 'border-success-500 bg-success-50/40 ring-1 ring-success-500' : 'hover:border-surface-300'
          )}
          onClick={() => setStatusFilter(statusFilter === 'DONE' ? 'ALL' : 'DONE')}
        >
          <div className="flex items-center justify-between text-caption text-surface-500">
            <span className="font-medium">4. Resolved</span>
            <div className="h-7 w-7 rounded-md bg-success-50 text-success-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-title font-bold text-surface-900 mt-1">{stats.done}</p>
          <p className="text-[11px] text-success-700 mt-0.5 font-medium">Closed & verified</p>
        </Card>
      </div>

      {/* 3. AI Natural Language Search (Identical Pattern to Asset Management) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Sparkles className="h-4 w-4 text-brand-500" />
            </div>
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAISearch(); }}
              placeholder="Ask AI: e.g. 'Show critical hardware repairs pending dispatch' or 'Find requests in Engineering'"
              className="w-full rounded-xl border border-brand-200 bg-brand-50/30 pl-10 pr-4 py-2.5 text-body text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
            />
          </div>
          <Button
            size="sm"
            leftIcon={<Send className="h-4 w-4" />}
            onClick={handleAISearch}
            disabled={!aiQuery.trim()}
          >
            Ask AI
          </Button>
        </div>

        {aiInterpretation && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-50 border border-brand-100 animate-fade-in-up">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-caption font-medium text-brand-700 mb-1">AI interpreted:</p>
              <div className="flex flex-wrap gap-1.5">
                {aiInterpretation.filters.length === 0 ? (
                  <span className="text-caption text-surface-500">No specific filters detected — showing all tickets.</span>
                ) : (
                  aiInterpretation.filters.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-caption bg-white border border-brand-200 text-brand-700 px-2 py-0.5 rounded-md font-medium">
                      {f.label} = {f.value}
                    </span>
                  ))
                )}
              </div>
              <p className="text-caption text-surface-600 mt-1.5">
                Found <span className="font-bold text-surface-900">{aiInterpretation.count}</span> matching IT requisition tickets
              </p>
            </div>
            <button onClick={clearAISearch} className="text-surface-400 hover:text-surface-600 transition-colors shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Collapsible Filters Panel */}
      {showFilters && (
        <div className="card-base p-4 animate-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Workflow Stage / Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'PENDING_DEPT_APPROVAL', label: '1. Pending Dept Approval' },
                { value: 'PENDING_IT_DISPATCH', label: '2. Pending IT Dispatch' },
                { value: 'PLANNING', label: '3. Planning' },
                { value: 'IN_PROGRESS', label: '3. In-Progress' },
                { value: 'ON_HOLD', label: '3. On-Hold' },
                { value: 'DONE', label: '4. Resolved & Closed' },
              ]}
            />

            <Select
              label="Priority & SLA"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Priorities' },
                { value: 'Critical', label: 'Critical (2 Hours SLA)' },
                { value: 'High', label: 'High (8 Hours SLA)' },
                { value: 'Medium', label: 'Medium (24 Hours SLA)' },
                { value: 'Low', label: 'Low (48 Hours SLA)' },
              ]}
            />

            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Categories' },
                ...categoryOptions.map(c => ({ value: c.value, label: `${c.icon} ${c.label}` })),
              ]}
            />

            <Select
              label="Requester Department"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Departments' },
                ...departments.map(d => ({ value: d, label: d })),
              ]}
            />
          </div>
        </div>
      )}

      {/* 5. Main Content: DataTable View or Kanban Board View */}
      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={filteredTickets}
          searchable
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by ticket code, asset name, serial, or requester..."
          rowActions={rowActions}
          onRowClick={(row) => {
            onNavigate('ticket-detail', row.ticketCode);
          }}
          toolbar={
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="h-4 w-4" />}
              onClick={() => setShowFilters((s) => !s)}
            >
              Filters
            </Button>
          }
          emptyTitle="No IT requisition tickets found"
          emptyDescription="Try adjusting your search query, perspective, or filters."
          emptyAction={
            <Button
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setFormAssetMode('my');
                setFormSelectedAssetCode(myAssignedAssets[0]?.code || 'AST-0001');
                setIsNewTicketModalOpen(true);
              }}
            >
              New IT Requisition
            </Button>
          }
        />
      ) : (
        /* Kanban Board View */
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
                  onSelect={() => {
                    onNavigate('ticket-detail', ticket.ticketCode);
                  }}
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
                  No tickets awaiting approval
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Stage 2 - IT Dispatch */}
          <div className="bg-surface-50 rounded-xl p-3 border border-surface-200 flex flex-col gap-3 min-h-[500px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                <h3 className="text-body font-semibold text-surface-900">2. IT Dispatch</h3>
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
                  onSelect={() => {
                    onNavigate('ticket-detail', ticket.ticketCode);
                  }}
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
                  No tickets pending dispatch
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Stage 3 - Technician Execution & Hold */}
          <div className="bg-surface-50 rounded-xl p-3 border border-surface-200 flex flex-col gap-3 min-h-[500px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <h3 className="text-body font-semibold text-surface-900">3. Active Triage / Hold</h3>
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
                  onSelect={() => {
                    onNavigate('ticket-detail', ticket.ticketCode);
                  }}
                  onAction={() => {
                    setSelectedTicket(ticket);
                    setIsStatusUpdateModalOpen(true);
                  }}
                  actionLabel={ticket.status === 'ON_HOLD' ? '⚠️ On-Hold: Update' : 'Update Status'}
                  actionVariant={ticket.status === 'ON_HOLD' ? 'outline' : 'primary'}
                />
              ))}

              {filteredTickets.filter(t => ['PLANNING', 'IN_PROGRESS', 'ON_HOLD'].includes(t.status)).length === 0 && (
                <div className="p-8 text-center text-caption text-surface-400 border border-dashed border-surface-200 rounded-lg bg-white/50">
                  No tickets in triage
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Stage 4 - Resolved & Closed */}
          <div className="bg-surface-50 rounded-xl p-3 border border-surface-200 flex flex-col gap-3 min-h-[500px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success-500" />
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
                  onSelect={() => {
                    onNavigate('ticket-detail', ticket.ticketCode);
                  }}
                  onAction={() => {
                    onNavigate('ticket-detail', ticket.ticketCode);
                  }}
                  actionLabel="View Details"
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
      )}

      {/* ========================================================================= */}
      {/* 6. Slide-Over Detail Drawer (Aligned with Asset Management Detail UX)      */}
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
                      <p className="text-caption font-bold text-surface-900">2. Department Head Sign-off</p>
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
                      <p className="text-[11px] text-surface-500 italic mt-0.5 bg-surface-50 p-1.5 rounded border border-surface-200">
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
                      <p className="text-[11px] text-surface-400 italic">Waiting for IT Lead assignment</p>
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
            <div className="border border-surface-200 rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-caption font-bold text-surface-800">Affected Asset Profile</span>
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
                <div className="p-2.5 rounded-lg bg-surface-100 shrink-0">
                  {getAssetIcon(selectedTicket.asset.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-body font-bold text-surface-900">{selectedTicket.asset.name}</h4>
                    <Badge variant="brand">Active Device</Badge>
                  </div>
                  <p className="text-caption text-surface-500 font-mono mt-0.5">
                    Code: {selectedTicket.asset.code} · S/N: {selectedTicket.asset.serialNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Execution Telemetry (If Available) */}
            {selectedTicket.itExecution.downtimeHours && (
              <div className="p-3 bg-surface-50 rounded-xl border border-surface-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-surface-500 block">Asset Downtime:</span>
                  <p className="text-title font-bold text-surface-900 mt-0.5">{selectedTicket.itExecution.downtimeHours} Hours</p>
                </div>
                <Badge variant="neutral">SLA Compliant</Badge>
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

      {/* ========================================================================= */}
      {/* 7. Modal: New IT Requisition Form                                         */}
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-caption font-medium text-surface-700 mb-1.5">
                Requisition Category (หมวดหมู่คำขอ) <span className="text-error-500">*</span>
              </label>
              <select
                className="input-base text-caption w-full"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as TicketCategory)}
              >
                {categoryOptions.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-caption font-medium text-surface-700 mb-1.5">
                Urgency & SLA Level (ระดับความเร่งด่วน) <span className="text-error-500">*</span>
              </label>
              <select
                className="input-base text-caption w-full"
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as PriorityLevel)}
              >
                <option value="Critical">🚨 Critical (2 Hours SLA - Work Stoppage)</option>
                <option value="High">⚠️ High (8 Hours SLA - Major Impact)</option>
                <option value="Medium">⚡ Medium (24 Hours SLA - Routine Servicing)</option>
                <option value="Low">🌱 Low (48 Hours SLA - Non-urgent Inquiry)</option>
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

          {/* Automated Approval Routing Chain Banner */}
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
      {/* 8. Modal: Department Head Approval Modal                                 */}
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
                placeholder={approvalAction === 'Approve' ? 'e.g. Approved under urgent project deadline. Please expedite with Apple Care.' : 'Specify reason for rejection...'}
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
      {/* 9. Modal: IT Manager Dispatch & Technician Assignment Modal              */}
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
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-1 border rounded-lg border-surface-200">
                {technicians.map(tech => (
                  <div
                    key={tech.id}
                    onClick={() => setDispatchTechId(tech.id)}
                    className={cn(
                      'p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between',
                      dispatchTechId === tech.id
                        ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                        : 'border-surface-200 bg-white hover:border-surface-300'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={cn('h-7 w-7 rounded-full flex items-center justify-center text-white text-caption font-bold', tech.avatarColor)}>
                        {tech.name.split(' ').map(n => n[0]).join('')}
                      </span>
                      <div>
                        <p className="text-caption font-bold text-surface-900">{tech.name}</p>
                        <p className="text-[11px] text-surface-500">{tech.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                        tech.activeTicketsCount >= 4 ? 'bg-error-100 text-error-800' : 'bg-emerald-100 text-emerald-800'
                      )}>
                        {tech.activeTicketsCount} active tasks
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Date */}
            <div>
              <Input
                label="Target Resolution Date"
                type="date"
                value={dispatchTargetDate}
                onChange={(e) => setDispatchTargetDate(e.target.value)}
              />
            </div>

            {/* Dispatch Instructions */}
            <div>
              <Textarea
                label="Dispatch Notes / Instructions for Tech"
                placeholder="e.g. Check battery cycle count and backup data to NAS before formatting..."
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
            onClick={handleDispatchAssign}
          >
            Dispatch to Technician
          </Button>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 10. Modal: IT Technician Status Update (In-Progress / Hold / Done)        */}
      {/* ========================================================================= */}
      <Modal
        open={isStatusUpdateModalOpen && !!selectedTicket}
        onClose={() => setIsStatusUpdateModalOpen(false)}
        title="Technician Service Update / บันทึกผลการซ่อมและสถานะ"
        description={`Logging progress and resolution for ${selectedTicket?.ticketCode}`}
        size="md"
      >
        {selectedTicket && (
          <div className="flex flex-col gap-4 py-2">
            {/* Status Selector */}
            <div>
              <label className="block text-caption font-medium text-surface-700 mb-1.5">
                Current Execution Status (สถานะการดำเนินการ)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setUpdateTargetStatus('In-Progress')}
                  className={cn(
                    'py-2 px-2 rounded-lg border text-caption font-bold text-center transition-all flex flex-col items-center gap-1',
                    updateTargetStatus === 'In-Progress'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                      : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                  )}
                >
                  <Clock className="h-4 w-4 text-blue-600" />
                  In-Progress
                </button>

                <button
                  type="button"
                  onClick={() => setUpdateTargetStatus('On-Hold')}
                  className={cn(
                    'py-2 px-2 rounded-lg border text-caption font-bold text-center transition-all flex flex-col items-center gap-1',
                    updateTargetStatus === 'On-Hold'
                      ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500'
                      : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                  )}
                >
                  <PauseCircle className="h-4 w-4 text-amber-600" />
                  On-Hold (รออะไหล่)
                </button>

                <button
                  type="button"
                  onClick={() => setUpdateTargetStatus('Done')}
                  className={cn(
                    'py-2 px-2 rounded-lg border text-caption font-bold text-center transition-all flex flex-col items-center gap-1',
                    updateTargetStatus === 'Done'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                      : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                  )}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Resolved & Done
                </button>
              </div>
            </div>

            {/* If On-Hold: Hold Reason Category & Notes */}
            {updateTargetStatus === 'On-Hold' && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-3">
                <div>
                  <label className="block text-caption font-semibold text-amber-900 mb-1">
                    Hold Reason Category (สาเหตุการพักงาน)
                  </label>
                  <select
                    className="input-base text-caption w-full bg-white"
                    value={updateHoldCategory}
                    onChange={(e) => setUpdateHoldCategory(e.target.value as any)}
                  >
                    <option value="Waiting for Spare Parts">📦 Waiting for Spare Parts (รอจัดซื้อ/ส่งอะไหล่)</option>
                    <option value="Awaiting User Response">💬 Awaiting User Response (รอผู้ใช้งานยืนยันรหัสผ่าน/สำรองข้อมูล)</option>
                    <option value="Vendor Escalation">🏢 Vendor Escalation (ส่งศูนย์บริการภายนอก เช่น Apple / Dell)</option>
                    <option value="Scheduled Maintenance Window">⏰ Scheduled Maintenance Window (รอนอกเวลาทำการ)</option>
                  </select>
                </div>

                <div>
                  <Textarea
                    label="Specific Hold Details (บันทึกรายละเอียด)"
                    placeholder="e.g. Battery replacement part PO-8921 ordered from vendor; expected arrival Friday."
                    rows={2}
                    value={updateHoldReason}
                    onChange={(e) => setUpdateHoldReason(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* If Done: Resolution Summary & Downtime */}
            {updateTargetStatus === 'Done' && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-3">
                <div>
                  <Textarea
                    label="Resolution Summary & Root Cause (สรุปผลการแก้ไขปัญหา)"
                    placeholder="e.g. Replaced swollen battery pack, reapplied thermal paste, cleaned cooling fan, updated EFI firmware."
                    rows={2}
                    value={updateResolutionNotes}
                    onChange={(e) => setUpdateResolutionNotes(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Asset Downtime (Hours)"
                    type="number"
                    step="0.5"
                    value={updateDowntimeHours}
                    onChange={(e) => setUpdateDowntimeHours(e.target.value)}
                    leftIcon={<Clock className="h-4 w-4 text-surface-400" />}
                  />
                </div>

                <div>
                  <Input
                    label="Spare Parts Used (อะไหล่ที่เปลี่ยน)"
                    placeholder="e.g. Battery A2171, Thermal Paste, Screws"
                    value={updatePartsUsed}
                    onChange={(e) => setUpdatePartsUsed(e.target.value)}
                  />
                </div>
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
            leftIcon={<Check className="h-4 w-4" />}
            onClick={handleTechnicianStatusUpdate}
          >
            Save Status Update
          </Button>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 11. Modal: Delegated Approvers Governance Settings                        */}
      {/* ========================================================================= */}
      <Modal
        open={isDelegationModalOpen}
        onClose={() => setIsDelegationModalOpen(false)}
        title="Delegated Approvers Management (การตั้งค่าผู้รักษาการแทน)"
        description="Configure proxy sign-off authorities when department heads or leads are on leave or travel."
        size="lg"
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="bg-brand-50 p-3.5 rounded-lg border border-brand-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-caption font-bold text-brand-900">Governance & SOX Audit Compliance</p>
                <p className="text-[11px] text-brand-700">
                  Every sign-off records both the Acting Approver and Primary Authority with cryptographic timestamp audit.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-surface-200 border rounded-lg border-surface-200">
            {delegationSettings.map((rule, idx) => (
              <div key={rule.department + idx} className="p-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-surface-900 text-caption">{rule.primaryApprover.name}</span>
                    <span className="text-surface-400">➔</span>
                    <span className="font-bold text-brand-700 text-caption">{rule.delegatedApprover.name}</span>
                    <Badge variant={rule.isActive ? 'success' : 'neutral'}>
                      {rule.isActive ? 'Active Delegation' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-surface-500 mt-1">
                    Department: {rule.department} · {rule.startDate} to {rule.endDate}
                  </p>
                  <p className="text-[11px] text-surface-600 italic mt-0.5">
                    Reason: "{rule.reason}"
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={rule.isActive ? 'outline' : 'primary'}
                    onClick={() => {
                      const updated = delegationSettings.map((r, i) => i === idx ? { ...r, isActive: !r.isActive } : r);
                      setDelegationSettings(updated);
                      push({
                        variant: 'info',
                        title: 'Delegation Rule Toggled',
                        message: `${rule.primaryApprover.name} ➔ ${rule.delegatedApprover.name} is now ${!rule.isActive ? 'Active' : 'Disabled'}`
                      });
                    }}
                  >
                    {rule.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-3 border-t border-surface-200">
          <Button variant="outline" onClick={() => setIsDelegationModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// Sub-component: Card for Kanban Board View
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
      className="bg-white rounded-xl p-3.5 border border-surface-200 shadow-xs hover:shadow-md hover:border-brand-300 transition-all cursor-pointer flex flex-col gap-2.5"
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

      <div className="bg-surface-50 p-2 rounded-lg border border-surface-100 flex items-center justify-between text-[11px]">
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

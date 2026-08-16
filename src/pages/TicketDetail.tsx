import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Wrench,
  Printer,
  FileText,
  MessageSquare,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  MapPin,
  ExternalLink,
  RotateCcw,
  User,
  Users,
  Building,
  Calendar,
  Clock,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Printer as PrinterIcon,
  Server,
  Router,
  Tag,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Send,
  Edit,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Check,
  X,
  Layers,
  ArrowRightLeft,
  HelpCircle,
  Info
} from 'lucide-react';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  StatusBadge,
  Avatar,
  Tabs,
  EmptyState,
  Progress,
  useToast,
  SectionCard,
  Modal,
  Input,
  Select,
  Textarea
} from '@/components/ui';
import { assets, employees, departments, type Asset, type Employee } from '@/data/mockData';
import {
  initialRequisitions,
  initialTechnicians,
  initialDelegationSettings,
  type ITRequisitionTicket,
  type RequisitionStatus,
  type TicketCategory,
  type PriorityLevel,
  type ITTechnician
} from '@/data/requisitionData';
import { cn } from '@/lib/cn';

interface TicketDetailProps {
  ticketCode: string;
  onNavigate: (id: string, aid?: string) => void;
}

const priorityConfig: Record<PriorityLevel, { variant: 'error' | 'warning' | 'accent' | 'default'; sla: string; color: string; hours: number }> = {
  Critical: { variant: 'error', sla: '2 Hours SLA', color: 'text-error-600 bg-error-50 border-error-200', hours: 2 },
  High: { variant: 'warning', sla: '8 Hours SLA', color: 'text-amber-700 bg-amber-50 border-amber-200', hours: 8 },
  Medium: { variant: 'accent', sla: '24 Hours SLA', color: 'text-brand-700 bg-brand-50 border-brand-200', hours: 24 },
  Low: { variant: 'default', sla: '48 Hours SLA', color: 'text-surface-600 bg-surface-100 border-surface-200', hours: 48 },
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

export function TicketDetail({ ticketCode, onNavigate }: TicketDetailProps) {
  const { push } = useToast();
  const [tab, setTab] = useState('overview');

  // Load ticket state from mock requisitions or fallback to first
  const [allTickets, setAllTickets] = useState<ITRequisitionTicket[]>(initialRequisitions);
  
  // Find current ticket
  const ticket = useMemo(() => {
    return allTickets.find((t) => t.ticketCode === ticketCode || t.id === ticketCode) ?? allTickets[0];
  }, [allTickets, ticketCode]);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false);
  const [isChangeAssetModalOpen, setIsChangeAssetModalOpen] = useState(false);
  const [isChangeRequesterModalOpen, setIsChangeRequesterModalOpen] = useState(false);

  // Edit ticket form state
  const [editTitle, setEditTitle] = useState(ticket.title);
  const [editCategory, setEditCategory] = useState<TicketCategory>(ticket.category);
  const [editPriority, setEditPriority] = useState<PriorityLevel>(ticket.priority);
  const [editDescription, setEditDescription] = useState(ticket.description);
  const [editLocation, setEditLocation] = useState(ticket.location);

  // Department Approval form state
  const [approvalDecision, setApprovalDecision] = useState<'Approve' | 'Reject'>('Approve');
  const [approvalApproverName, setApprovalApproverName] = useState(ticket.departmentApproval.approverName);
  const [approvalIsDelegated, setApprovalIsDelegated] = useState(ticket.departmentApproval.isDelegated);
  const [approvalComments, setApprovalComments] = useState('');

  // Dispatch technician form state
  const [selectedTechId, setSelectedTechId] = useState(ticket.itAssignment.technicianId || initialTechnicians[0].id);
  const [estimatedCost, setEstimatedCost] = useState(ticket.itAssignment.estimatedCost?.toString() || '250');
  const [supportGroup, setSupportGroup] = useState('Hardware & Device Support');

  // Status update form state
  const [updateTargetStatus, setUpdateTargetStatus] = useState<'Planning' | 'In-Progress' | 'On-Hold' | 'Done'>('In-Progress');
  const [updateHoldCategory, setUpdateHoldCategory] = useState<'Waiting for Spare Parts' | 'Awaiting User Response' | 'Vendor Escalation' | 'Scheduled Maintenance Window'>('Waiting for Spare Parts');
  const [updateHoldReason, setUpdateHoldReason] = useState('');
  const [updateDiagnosticNotes, setUpdateDiagnosticNotes] = useState(ticket.itExecution.diagnosticNotes || '');
  const [updateResolutionNotes, setUpdateResolutionNotes] = useState(ticket.itExecution.resolutionNotes || '');
  const [updateActualCost, setUpdateActualCost] = useState(ticket.itExecution.actualCost?.toString() || '120');
  const [updateDowntimeHours, setUpdateDowntimeHours] = useState(ticket.itExecution.downtimeHours?.toString() || '4.5');
  const [updatePartsUsed, setUpdatePartsUsed] = useState(ticket.itExecution.partsUsed?.join(', ') || 'Display Flex Cable, Thermal Paste');

  // Asset search & selection modal state
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [assetSelectionTab, setAssetSelectionTab] = useState<'my' | 'all'>('my');
  const [tempSelectedAsset, setTempSelectedAsset] = useState<Asset | null>(
    assets.find(a => a.code === ticket.asset.code) || assets[0]
  );

  // Requester selection modal state
  const [requesterSearchQuery, setRequesterSearchQuery] = useState('');

  // Comments local state
  const [commentsList, setCommentsList] = useState([
    {
      id: 'c1',
      author: ticket.requester.name,
      role: 'Requester',
      department: ticket.requester.department,
      timestamp: ticket.createdAt,
      text: ticket.description,
      initials: ticket.requester.initials,
      avatarColor: ticket.requester.avatarColor,
    },
    {
      id: 'c2',
      author: 'David Chen',
      role: 'Acting Lead Engineer',
      department: 'Engineering',
      timestamp: ticket.departmentApproval.approvedAt || '2026-08-15 10:15 AM',
      text: ticket.departmentApproval.comments || 'Approved under urgent engineering priority. Please expedite diagnostic with Apple Authorised Center.',
      initials: 'DC',
      avatarColor: 'bg-emerald-600',
    },
    ...(ticket.itAssignment.technicianName ? [{
      id: 'c3',
      author: ticket.itAssignment.technicianName,
      role: ticket.itAssignment.technicianRole || 'Assigned Technician',
      department: 'IT Operations',
      timestamp: '2026-08-15 01:30 PM',
      text: ticket.itExecution.diagnosticNotes || 'Assigned and diagnosed device in Lab 2. Diagnostics running with thermal paste reapplication.',
      initials: 'AR',
      avatarColor: 'bg-brand-600',
    }] : [])
  ]);
  const [newCommentText, setNewCommentText] = useState('');

  // Find requester's assigned assets
  const requesterAssignedAssets = useMemo(() => {
    return assets.filter(a => a.assignedTo === ticket.requester.name);
  }, [ticket.requester.name]);

  // Filter all assets for search
  const filteredAllAssets = useMemo(() => {
    if (!assetSearchQuery.trim()) return assets;
    const q = assetSearchQuery.toLowerCase();
    return assets.filter(a =>
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.serialNumber.toLowerCase().includes(q) ||
      (a.assignedTo && a.assignedTo.toLowerCase().includes(q)) ||
      a.department.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q)
    );
  }, [assetSearchQuery]);

  // Filter employees for change requester
  const filteredEmployees = useMemo(() => {
    if (!requesterSearchQuery.trim()) return employees;
    const q = requesterSearchQuery.toLowerCase();
    return employees.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.jobTitle.toLowerCase().includes(q)
    );
  }, [requesterSearchQuery]);

  // Asset Icon Helper
  const getAssetIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'laptop': return <Laptop className="h-5 w-5 text-brand-600" />;
      case 'monitor': return <Monitor className="h-5 w-5 text-blue-600" />;
      case 'smartphone': return <Smartphone className="h-5 w-5 text-purple-600" />;
      case 'tablet': return <Tablet className="h-5 w-5 text-indigo-600" />;
      case 'server': return <Server className="h-5 w-5 text-emerald-600" />;
      case 'router':
      case 'switch':
      case 'router / switch': return <Router className="h-5 w-5 text-amber-600" />;
      case 'printer': return <PrinterIcon className="h-5 w-5 text-surface-600" />;
      default: return <Wrench className="h-5 w-5 text-brand-600" />;
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: RequisitionStatus) => {
    switch (status) {
      case 'PENDING_DEPT_APPROVAL':
        return <Badge variant="warning" dot>1. Pending Dept Approval</Badge>;
      case 'PENDING_IT_DISPATCH':
        return <Badge variant="brand" dot>2. Pending IT Dispatch</Badge>;
      case 'PLANNING':
        return <Badge variant="accent" dot>3. Planning</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning" dot>3. In-Progress</Badge>;
      case 'ON_HOLD':
        return <Badge variant="error" dot>3. On-Hold</Badge>;
      case 'DONE':
        return <Badge variant="success" dot>4. Resolved & Closed</Badge>;
      case 'REJECTED_BY_DEPT':
        return <Badge variant="error" dot>Rejected by Dept</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  // Update current ticket in collection helper
  const updateTicketData = (updatedTicket: ITRequisitionTicket) => {
    setAllTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  // 1. Action: Save Edit Ticket
  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      push({ variant: 'warning', title: 'Subject Required', message: 'Please enter a ticket subject title.' });
      return;
    }
    const updated: ITRequisitionTicket = {
      ...ticket,
      title: editTitle,
      category: editCategory,
      priority: editPriority,
      slaTargetHours: priorityConfig[editPriority].hours,
      description: editDescription,
      location: editLocation,
      timeline: [
        ...ticket.timeline,
        {
          id: `tl-${Date.now()}`,
          stage: 'Creation',
          actorName: 'Sarah Chen',
          actorRole: 'Requester / Editor',
          timestamp: 'Just now',
          action: 'Updated Ticket Details & Scope',
          notes: `Category: ${editCategory} · Priority: ${editPriority}`
        }
      ]
    };
    updateTicketData(updated);
    setIsEditModalOpen(false);
    push({ variant: 'success', title: 'Ticket Updated', message: `${ticket.ticketCode} has been saved.` });
  };

  // 2. Action: Department Approval
  const handleDepartmentApproval = () => {
    const isApproved = approvalDecision === 'Approve';
    const nextStatus: RequisitionStatus = isApproved ? 'PENDING_IT_DISPATCH' : 'REJECTED_BY_DEPT';

    const updated: ITRequisitionTicket = {
      ...ticket,
      status: nextStatus,
      departmentApproval: {
        ...ticket.departmentApproval,
        status: isApproved ? 'Approved' : 'Rejected',
        approverName: approvalApproverName,
        isDelegated: approvalIsDelegated,
        delegatedBy: approvalIsDelegated ? 'David Chen (Acting Lead on behalf of Sarah Jenkins)' : undefined,
        approvedAt: 'Just now',
        comments: approvalComments || (isApproved ? 'Approved under operational necessity.' : 'Declined.')
      },
      timeline: [
        ...ticket.timeline,
        {
          id: `tl-${Date.now()}`,
          stage: 'Dept Approval',
          actorName: approvalApproverName,
          actorRole: approvalIsDelegated ? 'Delegated Acting Approver' : 'Department Head',
          timestamp: 'Just now',
          action: isApproved ? 'Department Head Sign-off Approved' : 'Department Head Sign-off Rejected',
          notes: approvalComments || (isApproved ? 'Approved request for IT technician dispatch.' : 'Request rejected by department head.'),
          badge: approvalIsDelegated ? 'Delegated Authority' : undefined
        }
      ]
    };

    updateTicketData(updated);
    setIsApproveModalOpen(false);
    push({
      variant: isApproved ? 'success' : 'warning',
      title: isApproved ? 'Approved by Department' : 'Requisition Rejected',
      message: `${ticket.ticketCode} has been ${isApproved ? 'routed to IT Dispatch Desk' : 'rejected'}.`
    });
  };

  // 3. Action: Assign Technician
  const handleAssignTechnician = () => {
    const tech = initialTechnicians.find(t => t.id === selectedTechId) || initialTechnicians[0];
    const updated: ITRequisitionTicket = {
      ...ticket,
      status: 'IN_PROGRESS',
      itAssignment: {
        assignedBy: 'Michael Chang (IT Operations Lead)',
        assignedAt: 'Just now',
        technicianId: tech.id,
        technicianName: tech.name,
        technicianRole: tech.role,
        technicianAvatar: tech.avatarColor,
        estimatedCost: Number(estimatedCost) || 250,
        targetResolutionDate: 'Tomorrow'
      },
      itExecution: {
        ...ticket.itExecution,
        currentStatus: 'In-Progress'
      },
      timeline: [
        ...ticket.timeline,
        {
          id: `tl-${Date.now()}`,
          stage: 'IT Assignment',
          actorName: 'Michael Chang',
          actorRole: 'IT Operations Lead',
          timestamp: 'Just now',
          action: `Assigned to ${tech.name} (${tech.role})`,
          notes: `Support Group: ${supportGroup} · Est Cost: $${estimatedCost}`
        }
      ]
    };

    updateTicketData(updated);
    setIsDispatchModalOpen(false);
    push({
      variant: 'success',
      title: 'Technician Assigned',
      message: `${tech.name} is now working on ${ticket.ticketCode}.`
    });
  };

  // 4. Action: Technician Status Update (In-Progress, Hold, Done)
  const handleTechnicianStatusUpdate = () => {
    let nextStatus: RequisitionStatus = 'IN_PROGRESS';
    if (updateTargetStatus === 'Planning') nextStatus = 'PLANNING';
    if (updateTargetStatus === 'In-Progress') nextStatus = 'IN_PROGRESS';
    if (updateTargetStatus === 'On-Hold') nextStatus = 'ON_HOLD';
    if (updateTargetStatus === 'Done') nextStatus = 'DONE';

    const updated: ITRequisitionTicket = {
      ...ticket,
      status: nextStatus,
      itExecution: {
        ...ticket.itExecution,
        currentStatus: updateTargetStatus,
        holdCategory: nextStatus === 'ON_HOLD' ? updateHoldCategory : ticket.itExecution.holdCategory,
        holdReason: nextStatus === 'ON_HOLD' ? updateHoldReason : ticket.itExecution.holdReason,
        diagnosticNotes: updateDiagnosticNotes || ticket.itExecution.diagnosticNotes,
        resolutionNotes: nextStatus === 'DONE' ? (updateResolutionNotes || 'Issue diagnosed and repaired successfully. Verified full hardware functionality.') : ticket.itExecution.resolutionNotes,
        actualCost: nextStatus === 'DONE' ? Number(updateActualCost) : ticket.itExecution.actualCost,
        downtimeHours: nextStatus === 'DONE' ? Number(updateDowntimeHours) : ticket.itExecution.downtimeHours,
        partsUsed: nextStatus === 'DONE' ? updatePartsUsed.split(',').map(s => s.trim()) : ticket.itExecution.partsUsed,
        completedAt: nextStatus === 'DONE' ? 'Just now' : ticket.itExecution.completedAt,
      },
      timeline: [
        ...ticket.timeline,
        {
          id: `tl-${Date.now()}`,
          stage: nextStatus === 'DONE' ? 'Resolution' : nextStatus === 'ON_HOLD' ? 'On-Hold' : 'In-Progress',
          actorName: ticket.itAssignment.technicianName || 'Alex Rivera',
          actorRole: ticket.itAssignment.technicianRole || 'Assigned Technician',
          timestamp: 'Just now',
          action: `Status updated to ${updateTargetStatus}`,
          notes: nextStatus === 'ON_HOLD' ? `Hold: ${updateHoldCategory} - ${updateHoldReason}` : nextStatus === 'DONE' ? updateResolutionNotes : updateDiagnosticNotes
        }
      ]
    };

    updateTicketData(updated);
    setIsStatusUpdateModalOpen(false);
    push({
      variant: 'success',
      title: `Status Updated: ${updateTargetStatus}`,
      message: `Work log recorded for ${ticket.ticketCode}.`
    });
  };

  // 5. Action: Change Affected Asset
  const handleChangeAsset = (newAsset: Asset) => {
    const isMine = newAsset.assignedTo === ticket.requester.name;
    const updated: ITRequisitionTicket = {
      ...ticket,
      asset: {
        id: newAsset.id,
        code: newAsset.code,
        name: newAsset.name,
        type: newAsset.type,
        serialNumber: newAsset.serialNumber || 'SN-UNKNOWN',
        location: newAsset.location || ticket.location,
        isMyAssignedAsset: isMine,
        purchaseCost: newAsset.purchaseCost,
        currentValue: newAsset.currentValue
      },
      timeline: [
        ...ticket.timeline,
        {
          id: `tl-${Date.now()}`,
          stage: 'Creation',
          actorName: ticket.requester.name,
          actorRole: 'Requester',
          timestamp: 'Just now',
          action: `Affected Asset changed to ${newAsset.name} (${newAsset.code})`,
          notes: isMine ? 'Selected from requester assigned devices.' : `Selected from shared asset ledger (Owner: ${newAsset.assignedTo || 'Unassigned'}).`
        }
      ]
    };

    updateTicketData(updated);
    setIsChangeAssetModalOpen(false);
    push({
      variant: 'info',
      title: 'Affected Asset Updated',
      message: `Linked ${newAsset.code} (${newAsset.name}) to this ticket.`
    });
  };

  // 6. Action: Change Requester
  const handleChangeRequester = (emp: Employee) => {
    const updated: ITRequisitionTicket = {
      ...ticket,
      requester: {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        jobTitle: emp.jobTitle || emp.title,
        department: emp.department,
        initials: emp.initials,
        avatarColor: emp.avatarColor
      },
      location: emp.location || ticket.location,
      timeline: [
        ...ticket.timeline,
        {
          id: `tl-${Date.now()}`,
          stage: 'Creation',
          actorName: 'Administrator',
          actorRole: 'System Admin',
          timestamp: 'Just now',
          action: `Requester re-assigned to ${emp.name} (${emp.department})`,
          notes: `Email: ${emp.email} · Location: ${emp.location}`
        }
      ]
    };

    updateTicketData(updated);
    setIsChangeRequesterModalOpen(false);
    push({
      variant: 'info',
      title: 'Requester Updated',
      message: `Ticket requester set to ${emp.name}.`
    });
  };

  // 7. Action: Add Comment
  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const newComment = {
      id: `c-${Date.now()}`,
      author: 'Sarah Chen',
      role: 'Requester',
      department: 'Engineering',
      timestamp: 'Just now',
      text: newCommentText.trim(),
      initials: 'SC',
      avatarColor: 'bg-brand-600'
    };
    setCommentsList([...commentsList, newComment]);
    setNewCommentText('');
    push({ variant: 'success', title: 'Comment Added', message: 'Your message has been posted to the ticket.' });
  };

  // Tabs definition matching AssetDetail design
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Wrench className="h-4 w-4" /> },
    { id: 'details', label: 'Request Details', icon: <FileText className="h-4 w-4" /> },
    { id: 'asset', label: 'Affected Asset', icon: <Laptop className="h-4 w-4" /> },
    { id: 'approval', label: 'Approval & Governance', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'assignment', label: 'Assignment & Work Order', icon: <Users className="h-4 w-4" /> },
    { id: 'audit', label: 'Audit Trail', icon: <ClipboardList className="h-4 w-4" />, count: ticket.timeline.length },
    { id: 'comments', label: 'Comments', icon: <MessageSquare className="h-4 w-4" />, count: commentsList.length },
  ];

  // Quick action buttons in header
  const quickActions = [
    {
      label: 'Edit Ticket',
      icon: Edit,
      onClick: () => {
        setEditTitle(ticket.title);
        setEditCategory(ticket.category);
        setEditPriority(ticket.priority);
        setEditDescription(ticket.description);
        setEditLocation(ticket.location);
        setIsEditModalOpen(true);
      }
    },
    ...(ticket.status === 'PENDING_DEPT_APPROVAL' ? [{
      label: 'Dept Sign-off',
      icon: ShieldCheck,
      onClick: () => setIsApproveModalOpen(true)
    }] : []),
    ...(ticket.status === 'PENDING_IT_DISPATCH' ? [{
      label: 'Assign Tech',
      icon: Users,
      onClick: () => setIsDispatchModalOpen(true)
    }] : []),
    ...(['PLANNING', 'IN_PROGRESS', 'ON_HOLD'].includes(ticket.status) ? [{
      label: 'Update Status',
      icon: RotateCcw,
      onClick: () => {
        setUpdateTargetStatus(ticket.itExecution.currentStatus === 'On-Hold' ? 'On-Hold' : 'In-Progress');
        setIsStatusUpdateModalOpen(true);
      }
    }] : []),
    {
      label: 'Change Asset',
      icon: ArrowRightLeft,
      onClick: () => {
        setAssetSelectionTab('my');
        setIsChangeAssetModalOpen(true);
      }
    },
    {
      label: 'Print Work Order',
      icon: Printer,
      onClick: () => {
        push({
          variant: 'info',
          title: 'Work Order Printed',
          message: `Sent work order document for ${ticket.ticketCode} to network printer.`
        });
      }
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Breadcrumb navigation */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={() => onNavigate('maintenance')}
          className="inline-flex items-center gap-1.5 text-body text-surface-500 hover:text-surface-800 transition-colors w-fit group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to IT Requisition Desk</span>
        </button>

        <div className="flex items-center gap-2 text-caption text-surface-400">
          <span>Home</span>
          <span>/</span>
          <button onClick={() => onNavigate('maintenance')} className="hover:text-surface-700">IT Service</button>
          <span>/</span>
          <button onClick={() => onNavigate('maintenance')} className="hover:text-surface-700">Tickets</button>
          <span>/</span>
          <span className="font-semibold text-surface-800 font-mono">{ticket.ticketCode}</span>
        </div>
      </div>

      {/* 2. Header Card (Aligned with AssetDetail layout, typography, and buttons) */}
      <Card>
        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 shadow-xs">
              {getAssetIcon(ticket.asset.type)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-title font-bold text-surface-900 bg-surface-100 px-2 py-0.5 rounded-lg border border-surface-200">
                  {ticket.ticketCode}
                </span>
                {getStatusBadge(ticket.status)}
                <Badge variant={priorityConfig[ticket.priority].variant} dot>
                  {ticket.priority} ({priorityConfig[ticket.priority].sla})
                </Badge>
                <Badge variant="neutral">{ticket.category}</Badge>
              </div>

              <h1 className="text-heading font-bold text-surface-900 mt-2">{ticket.title}</h1>
              
              <div className="flex items-center gap-4 mt-3 flex-wrap text-caption text-surface-500">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-surface-400" />
                  <strong className="text-surface-800">{ticket.requester.name}</strong> ({ticket.requester.department})
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-surface-400" />
                  {ticket.location}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-surface-400" />
                  Created: {ticket.createdAt}
                </span>
                {ticket.itAssignment.technicianName && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1.5 text-brand-700 font-medium">
                      <Wrench className="h-3.5 w-3.5" />
                      Assigned: {ticket.itAssignment.technicianName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap lg:self-center">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={action.label}
                  size="sm"
                  variant="outline"
                  leftIcon={<ActionIcon className="h-4 w-4" />}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>

        <Tabs items={tabs} active={tab} onChange={setTab} className="px-5" />
      </Card>

      {/* ========================================================================= */}
      {/* Tab 1: Overview (2-Column Dashboard Layout)                                */}
      {/* ========================================================================= */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* Active Execution / Hold Banner if applicable */}
            {ticket.status === 'ON_HOLD' && (
              <div className="p-4 rounded-xl bg-error-50 border border-error-200 text-error-900 shadow-xs flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-error-600 text-white flex items-center justify-center shrink-0">
                    <PauseCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Ticket Currently On-Hold</span>
                      <Badge variant="error" dot>{ticket.itExecution.holdCategory || 'Waiting for Spare Parts'}</Badge>
                    </div>
                    <p className="text-body text-error-800 mt-1">{ticket.itExecution.holdReason || 'Awaiting manufacturer replacement components from Apple Care.'}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white text-error-700 border-error-300 hover:bg-error-50 shrink-0"
                  onClick={() => {
                    setUpdateTargetStatus('In-Progress');
                    setIsStatusUpdateModalOpen(true);
                  }}
                >
                  Resume Work
                </Button>
              </div>
            )}

            {ticket.status === 'DONE' && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold">Requisition Resolved & Closed</span>
                    <p className="text-body text-emerald-800 mt-1">{ticket.itExecution.resolutionNotes || 'All diagnostic and repair tasks verified successfully.'}</p>
                    <p className="text-caption text-emerald-700 mt-0.5">
                      Completed: {ticket.itExecution.completedAt || 'Recently'} · Total Cost: ${ticket.itExecution.actualCost || 120} · Downtime: {ticket.itExecution.downtimeHours || 4.5} hrs
                    </p>
                  </div>
                </div>
                <Badge variant="success">Resolved</Badge>
              </div>
            )}

            {/* Section 1: Request Details */}
            <SectionCard
              title="Request Details & Symptoms"
              description="Detailed issue statement, business justification, and impact"
              action={
                <Button size="sm" variant="ghost" leftIcon={<Edit className="h-3.5 w-3.5" />} onClick={() => setIsEditModalOpen(true)}>
                  Edit
                </Button>
              }
            >
              <div className="flex flex-col gap-4">
                <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
                  <span className="text-caption text-surface-400 font-semibold block mb-1">Problem / Incident Statement:</span>
                  <p className="text-body font-medium text-surface-900 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <InfoRow label="Ticket Code" value={ticket.ticketCode} isMono />
                  <InfoRow label="Category" value={ticket.category} />
                  <InfoRow label="Priority / Urgency" value={`${ticket.priority} (${priorityConfig[ticket.priority].sla})`} />
                  <InfoRow label="Device Location" value={ticket.location} />
                  <InfoRow label="Creation Timestamp" value={ticket.createdAt} />
                  <InfoRow label="Preferred Service Time" value="Business Hours (09:00 - 18:00)" />
                  <InfoRow label="Business Justification" value="Primary software engineering workstation required for active development sprint." />
                  <InfoRow label="Escalation Target" value="Tier 2 Hardware Lab" />
                </div>
              </div>
            </SectionCard>

            {/* Section 2: Requester Information */}
            <SectionCard
              title="Requester Information"
              description="Employee identity, contact details, and department linkage"
              action={
                <Button size="sm" variant="outline" leftIcon={<User className="h-3.5 w-3.5" />} onClick={() => setIsChangeRequesterModalOpen(true)}>
                  Select Requester
                </Button>
              }
            >
              <div className="flex items-start justify-between p-3.5 bg-surface-50 rounded-xl border border-surface-200 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={ticket.requester.name} initials={ticket.requester.initials} color={ticket.requester.avatarColor} size="md" />
                  <div>
                    <h4 className="font-bold text-surface-900">{ticket.requester.name}</h4>
                    <p className="text-caption text-surface-500">{ticket.requester.jobTitle} · {ticket.requester.department}</p>
                  </div>
                </div>
                <Badge variant="brand">Requester</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <InfoRow label="Employee ID" value="EMP-0021" isMono />
                <InfoRow label="Department" value={ticket.requester.department} />
                <InfoRow label="Job Title" value={ticket.requester.jobTitle} />
                <InfoRow label="Corporate Email" value={ticket.requester.email} />
                <InfoRow label="Direct Phone" value="+1 (555) 392-8812" />
                <InfoRow label="Desk Location" value={ticket.location} />
                <InfoRow label="Reports To / Manager" value="David Kim (Engineering Director)" />
                <InfoRow label="Department Head" value="Sarah Jenkins (VP of Engineering)" />
              </div>
            </SectionCard>

            {/* Section 3: Affected Asset Profile */}
            <SectionCard
              title="Affected Asset Profile"
              description="Hardware or equipment item requiring maintenance"
              action={
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
                    onClick={() => onNavigate('asset-detail', ticket.asset.id)}
                  >
                    Open Asset Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ArrowRightLeft className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setAssetSelectionTab('my');
                      setIsChangeAssetModalOpen(true);
                    }}
                  >
                    Change Asset
                  </Button>
                </div>
              }
            >
              <div className="p-4 bg-surface-50 rounded-xl border border-surface-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-xl bg-white border border-surface-200 flex items-center justify-center shrink-0 shadow-xs">
                    {getAssetIcon(ticket.asset.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-body font-bold text-surface-900">{ticket.asset.name}</h4>
                      {ticket.asset.isMyAssignedAsset ? (
                        <Badge variant="success">Assigned to Requester</Badge>
                      ) : (
                        <Badge variant="neutral">Shared / Other User</Badge>
                      )}
                    </div>
                    <p className="text-caption text-surface-500 font-mono mt-0.5">
                      Code: {ticket.asset.code} · S/N: {ticket.asset.serialNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-caption text-surface-600 sm:border-l sm:border-surface-200 sm:pl-4">
                  <div>
                    <span className="text-surface-400 block text-[11px]">Purchase Cost</span>
                    <span className="font-mono font-bold text-surface-900">${ticket.asset.purchaseCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-surface-400 block text-[11px]">Current Book Value</span>
                    <span className="font-mono font-bold text-surface-900">${ticket.asset.currentValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                <InfoRow label="Asset Code" value={ticket.asset.code} isMono />
                <InfoRow label="Serial Number" value={ticket.asset.serialNumber} isMono />
                <InfoRow label="Asset Category" value="IT Hardware" />
                <InfoRow label="Device Model / Type" value={ticket.asset.type} />
                <InfoRow label="Assigned Location" value={ticket.asset.location || ticket.location} />
                <InfoRow label="Warranty Status" value="Active AppleCare+ until Jan 2027" />
              </div>
            </SectionCard>

            {/* Section 4: 4-Stage Governance & Audit Trail */}
            <SectionCard
              title="4-Stage Governance & Audit Trail"
              description="Complete chain of custody, approvals, dispatch, and work logs"
            >
              <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-200">
                
                {/* Step 1: User Requisition */}
                <div className="relative flex items-start gap-4 pl-1">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold z-10 shadow-xs">
                    ✓
                  </div>
                  <div className="flex-1 bg-surface-50 p-3.5 rounded-xl border border-surface-200">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-body font-bold text-surface-900">1. User Requisition Submitted</p>
                      <span className="text-caption text-surface-400 font-mono">{ticket.createdAt}</span>
                    </div>
                    <p className="text-caption text-surface-600 mt-1">
                      Submitted by <strong>{ticket.requester.name}</strong> ({ticket.requester.jobTitle})
                    </p>
                    <p className="text-caption text-surface-500 mt-0.5">
                      Selected Asset: {ticket.asset.name} ({ticket.asset.code})
                    </p>
                  </div>
                </div>

                {/* Step 2: Department Head Sign-off */}
                <div className="relative flex items-start gap-4 pl-1">
                  <div className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold z-10 text-white shadow-xs',
                    ticket.departmentApproval.status === 'Approved' ? 'bg-emerald-600' : ticket.departmentApproval.status === 'Rejected' ? 'bg-error-600' : 'bg-surface-400'
                  )}>
                    {ticket.departmentApproval.status === 'Approved' ? '✓' : ticket.departmentApproval.status === 'Rejected' ? '✕' : '2'}
                  </div>
                  <div className="flex-1 bg-surface-50 p-3.5 rounded-xl border border-surface-200">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-body font-bold text-surface-900">2. Department Head Sign-off</p>
                        {ticket.departmentApproval.status === 'Approved' && <Badge variant="success">Approved</Badge>}
                        {ticket.departmentApproval.status === 'Rejected' && <Badge variant="error">Rejected</Badge>}
                        {ticket.departmentApproval.status === 'Pending' && <Badge variant="warning">Pending Sign-off</Badge>}
                      </div>
                      {ticket.departmentApproval.approvedAt && (
                        <span className="text-caption text-surface-400 font-mono">{ticket.departmentApproval.approvedAt}</span>
                      )}
                    </div>

                    <div className="mt-2 text-caption text-surface-700">
                      <p>
                        Primary Approver: <strong>Sarah Jenkins (VP of Engineering)</strong>
                      </p>
                      {ticket.departmentApproval.isDelegated && (
                        <div className="mt-1 flex items-center gap-1.5 text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                          <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                          <span>
                            Delegated Acting Approver: <strong>{ticket.departmentApproval.approverName}</strong> ({ticket.departmentApproval.approverTitle})
                          </span>
                        </div>
                      )}
                      {ticket.departmentApproval.comments && (
                        <div className="mt-2 bg-white p-2.5 rounded border border-surface-200 italic text-surface-600">
                          "{ticket.departmentApproval.comments}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3: IT Dispatch & Assignment */}
                <div className="relative flex items-start gap-4 pl-1">
                  <div className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold z-10 text-white shadow-xs',
                    ticket.itAssignment.technicianName ? 'bg-emerald-600' : 'bg-surface-400'
                  )}>
                    {ticket.itAssignment.technicianName ? '✓' : '3'}
                  </div>
                  <div className="flex-1 bg-surface-50 p-3.5 rounded-xl border border-surface-200">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-body font-bold text-surface-900">3. IT Dispatch Desk</p>
                        {ticket.itAssignment.technicianName ? <Badge variant="brand">Assigned</Badge> : <Badge variant="neutral">Pending Dispatch</Badge>}
                      </div>
                      {ticket.itAssignment.assignedAt && (
                        <span className="text-caption text-surface-400 font-mono">{ticket.itAssignment.assignedAt}</span>
                      )}
                    </div>

                    {ticket.itAssignment.technicianName ? (
                      <div className="mt-2 text-caption text-surface-700">
                        <p>
                          Assigned to: <strong>{ticket.itAssignment.technicianName}</strong> ({ticket.itAssignment.technicianRole})
                        </p>
                        <p className="text-surface-500 mt-0.5">
                          Dispatched by: {ticket.itAssignment.assignedBy || 'IT Operations Manager'} · Estimated Repair Cost: ${ticket.itAssignment.estimatedCost || 250}
                        </p>
                      </div>
                    ) : (
                      <p className="text-caption text-surface-400 mt-1 italic">
                        Awaiting IT dispatch assignment to qualified hardware technician.
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 4: Technician Resolution & Sign-off */}
                <div className="relative flex items-start gap-4 pl-1">
                  <div className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold z-10 text-white shadow-xs',
                    ticket.status === 'DONE' ? 'bg-emerald-600' : ticket.status === 'ON_HOLD' ? 'bg-warning-500' : ['PLANNING', 'IN_PROGRESS'].includes(ticket.status) ? 'bg-brand-600' : 'bg-surface-400'
                  )}>
                    {ticket.status === 'DONE' ? '✓' : '4'}
                  </div>
                  <div className="flex-1 bg-surface-50 p-3.5 rounded-xl border border-surface-200">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-body font-bold text-surface-900">4. IT Servicing & Resolution</p>
                        {ticket.status === 'DONE' && <Badge variant="success">Completed</Badge>}
                        {ticket.status === 'IN_PROGRESS' && <Badge variant="warning">In-Progress</Badge>}
                        {ticket.status === 'ON_HOLD' && <Badge variant="error">On-Hold</Badge>}
                      </div>
                      {ticket.itExecution.completedAt && (
                        <span className="text-caption text-surface-400 font-mono">{ticket.itExecution.completedAt}</span>
                      )}
                    </div>

                    {ticket.itExecution.diagnosticNotes && (
                      <div className="mt-2 bg-white p-2.5 rounded border border-surface-200 text-caption">
                        <span className="font-semibold text-surface-800 block mb-0.5">Diagnostic & Work Log:</span>
                        <p className="text-surface-600">{ticket.itExecution.diagnosticNotes}</p>
                      </div>
                    )}

                    {ticket.itExecution.holdReason && (
                      <div className="mt-2 bg-warning-50 p-2.5 rounded border border-warning-200 text-caption text-warning-800">
                        <span className="font-semibold block mb-0.5">⚠️ Hold Details ({ticket.itExecution.holdCategory}):</span>
                        <p>{ticket.itExecution.holdReason}</p>
                      </div>
                    )}

                    {ticket.itExecution.resolutionNotes && (
                      <div className="mt-2 bg-emerald-50 p-2.5 rounded border border-emerald-200 text-caption text-emerald-900">
                        <span className="font-semibold block mb-0.5">Resolution Summary:</span>
                        <p>{ticket.itExecution.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </SectionCard>

          </div>

          {/* Right Column (1/3 width Sidebar) */}
          <div className="flex flex-col gap-4">
            
            {/* SLA Real-Time Performance Card */}
            <Card>
              <CardHeader title="SLA & Resolution Target" description="Service level agreement tracking" />
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-body font-semibold text-surface-800">Priority SLA</span>
                  <Badge variant={priorityConfig[ticket.priority].variant} dot>
                    {ticket.priority} ({priorityConfig[ticket.priority].sla})
                  </Badge>
                </div>

                <div>
                  <div className="flex items-center justify-between text-caption mb-1.5">
                    <span className="text-surface-500">Resolution Progress</span>
                    <span className="font-mono font-bold text-surface-900">4.5 / {ticket.slaTargetHours} Hours</span>
                  </div>
                  <Progress
                    value={Math.min(100, Math.round((4.5 / ticket.slaTargetHours) * 100))}
                    barClass={ticket.priority === 'Critical' ? 'bg-error-500' : 'bg-brand-500'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-200 text-caption">
                  <div>
                    <span className="text-surface-400 block text-[11px]">Response SLA</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Met (15 mins)
                    </span>
                  </div>
                  <div>
                    <span className="text-surface-400 block text-[11px]">Remaining Time</span>
                    <span className="font-mono font-bold text-surface-900">
                      {Math.max(0, ticket.slaTargetHours - 4.5).toFixed(1)} Hours
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-50 border border-surface-200 text-[11px] text-surface-600">
                  Target Due: <strong className="text-surface-800">2026-08-17 17:30</strong> (Within SLA)
                </div>
              </div>
            </Card>

            {/* Financial & Cost Summary Card */}
            <Card>
              <CardHeader title="Financial & Repair Cost" description="Expense and downtime ledger" />
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-body text-surface-600">Estimated Cost</span>
                  <span className="font-mono font-semibold text-surface-900">${ticket.itAssignment.estimatedCost || 250}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body text-surface-600">Actual Cost (Parts + Labor)</span>
                  <span className="font-mono text-title font-bold text-brand-600">
                    ${ticket.itExecution.actualCost || ticket.itAssignment.estimatedCost || 120}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-surface-200">
                  <span className="text-body text-surface-600">Device Downtime</span>
                  <span className="font-mono font-semibold text-surface-900">{ticket.itExecution.downtimeHours || 4.5} Hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body text-surface-600">Cost / Book Value Ratio</span>
                  <span className="font-mono text-caption font-bold text-emerald-700">4.2% (Economical)</span>
                </div>
              </div>
            </Card>

            {/* Assigned Support Group & Tech Card */}
            <Card>
              <CardHeader
                title="Support Group & Assignment"
                description="Assigned technical team"
                action={
                  <Button size="sm" variant="ghost" onClick={() => setIsDispatchModalOpen(true)}>
                    Reassign
                  </Button>
                }
              />
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <span className="text-caption text-surface-400 block text-[11px]">Support Group</span>
                  <span className="font-semibold text-surface-900">Hardware & Device Support</span>
                </div>

                {ticket.itAssignment.technicianName ? (
                  <div className="p-3 bg-surface-50 rounded-xl border border-surface-200 flex items-center gap-3">
                    <Avatar
                      name={ticket.itAssignment.technicianName}
                      initials={ticket.itAssignment.technicianName.split(' ').map(n => n[0]).join('')}
                      color={ticket.itAssignment.technicianAvatar || 'bg-brand-600'}
                    />
                    <div className="min-w-0">
                      <p className="text-body font-bold text-surface-900 truncate">{ticket.itAssignment.technicianName}</p>
                      <p className="text-caption text-surface-500 truncate">{ticket.itAssignment.technicianRole}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-caption text-amber-800">
                    Awaiting technician dispatch assignment.
                  </div>
                )}
              </div>
            </Card>

            {/* Department Approver Card */}
            <Card>
              <CardHeader title="Department Approver" description="Hierarchy and delegation policy" />
              <div className="p-5 flex flex-col gap-3 text-caption">
                <div>
                  <span className="text-surface-400 block text-[11px]">Primary Approver</span>
                  <span className="font-semibold text-surface-900">Sarah Jenkins (VP of Engineering)</span>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-600" /> Active Delegation Authority
                  </span>
                  <p className="mt-1 text-[11px]">
                    Acting Approver: <strong>David Chen</strong> (Principal Lead Engineer)
                  </p>
                  <p className="text-[10px] text-amber-700 mt-0.5">Valid until Aug 25, 2026 (Executive Leave)</p>
                </div>
              </div>
            </Card>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* Tab 2: Request Details Tab                                                */}
      {/* ========================================================================= */}
      {tab === 'details' && (
        <Card>
          <CardHeader
            title="Comprehensive Request Specification"
            description="Full problem statement, scope of repair, impact analysis, and business priority"
            action={
              <Button size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => setIsEditModalOpen(true)}>
                Edit Scope
              </Button>
            }
          />
          <div className="p-6 flex flex-col gap-6">
            <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
              <h4 className="text-body font-bold text-surface-900 mb-2">Subject / Issue Summary</h4>
              <p className="text-heading font-semibold text-surface-900">{ticket.title}</p>
              <p className="text-body text-surface-700 mt-2 leading-relaxed">{ticket.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-surface-200 bg-white">
                <span className="text-caption text-surface-400 block text-[11px]">Impact Assessment</span>
                <p className="text-title font-bold text-surface-900 mt-1">High (Single Developer)</p>
                <p className="text-caption text-surface-500 mt-0.5">Workstation unable to compile 3D graphics rendering shaders.</p>
              </div>

              <div className="p-4 rounded-xl border border-surface-200 bg-white">
                <span className="text-caption text-surface-400 block text-[11px]">Urgency Level</span>
                <p className="text-title font-bold text-amber-700 mt-1">Immediate (Sprint Deadline)</p>
                <p className="text-caption text-surface-500 mt-0.5">Deliverable scheduled for internal demo in 48 hours.</p>
              </div>

              <div className="p-4 rounded-xl border border-surface-200 bg-white">
                <span className="text-caption text-surface-400 block text-[11px]">Resolution Target SLA</span>
                <p className="text-title font-bold text-brand-700 mt-1">{priorityConfig[ticket.priority].sla}</p>
                <p className="text-caption text-surface-500 mt-0.5">Tier-1 Hardware SLA agreement in place.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-surface-200">
              <InfoRow label="Ticket Category" value={ticket.category} />
              <InfoRow label="Subcategory" value="Display Flex / GPU Thermal Dissipation" />
              <InfoRow label="Device Model" value={ticket.asset.name} />
              <InfoRow label="Location / Building" value={ticket.location} />
              <InfoRow label="Creation Timestamp" value={ticket.createdAt} />
              <InfoRow label="Initial Dispatcher" value="Michael Chang (IT Ops)" />
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* Tab 3: Affected Asset Tab                                                 */}
      {/* ========================================================================= */}
      {tab === 'asset' && (
        <Card>
          <CardHeader
            title="Affected Asset Ledger & Specifications"
            description="Hardware details, ownership, specs, and maintenance history"
            action={
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ArrowRightLeft className="h-4 w-4" />}
                  onClick={() => {
                    setAssetSelectionTab('my');
                    setIsChangeAssetModalOpen(true);
                  }}
                >
                  Change Linked Asset
                </Button>
                <Button
                  size="sm"
                  leftIcon={<ExternalLink className="h-4 w-4" />}
                  onClick={() => onNavigate('asset-detail', ticket.asset.id)}
                >
                  Open Full Asset Profile
                </Button>
              </div>
            }
          />
          <div className="p-6 flex flex-col gap-6">
            <div className="p-5 bg-surface-50 rounded-2xl border border-surface-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white border border-surface-200 flex items-center justify-center shrink-0 shadow-xs">
                  {getAssetIcon(ticket.asset.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-title font-bold text-surface-900">{ticket.asset.name}</h3>
                    {ticket.asset.isMyAssignedAsset ? (
                      <Badge variant="success">Assigned to Requester</Badge>
                    ) : (
                      <Badge variant="neutral">Shared Hardware</Badge>
                    )}
                  </div>
                  <p className="text-body text-surface-500 font-mono mt-0.5">
                    {ticket.asset.code} · {ticket.asset.serialNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <span className="text-caption text-surface-400 block text-[11px]">Original Cost</span>
                  <span className="font-mono text-title font-bold text-surface-900">${ticket.asset.purchaseCost.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-caption text-surface-400 block text-[11px]">Book Value</span>
                  <span className="font-mono text-title font-bold text-emerald-700">${ticket.asset.currentValue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <InfoRow label="Asset Code" value={ticket.asset.code} isMono />
              <InfoRow label="Serial Number" value={ticket.asset.serialNumber} isMono />
              <InfoRow label="Equipment Type" value={ticket.asset.type} />
              <InfoRow label="Current Owner" value={ticket.asset.isMyAssignedAsset ? ticket.requester.name : 'Shared / Pool'} />
              <InfoRow label="Department" value={ticket.requester.department} />
              <InfoRow label="Location" value={ticket.asset.location || ticket.location} />
              <InfoRow label="Vendor" value="Apple Inc." />
              <InfoRow label="Warranty Expiry" value="2027-01-15 (AppleCare+)" />
              <InfoRow label="Condition" value="Excellent (Physical)" />
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* Tab 4: Approval & Governance Tab                                          */}
      {/* ========================================================================= */}
      {tab === 'approval' && (
        <Card>
          <CardHeader
            title="Department Approval & Delegation Governance"
            description="Sign-off authority, delegation settings, and approval audit"
            action={
              ticket.status === 'PENDING_DEPT_APPROVAL' ? (
                <Button size="sm" leftIcon={<ShieldCheck className="h-4 w-4" />} onClick={() => setIsApproveModalOpen(true)}>
                  Perform Sign-Off
                </Button>
              ) : undefined
            }
          />
          <div className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-surface-200 bg-surface-50">
                <span className="text-caption text-surface-400 font-semibold block mb-2">Primary Department Head</span>
                <div className="flex items-center gap-3">
                  <Avatar name="Sarah Jenkins" initials="SJ" color="bg-indigo-600" size="md" />
                  <div>
                    <h4 className="font-bold text-surface-900">Sarah Jenkins</h4>
                    <p className="text-caption text-surface-500">VP of Engineering · Engineering</p>
                    <p className="text-caption text-surface-400">sarah.jenkins@company.com</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-caption text-amber-800 font-semibold">Acting Delegated Authority</span>
                  <Badge variant="warning">Active</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar name="David Chen" initials="DC" color="bg-emerald-600" size="md" />
                  <div>
                    <h4 className="font-bold text-surface-900">David Chen</h4>
                    <p className="text-caption text-surface-600">Principal Lead Engineer · Engineering</p>
                    <p className="text-caption text-surface-500">Delegated reason: Executive Summit & Annual Leave</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-surface-200">
              <h4 className="text-body font-bold text-surface-900 mb-2">Approval Decision & Notes</h4>
              <div className="flex items-center gap-2 mb-2">
                {ticket.departmentApproval.status === 'Approved' && <Badge variant="success">Approved</Badge>}
                {ticket.departmentApproval.status === 'Rejected' && <Badge variant="error">Rejected</Badge>}
                {ticket.departmentApproval.status === 'Pending' && <Badge variant="warning">Pending Sign-off</Badge>}
                <span className="text-caption text-surface-500">
                  Signed off by {ticket.departmentApproval.approverName} on {ticket.departmentApproval.approvedAt || 'Pending'}
                </span>
              </div>
              <p className="text-body text-surface-700 italic bg-surface-50 p-3 rounded-lg border border-surface-200">
                "{ticket.departmentApproval.comments || 'Approved under urgent engineering priority. Expedite diagnostic.'}"
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* Tab 5: Assignment & Work Order Tab                                        */}
      {/* ========================================================================= */}
      {tab === 'assignment' && (
        <Card>
          <CardHeader
            title="IT Assignment & Work Order Execution"
            description="Assigned technician, diagnostic notes, parts used, downtime, and labor expenses"
            action={
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" leftIcon={<Users className="h-4 w-4" />} onClick={() => setIsDispatchModalOpen(true)}>
                  Reassign Tech
                </Button>
                <Button size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => setIsStatusUpdateModalOpen(true)}>
                  Update Work Log
                </Button>
              </div>
            }
          />
          <div className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
                <span className="text-caption text-surface-400 block text-[11px]">Assigned Technician</span>
                <p className="text-body font-bold text-surface-900 mt-1">{ticket.itAssignment.technicianName || 'Unassigned'}</p>
                <p className="text-caption text-surface-500">{ticket.itAssignment.technicianRole || 'Hardware Support Specialist'}</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
                <span className="text-caption text-surface-400 block text-[11px]">Target Resolution Window</span>
                <p className="text-body font-bold text-surface-900 mt-1">{ticket.itAssignment.targetResolutionDate || '2026-08-17'}</p>
                <p className="text-caption text-surface-500">Priority SLA: {priorityConfig[ticket.priority].sla}</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-surface-200">
              <h4 className="text-body font-bold text-surface-900 mb-2">Technical Diagnostic Log</h4>
              <p className="text-body text-surface-700 leading-relaxed bg-surface-50 p-3.5 rounded-xl border border-surface-200">
                {ticket.itExecution.diagnosticNotes || 'Ran Apple Service Toolkit Diagnostics. Display cable flex connector seated properly; logic board GPU thermal paste re-applied.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-surface-200 bg-surface-50">
                <span className="text-caption text-surface-400 block text-[11px]">Parts Utilized</span>
                <p className="text-body font-semibold text-surface-900 mt-1">
                  {ticket.itExecution.partsUsed?.join(', ') || 'Thermal Paste, Flex Gasket'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-surface-200 bg-surface-50">
                <span className="text-caption text-surface-400 block text-[11px]">Actual Incurred Cost</span>
                <p className="text-title font-bold text-brand-600 mt-1">
                  ${ticket.itExecution.actualCost || 120}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-surface-200 bg-surface-50">
                <span className="text-caption text-surface-400 block text-[11px]">Asset Total Downtime</span>
                <p className="text-title font-bold text-surface-900 mt-1">
                  {ticket.itExecution.downtimeHours || 4.5} Hours
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* Tab 6: Audit Trail Tab                                                    */}
      {/* ========================================================================= */}
      {tab === 'audit' && (
        <Card>
          <CardHeader title="System Audit Logs & Governance History" description="Immutable audit trail of all actions and modifications" />
          <div className="divide-y divide-surface-100">
            {ticket.timeline.map((event) => (
              <div key={event.id} className="p-4 flex items-start gap-4 hover:bg-surface-50 transition-colors">
                <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-body font-semibold text-surface-900">{event.action}</p>
                      {event.badge && <Badge variant="warning">{event.badge}</Badge>}
                    </div>
                    <span className="text-caption text-surface-400 font-mono">{event.timestamp}</span>
                  </div>
                  <p className="text-caption text-surface-600 mt-0.5">
                    Actor: <strong>{event.actorName}</strong> ({event.actorRole})
                  </p>
                  {event.notes && (
                    <p className="text-caption text-surface-500 mt-1 bg-surface-50 p-2 rounded border border-surface-200">
                      {event.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* Tab 7: Comments Tab                                                       */}
      {/* ========================================================================= */}
      {tab === 'comments' && (
        <Card>
          <CardHeader title="Discussion & Team Communications" description="Threaded messages between user, manager, and technician" />
          <div className="p-5 flex flex-col gap-4">
            <div className="space-y-3">
              {commentsList.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-surface-50 border border-surface-200 flex items-start gap-3">
                  <Avatar name={c.author} initials={c.initials} color={c.avatarColor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-body font-bold text-surface-900">{c.author}</span>
                        <Badge variant="neutral">{c.role}</Badge>
                      </div>
                      <span className="text-caption text-surface-400 font-mono">{c.timestamp}</span>
                    </div>
                    <p className="text-body text-surface-700 mt-1.5 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-surface-200 flex flex-col gap-3">
              <Textarea
                placeholder="Type your message, work update, or question..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  leftIcon={<Send className="h-4 w-4" />}
                  onClick={handleAddComment}
                  disabled={!newCommentText.trim()}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Edit Ticket Details                                              */}
      {/* ========================================================================= */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Ticket: ${ticket.ticketCode}`}
        description="Update ticket title, issue category, priority SLA, or location"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <Input
            label="Subject / Summary"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="e.g. MacBook Pro Display Flickering"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Issue Category"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as TicketCategory)}
              options={categoryOptions}
            />

            <Select
              label="Priority & SLA"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
              options={[
                { value: 'Critical', label: '🔴 Critical (2 Hours SLA - Escalated)' },
                { value: 'High', label: '🟠 High (8 Hours SLA)' },
                { value: 'Medium', label: '🔵 Medium (24 Hours SLA)' },
                { value: 'Low', label: '⚪ Low (48 Hours SLA)' },
              ]}
            />
          </div>

          <Textarea
            label="Problem Description & Symptoms"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={4}
          />

          <Input
            label="Desk / Pickup Location"
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
          />
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: Department Head Sign-Off / Approval                              */}
      {/* ========================================================================= */}
      <Modal
        open={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Department Head Sign-Off & Approval"
        description={`Review requisition ${ticket.ticketCode} for ${ticket.requester.name}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>Cancel</Button>
            <Button
              variant={approvalDecision === 'Approve' ? 'primary' : 'danger'}
              onClick={handleDepartmentApproval}
            >
              {approvalDecision === 'Approve' ? 'Confirm Approval' : 'Reject Requisition'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
            <p className="text-caption text-surface-500">Request Subject:</p>
            <p className="font-semibold text-surface-900">{ticket.title}</p>
            <p className="text-caption text-surface-600 mt-1">Asset: {ticket.asset.name} ({ticket.asset.code})</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setApprovalDecision('Approve')}
              className={cn(
                'p-3 rounded-xl border text-center font-bold transition-all',
                approvalDecision === 'Approve' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20' : 'border-surface-200 text-surface-600 hover:bg-surface-50'
              )}
            >
              ✓ Approve Request
            </button>
            <button
              type="button"
              onClick={() => setApprovalDecision('Reject')}
              className={cn(
                'p-3 rounded-xl border text-center font-bold transition-all',
                approvalDecision === 'Reject' ? 'border-error-500 bg-error-50 text-error-900 ring-2 ring-error-500/20' : 'border-surface-200 text-surface-600 hover:bg-surface-50'
              )}
            >
              ✕ Reject Request
            </button>
          </div>

          <Select
            label="Sign-Off Approver"
            value={approvalApproverName}
            onChange={(e) => {
              setApprovalApproverName(e.target.value);
              setApprovalIsDelegated(e.target.value.includes('David Chen') || e.target.value.includes('Acting'));
            }}
            options={[
              { value: 'Sarah Jenkins (VP of Engineering)', label: 'Sarah Jenkins - VP of Engineering (Primary Head)' },
              { value: 'David Chen (Acting Lead Engineer)', label: 'David Chen - Principal Lead (Delegated Acting Authority)' },
              { value: 'Alex Morgan (General Manager)', label: 'Alex Morgan - General Manager' },
            ]}
          />

          <Textarea
            label="Approval Comments & Instructions"
            placeholder="Add operational notes or expedited triage instructions..."
            value={approvalComments}
            onChange={(e) => setApprovalComments(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: Assign Technician / Dispatch Desk                                */}
      {/* ========================================================================= */}
      <Modal
        open={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="IT Dispatch Desk: Assign Technician"
        description={`Assign technical specialist for ${ticket.ticketCode}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDispatchModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignTechnician}>Dispatch & Assign</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <Select
            label="Support Group"
            value={supportGroup}
            onChange={(e) => setSupportGroup(e.target.value)}
            options={[
              { value: 'Hardware & Device Support', label: 'Hardware & Device Support' },
              { value: 'Network & Infrastructure Desk', label: 'Network & Infrastructure Desk' },
              { value: 'Systems & OS Escalations', label: 'Systems & OS Escalations' },
              { value: 'Field Support Services', label: 'Field Support Services' },
            ]}
          />

          <div className="space-y-2">
            <label className="text-caption font-medium text-surface-700">Select Qualified Technician</label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {initialTechnicians.map((tech) => (
                <div
                  key={tech.id}
                  onClick={() => setSelectedTechId(tech.id)}
                  className={cn(
                    'p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all',
                    selectedTechId === tech.id ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500' : 'border-surface-200 hover:bg-surface-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={tech.name} initials={tech.initials} color={tech.avatarColor} size="sm" />
                    <div>
                      <p className="text-body font-bold text-surface-900">{tech.name}</p>
                      <p className="text-caption text-surface-500">{tech.role} · {tech.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right text-caption">
                    <Badge variant={tech.activeTicketsCount > 2 ? 'warning' : 'neutral'}>
                      {tech.activeTicketsCount} active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Input
            label="Estimated Repair Cost ($ USD)"
            type="number"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            placeholder="250"
          />
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: Update Work Log & Execution Status                               */}
      {/* ========================================================================= */}
      <Modal
        open={isStatusUpdateModalOpen}
        onClose={() => setIsStatusUpdateModalOpen(false)}
        title="Technician Service Log & Status"
        description={`Update work order execution for ${ticket.ticketCode}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsStatusUpdateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleTechnicianStatusUpdate}>Record Work Log</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <Select
            label="Execution Status"
            value={updateTargetStatus}
            onChange={(e) => setUpdateTargetStatus(e.target.value as any)}
            options={[
              { value: 'In-Progress', label: '🔧 In-Progress (Actively Servicing)' },
              { value: 'Planning', label: '📋 Planning / Awaiting Lab Slot' },
              { value: 'On-Hold', label: '⏸️ On-Hold (Blocked / Waiting)' },
              { value: 'Done', label: '✅ Done & Resolved (Completed)' },
            ]}
          />

          {updateTargetStatus === 'On-Hold' && (
            <>
              <Select
                label="Hold Category"
                value={updateHoldCategory}
                onChange={(e) => setUpdateHoldCategory(e.target.value as any)}
                options={[
                  { value: 'Waiting for Spare Parts', label: 'Waiting for Spare Parts (Order In Flight)' },
                  { value: 'Awaiting User Response', label: 'Awaiting User Response / Data Backup' },
                  { value: 'Vendor Escalation', label: 'Vendor Escalation / Apple Authorised Depot' },
                  { value: 'Scheduled Maintenance Window', label: 'Scheduled Maintenance Window' },
                ]}
              />

              <Textarea
                label="Hold Reason / Vendor Tracking"
                value={updateHoldReason}
                onChange={(e) => setUpdateHoldReason(e.target.value)}
                placeholder="e.g. Ordered logic board replacement part #661-3921. Delivery ETA tomorrow."
                rows={2}
              />
            </>
          )}

          <Textarea
            label="Diagnostic & Work Findings"
            value={updateDiagnosticNotes}
            onChange={(e) => setUpdateDiagnosticNotes(e.target.value)}
            placeholder="Record hardware voltage measurements, firmware flashing, or component swap findings..."
            rows={3}
          />

          {updateTargetStatus === 'Done' && (
            <>
              <Textarea
                label="Resolution Notes (Sign-Off Summary)"
                value={updateResolutionNotes}
                onChange={(e) => setUpdateResolutionNotes(e.target.value)}
                placeholder="Detail resolution verification, benchmark tests, and hand-off verification..."
                rows={2}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Actual Repair Cost ($ USD)"
                  type="number"
                  value={updateActualCost}
                  onChange={(e) => setUpdateActualCost(e.target.value)}
                />
                <Input
                  label="Total Downtime (Hours)"
                  type="number"
                  value={updateDowntimeHours}
                  onChange={(e) => setUpdateDowntimeHours(e.target.value)}
                />
              </div>

              <Input
                label="Parts / Components Used"
                value={updatePartsUsed}
                onChange={(e) => setUpdatePartsUsed(e.target.value)}
                placeholder="e.g. Display Ribbon Cable, Liquid Metal Paste"
              />
            </>
          )}
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: Change Affected Asset (My Assets vs Search All)                  */}
      {/* ========================================================================= */}
      <Modal
        open={isChangeAssetModalOpen}
        onClose={() => setIsChangeAssetModalOpen(false)}
        title="Link Affected Asset"
        description="Select from requester assigned devices or search entire organization inventory"
        width="max-w-2xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsChangeAssetModalOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (tempSelectedAsset) handleChangeAsset(tempSelectedAsset);
              }}
              disabled={!tempSelectedAsset}
            >
              Confirm Asset Link
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          {/* Tab Selection: My Assigned Assets vs Search All */}
          <div className="flex items-center gap-2 border-b border-surface-200 pb-2">
            <button
              onClick={() => setAssetSelectionTab('my')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-body font-medium transition-all',
                assetSelectionTab === 'my' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-surface-600 hover:text-surface-900'
              )}
            >
              Assigned to {ticket.requester.name} ({requesterAssignedAssets.length})
            </button>
            <button
              onClick={() => setAssetSelectionTab('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-body font-medium transition-all',
                assetSelectionTab === 'all' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-surface-600 hover:text-surface-900'
              )}
            >
              Search All Organization Assets ({assets.length})
            </button>
          </div>

          {assetSelectionTab === 'all' && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search Asset Code, Name, Serial Number, Owner, or Location..."
                value={assetSearchQuery}
                onChange={(e) => setAssetSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-surface-200 pl-9 pr-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          )}

          {/* List of selectable assets */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {assetSelectionTab === 'my' ? (
              requesterAssignedAssets.length === 0 ? (
                <div className="p-8 text-center bg-surface-50 rounded-xl border border-surface-200">
                  <p className="text-body font-semibold text-surface-700">No assets currently assigned to {ticket.requester.name}.</p>
                  <p className="text-caption text-surface-500 mt-1">Switch to "Search All Organization Assets" to select a shared or department device.</p>
                </div>
              ) : (
                requesterAssignedAssets.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setTempSelectedAsset(a)}
                    className={cn(
                      'p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all',
                      tempSelectedAsset?.id === a.id ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20' : 'border-surface-200 hover:bg-surface-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center shrink-0">
                        {getAssetIcon(a.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-body font-bold text-surface-900">{a.name}</p>
                          <Badge variant="success">Assigned</Badge>
                        </div>
                        <p className="text-caption text-surface-500 font-mono mt-0.5">
                          {a.code} · S/N: {a.serialNumber} · {a.location}
                        </p>
                      </div>
                    </div>
                    {tempSelectedAsset?.id === a.id && (
                      <Check className="h-5 w-5 text-brand-600" />
                    )}
                  </div>
                ))
              )
            ) : (
              filteredAllAssets.map((a) => (
                <div
                  key={a.id}
                  onClick={() => setTempSelectedAsset(a)}
                  className={cn(
                    'p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all',
                    tempSelectedAsset?.id === a.id ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20' : 'border-surface-200 hover:bg-surface-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center shrink-0">
                      {getAssetIcon(a.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-body font-bold text-surface-900">{a.name}</p>
                        <Badge variant="neutral">{a.category}</Badge>
                      </div>
                      <p className="text-caption text-surface-500 font-mono mt-0.5">
                        {a.code} · S/N: {a.serialNumber} · Owner: {a.assignedTo || 'Unassigned'} ({a.department})
                      </p>
                    </div>
                  </div>
                  {tempSelectedAsset?.id === a.id && (
                    <Check className="h-5 w-5 text-brand-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 6: Change Requester (Dynamic Employee List)                         */}
      {/* ========================================================================= */}
      <Modal
        open={isChangeRequesterModalOpen}
        onClose={() => setIsChangeRequesterModalOpen(false)}
        title="Select Requisition Requester"
        description="Assign this ticket to any registered employee in the system"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsChangeRequesterModalOpen(false)}>Cancel</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search employee name, department, or job title..."
              value={requesterSearchQuery}
              onChange={(e) => setRequesterSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-surface-200 pl-9 pr-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => handleChangeRequester(emp)}
                className="p-3.5 rounded-xl border border-surface-200 hover:border-brand-400 hover:bg-brand-50/40 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={emp.name} initials={emp.initials} color={emp.avatarColor} size="md" />
                  <div>
                    <h4 className="font-bold text-surface-900">{emp.name}</h4>
                    <p className="text-caption text-surface-500">{emp.jobTitle || emp.title} · {emp.department}</p>
                    <p className="text-caption text-surface-400">{emp.email}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">Select</Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

    </div>
  );
}

function InfoRow({ label, value, isMono }: { label: string; value: string; isMono?: boolean }) {
  return (
    <div>
      <dt className="text-caption text-surface-400">{label}</dt>
      <dd className={cn('text-body font-medium text-surface-800 mt-0.5', isMono && 'font-mono')}>{value}</dd>
    </div>
  );
}

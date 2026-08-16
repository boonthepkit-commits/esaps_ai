export type RequisitionStatus =
  | 'PENDING_DEPT_APPROVAL'
  | 'REJECTED_BY_DEPT'
  | 'PENDING_IT_DISPATCH'
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'DONE';

export type TicketCategory =
  | 'Hardware Fault & Repair'
  | 'Equipment Replacement'
  | 'Software & OS Issue'
  | 'Network & Wi-Fi'
  | 'Peripherals & Accessories'
  | 'Account & Access'
  | 'Preventive Maintenance';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface TimelineEvent {
  id: string;
  stage: 'Creation' | 'Dept Approval' | 'IT Assignment' | 'Planning' | 'In-Progress' | 'On-Hold' | 'Resolution';
  actorName: string;
  actorRole: string;
  timestamp: string;
  action: string;
  notes?: string;
  badge?: string;
}

export interface ITRequisitionTicket {
  id: string;
  ticketCode: string;
  title: string;
  category: TicketCategory;
  priority: PriorityLevel;
  slaTargetHours: number;
  description: string;
  location: string;
  createdAt: string;
  status: RequisitionStatus;

  // 1. Requester Info
  requester: {
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    department: string;
    initials: string;
    avatarColor: string;
  };

  // Associated Asset (My Assigned Asset or Shared Asset)
  asset: {
    id: string;
    code: string;
    name: string;
    type: string;
    serialNumber: string;
    location: string;
    isMyAssignedAsset: boolean;
    purchaseCost: number;
    currentValue: number;
  };

  // 2. Department Approval Info
  departmentApproval: {
    status: 'Pending' | 'Approved' | 'Rejected';
    approverName: string;
    approverTitle: string;
    isDelegated: boolean;
    delegatedBy?: string; // e.g. "David Chen (Acting Lead on behalf of Sarah Jenkins)"
    approvedAt?: string;
    comments?: string;
  };

  // 3. IT Manager / Dispatcher Assignment
  itAssignment: {
    assignedBy?: string;
    assignedAt?: string;
    technicianId?: string;
    technicianName?: string;
    technicianRole?: string;
    technicianAvatar?: string;
    estimatedCost?: number;
    targetResolutionDate?: string;
  };

  // 4. IT Execution & Resolution
  itExecution: {
    currentStatus: 'Planning' | 'In-Progress' | 'On-Hold' | 'Done' | 'Pending Dispatch';
    holdReason?: string;
    holdCategory?: 'Waiting for Spare Parts' | 'Awaiting User Response' | 'Vendor Escalation' | 'Scheduled Maintenance Window';
    diagnosticNotes?: string;
    resolutionNotes?: string;
    partsUsed?: string[];
    actualCost?: number;
    downtimeHours?: number;
    completedAt?: string;
    userSatisfactionRating?: number; // 1-5
  };

  timeline: TimelineEvent[];
}

export interface DelegatedApproverSetting {
  department: string;
  primaryApprover: {
    id: string;
    name: string;
    title: string;
    email: string;
  };
  delegatedApprover: {
    id: string;
    name: string;
    title: string;
    email: string;
  };
  isActive: boolean;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ITTechnician {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatarColor: string;
  initials: string;
  activeTicketsCount: number;
  completedThisMonth: number;
}

export const initialTechnicians: ITTechnician[] = [
  {
    id: 'tech-1',
    name: 'Alex Rivera',
    role: 'Lead Hardware Specialist',
    specialty: 'Apple Certified & Laptop Hardware',
    avatarColor: 'bg-brand-600',
    initials: 'AR',
    activeTicketsCount: 3,
    completedThisMonth: 18
  },
  {
    id: 'tech-2',
    name: 'Maya Lin',
    role: 'Senior Network Engineer',
    specialty: 'Cisco, Wi-Fi 6 & Infrastructure',
    avatarColor: 'bg-emerald-600',
    initials: 'ML',
    activeTicketsCount: 2,
    completedThisMonth: 14
  },
  {
    id: 'tech-3',
    name: 'Sam Taylor',
    role: 'Systems Administrator',
    specialty: 'Windows Enterprise, Linux & Servers',
    avatarColor: 'bg-indigo-600',
    initials: 'ST',
    activeTicketsCount: 4,
    completedThisMonth: 22
  },
  {
    id: 'tech-4',
    name: 'Elena Rostova',
    role: 'IT Support & Mobility Specialist',
    specialty: 'Mobile Devices, Monitors & Peripherals',
    avatarColor: 'bg-amber-600',
    initials: 'ER',
    activeTicketsCount: 1,
    completedThisMonth: 16
  }
];

export const initialDelegationSettings: DelegatedApproverSetting[] = [
  {
    department: 'Engineering',
    primaryApprover: {
      id: 'appr-1',
      name: 'Sarah Jenkins',
      title: 'VP of Engineering',
      email: 'sarah.jenkins@company.com'
    },
    delegatedApprover: {
      id: 'appr-1-del',
      name: 'David Chen',
      title: 'Principal Lead Engineer (Acting Approver)',
      email: 'david.chen@company.com'
    },
    isActive: true,
    startDate: '2026-08-10',
    endDate: '2026-08-25',
    reason: 'Annual Leave & Executive Summit in Tokyo'
  },
  {
    department: 'Sales',
    primaryApprover: {
      id: 'appr-2',
      name: 'Robert Vance',
      title: 'Sales Director',
      email: 'robert.vance@company.com'
    },
    delegatedApprover: {
      id: 'appr-2-del',
      name: 'Emily Watson',
      title: 'Senior Account Executive',
      email: 'emily.watson@company.com'
    },
    isActive: false,
    startDate: '2026-09-01',
    endDate: '2026-09-10',
    reason: 'Upcoming Regional Roadshow'
  }
];

// Initial Requisitions representing all 4 stages
export const initialRequisitions: ITRequisitionTicket[] = [
  {
    id: 'req-101',
    ticketCode: 'REQ-2026-0042',
    title: 'MacBook Pro Display Flickering & Battery Overheating',
    category: 'Hardware Fault & Repair',
    priority: 'High',
    slaTargetHours: 8,
    description: 'During 3D rendering and compilation, the built-in screen flashes with horizontal purple artifacts and battery drops 30% in 15 mins.',
    location: 'HQ - Floor 4, Desk E-412',
    createdAt: '2026-08-15 09:30 AM',
    status: 'IN_PROGRESS',
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
      id: 'a1',
      code: 'AST-0001',
      name: 'MacBook Pro 16" M3',
      type: 'Laptop',
      serialNumber: 'C02XK1ABJGH',
      location: 'HQ - Floor 4',
      isMyAssignedAsset: true,
      purchaseCost: 3299,
      currentValue: 2800
    },
    departmentApproval: {
      status: 'Approved',
      approverName: 'Sarah Jenkins (VP of Engineering)',
      approverTitle: 'VP of Engineering',
      isDelegated: true,
      delegatedBy: 'David Chen (Acting Lead Engineer)',
      approvedAt: '2026-08-15 10:15 AM',
      comments: 'Approved under urgent engineering priority. Please expedite diagnostic with Apple Authorised Center.'
    },
    itAssignment: {
      assignedBy: 'Michael Chang (IT Operations Lead)',
      assignedAt: '2026-08-15 11:00 AM',
      technicianId: 'tech-1',
      technicianName: 'Alex Rivera',
      technicianRole: 'Lead Hardware Specialist',
      technicianAvatar: 'bg-brand-600',
      estimatedCost: 350,
      targetResolutionDate: '2026-08-17'
    },
    itExecution: {
      currentStatus: 'In-Progress',
      diagnosticNotes: 'Ran Apple Service Toolkit Diagnostics. Display cable flex connector seated properly; logic board GPU thermal paste re-applied. Currently stress-testing thermal dissipation.',
      partsUsed: ['Thermal Interface Material (Kyronaut)', 'Display Flex Gasket'],
      actualCost: 120,
      downtimeHours: 4.5
    },
    timeline: [
      {
        id: 'tl-1',
        stage: 'Creation',
        actorName: 'Sarah Chen',
        actorRole: 'Requester (Engineering)',
        timestamp: '2026-08-15 09:30 AM',
        action: 'Created IT Requisition Ticket',
        notes: 'Asset AST-0001 selected from My Assigned Assets'
      },
      {
        id: 'tl-2',
        stage: 'Dept Approval',
        actorName: 'David Chen (Acting for Sarah Jenkins)',
        actorRole: 'Delegated Approver',
        timestamp: '2026-08-15 10:15 AM',
        action: 'Department Head Approved Request',
        notes: 'Approved via Delegation Authority. Expedite hardware triage.',
        badge: 'Delegated Approver'
      },
      {
        id: 'tl-3',
        stage: 'IT Assignment',
        actorName: 'Michael Chang',
        actorRole: 'IT Operations Lead',
        timestamp: '2026-08-15 11:00 AM',
        action: 'Assigned to Alex Rivera (Hardware Lead)',
        notes: 'High Priority SLA (8 Hours). Target: Aug 17.'
      },
      {
        id: 'tl-4',
        stage: 'In-Progress',
        actorName: 'Alex Rivera',
        actorRole: 'Assigned Technician',
        timestamp: '2026-08-15 01:30 PM',
        action: 'Status updated to In-Progress',
        notes: 'Diagnostic and thermal paste replacement underway in Lab 2.'
      }
    ]
  },
  {
    id: 'req-102',
    ticketCode: 'REQ-2026-0043',
    title: 'Dell UltraSharp 32" Secondary Monitor No Signal / Backlight Failure',
    category: 'Hardware Fault & Repair',
    priority: 'Medium',
    slaTargetHours: 24,
    description: 'Monitor power LED turns amber, USB-C video signal drops completely after 10 minutes of operation. Tried replacing cables.',
    location: 'HQ - Floor 4, Desk E-412',
    createdAt: '2026-08-16 08:45 AM',
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
      id: 'a2',
      code: 'AST-0002',
      name: 'Dell UltraSharp 32" Monitor',
      type: 'Monitor',
      serialNumber: 'DL3209UHG',
      location: 'HQ - Floor 4',
      isMyAssignedAsset: true,
      purchaseCost: 899,
      currentValue: 720
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
        id: 'tl-201',
        stage: 'Creation',
        actorName: 'Sarah Chen',
        actorRole: 'Requester (Engineering)',
        timestamp: '2026-08-16 08:45 AM',
        action: 'Created IT Requisition Ticket',
        notes: 'Submitted for Department Approval (Routed to Delegated Approver David Chen)'
      }
    ]
  },
  {
    id: 'req-103',
    ticketCode: 'REQ-2026-0041',
    title: 'Data Center Core Switch SFP+ Fiber Module Replacement',
    category: 'Network & Wi-Fi',
    priority: 'Critical',
    slaTargetHours: 2,
    description: 'Port 10G-1/1 on Cisco Catalyst 9300 reporting high CRC error rate and packet drop on primary uplink to Floor 3.',
    location: 'Data Center East - Rack 04',
    createdAt: '2026-08-14 02:00 PM',
    status: 'ON_HOLD',
    requester: {
      id: 'emp-2',
      name: 'David Kim',
      email: 'david.kim@company.com',
      jobTitle: 'DevOps & Infrastructure Lead',
      department: 'IT Operations',
      initials: 'DK',
      avatarColor: 'bg-emerald-600'
    },
    asset: {
      id: 'a7',
      code: 'AST-0007',
      name: 'Cisco Catalyst 9300',
      type: 'Router / Switch',
      serialNumber: 'CSC930017',
      location: 'Data Center East',
      isMyAssignedAsset: false,
      purchaseCost: 4200,
      currentValue: 3100
    },
    departmentApproval: {
      status: 'Approved',
      approverName: 'Michael Chang (IT Operations Lead)',
      approverTitle: 'IT Operations Lead',
      isDelegated: false,
      approvedAt: '2026-08-14 02:10 PM',
      comments: 'Critical infra ticket. Direct dispatch.'
    },
    itAssignment: {
      assignedBy: 'Michael Chang',
      assignedAt: '2026-08-14 02:15 PM',
      technicianId: 'tech-2',
      technicianName: 'Maya Lin',
      technicianRole: 'Senior Network Engineer',
      technicianAvatar: 'bg-emerald-600',
      estimatedCost: 280,
      targetResolutionDate: '2026-08-16'
    },
    itExecution: {
      currentStatus: 'On-Hold',
      holdCategory: 'Waiting for Spare Parts',
      holdReason: 'Awaiting OEM 10GBASE-LR SFP+ optical transceiver delivery from Cisco TAC partner. Expected delivery Aug 17 Morning.',
      diagnosticNotes: 'Optical loopback test confirmed failed transmitter diode on SFP module. Backup link active on 1Gbps failover.',
      partsUsed: ['Cisco SFP-10G-LR (Ordered)']
    },
    timeline: [
      {
        id: 'tl-301',
        stage: 'Creation',
        actorName: 'David Kim',
        actorRole: 'Requester (IT Ops)',
        timestamp: '2026-08-14 02:00 PM',
        action: 'Created Critical IT Ticket'
      },
      {
        id: 'tl-302',
        stage: 'Dept Approval',
        actorName: 'Michael Chang',
        actorRole: 'IT Operations Lead',
        timestamp: '2026-08-14 02:10 PM',
        action: 'Directly Approved Critical Ticket'
      },
      {
        id: 'tl-303',
        stage: 'IT Assignment',
        actorName: 'Michael Chang',
        actorRole: 'IT Operations Lead',
        timestamp: '2026-08-14 02:15 PM',
        action: 'Assigned to Maya Lin (Network Lead)'
      },
      {
        id: 'tl-304',
        stage: 'On-Hold',
        actorName: 'Maya Lin',
        actorRole: 'Senior Network Engineer',
        timestamp: '2026-08-14 04:30 PM',
        action: 'Ticket Placed On-Hold',
        notes: 'Reason: Waiting for Cisco TAC replacement transceiver delivery.'
      }
    ]
  },
  {
    id: 'req-104',
    ticketCode: 'REQ-2026-0040',
    title: 'HP LaserJet Pro M404 Paper Jam & Fuser Roller Replacement',
    category: 'Hardware Fault & Repair',
    priority: 'Low',
    slaTargetHours: 48,
    description: 'Paper crinkling and jamming inside rear output tray consistently on double-sided print jobs.',
    location: 'Branch - Boston / Operations Floor',
    createdAt: '2026-08-13 11:00 AM',
    status: 'DONE',
    requester: {
      id: 'emp-3',
      name: 'James Wilson',
      email: 'james.wilson@company.com',
      jobTitle: 'Operations Coordinator',
      department: 'Operations',
      initials: 'JW',
      avatarColor: 'bg-amber-600'
    },
    asset: {
      id: 'a4',
      code: 'AST-0004',
      name: 'HP LaserJet Pro M404',
      type: 'Printer',
      serialNumber: 'HPLJ404X1',
      location: 'Branch - Boston',
      isMyAssignedAsset: false,
      purchaseCost: 329,
      currentValue: 210
    },
    departmentApproval: {
      status: 'Approved',
      approverName: 'Karen Miller (Ops Director)',
      approverTitle: 'Ops Director',
      isDelegated: false,
      approvedAt: '2026-08-13 11:30 AM'
    },
    itAssignment: {
      assignedBy: 'Michael Chang',
      assignedAt: '2026-08-13 01:00 PM',
      technicianId: 'tech-4',
      technicianName: 'Elena Rostova',
      technicianRole: 'IT Support & Mobility Specialist',
      technicianAvatar: 'bg-amber-600',
      estimatedCost: 75,
      targetResolutionDate: '2026-08-14'
    },
    itExecution: {
      currentStatus: 'Done',
      diagnosticNotes: 'Fuser roller Teflon coating worn out after 85,000 pages.',
      resolutionNotes: 'Replaced fuser maintenance assembly and cleaned optical paper sensors. 50-page duplex test print completed without error.',
      partsUsed: ['HP RM2-5399 Fuser Kit', 'Rubber Pickup Roller'],
      actualCost: 65,
      downtimeHours: 3.0,
      completedAt: '2026-08-14 03:30 PM',
      userSatisfactionRating: 5
    },
    timeline: [
      {
        id: 'tl-401',
        stage: 'Creation',
        actorName: 'James Wilson',
        actorRole: 'Requester',
        timestamp: '2026-08-13 11:00 AM',
        action: 'Created Requisition Ticket'
      },
      {
        id: 'tl-402',
        stage: 'Dept Approval',
        actorName: 'Karen Miller',
        actorRole: 'Ops Director',
        timestamp: '2026-08-13 11:30 AM',
        action: 'Approved Maintenance Request'
      },
      {
        id: 'tl-403',
        stage: 'IT Assignment',
        actorName: 'Michael Chang',
        actorRole: 'IT Operations Lead',
        timestamp: '2026-08-13 01:00 PM',
        action: 'Assigned to Elena Rostova'
      },
      {
        id: 'tl-404',
        stage: 'Resolution',
        actorName: 'Elena Rostova',
        actorRole: 'IT Specialist',
        timestamp: '2026-08-14 03:30 PM',
        action: 'Completed and Resolved',
        notes: 'Fuser assembly replaced. User verified print test.',
        badge: 'Resolved 5★'
      }
    ]
  },
  {
    id: 'req-105',
    ticketCode: 'REQ-2026-0044',
    title: 'Request Additional 32GB RAM & NVMe SSD for AI Model Training',
    category: 'Equipment Replacement',
    priority: 'High',
    slaTargetHours: 8,
    description: 'Local memory footprint exceeded during local LLM fine-tuning and Docker containers. Requesting hardware upgrade.',
    location: 'HQ - Floor 4, Desk E-418',
    createdAt: '2026-08-16 09:15 AM',
    status: 'PENDING_IT_DISPATCH',
    requester: {
      id: 'emp-4',
      name: 'Alex Turner',
      email: 'alex.turner@company.com',
      jobTitle: 'AI Research Engineer',
      department: 'Engineering',
      initials: 'AT',
      avatarColor: 'bg-purple-600'
    },
    asset: {
      id: 'a1',
      code: 'AST-0001',
      name: 'MacBook Pro 16" M3',
      type: 'Laptop',
      serialNumber: 'C02XK1ABJGH',
      location: 'HQ - Floor 4',
      isMyAssignedAsset: true,
      purchaseCost: 3299,
      currentValue: 2800
    },
    departmentApproval: {
      status: 'Approved',
      approverName: 'Sarah Jenkins (VP of Engineering)',
      approverTitle: 'VP of Engineering',
      isDelegated: true,
      delegatedBy: 'David Chen (Acting Lead Engineer)',
      approvedAt: '2026-08-16 09:40 AM',
      comments: 'Approved for Q3 AI research sprint deliverables.'
    },
    itAssignment: {},
    itExecution: {
      currentStatus: 'Pending Dispatch'
    },
    timeline: [
      {
        id: 'tl-501',
        stage: 'Creation',
        actorName: 'Alex Turner',
        actorRole: 'Requester (Engineering)',
        timestamp: '2026-08-16 09:15 AM',
        action: 'Created Hardware Upgrade Request'
      },
      {
        id: 'tl-502',
        stage: 'Dept Approval',
        actorName: 'David Chen (Acting for Sarah Jenkins)',
        actorRole: 'Delegated Approver',
        timestamp: '2026-08-16 09:40 AM',
        action: 'Department Approved Upgrade',
        badge: 'Delegated Approver'
      }
    ]
  },
  {
    id: 'req-106',
    ticketCode: 'REQ-2026-0045',
    title: 'Dell PowerEdge R750 RAID Controller Battery Degradation',
    category: 'Preventive Maintenance',
    priority: 'Critical',
    slaTargetHours: 2,
    description: 'iDRAC alert: PERC H755 battery backup unit capacity below 40%. Write-back cache switched to write-through mode.',
    location: 'Data Center East - Rack 02',
    createdAt: '2026-08-16 07:30 AM',
    status: 'PLANNING',
    requester: {
      id: 'emp-2',
      name: 'David Kim',
      email: 'david.kim@company.com',
      jobTitle: 'DevOps & Infrastructure Lead',
      department: 'IT Operations',
      initials: 'DK',
      avatarColor: 'bg-emerald-600'
    },
    asset: {
      id: 'a5',
      code: 'AST-0005',
      name: 'Dell PowerEdge R750',
      type: 'Server',
      serialNumber: 'PER750X22',
      location: 'Data Center East',
      isMyAssignedAsset: false,
      purchaseCost: 8500,
      currentValue: 5100
    },
    departmentApproval: {
      status: 'Approved',
      approverName: 'Michael Chang',
      approverTitle: 'IT Operations Lead',
      isDelegated: false,
      approvedAt: '2026-08-16 07:45 AM'
    },
    itAssignment: {
      assignedBy: 'Michael Chang',
      assignedAt: '2026-08-16 08:00 AM',
      technicianId: 'tech-3',
      technicianName: 'Sam Taylor',
      technicianRole: 'Systems Administrator',
      technicianAvatar: 'bg-indigo-600',
      estimatedCost: 195,
      targetResolutionDate: '2026-08-16'
    },
    itExecution: {
      currentStatus: 'Planning',
      diagnosticNotes: 'Battery replacement part in stock in DC Storage Bin 4. Planning maintenance window tonight at 11:00 PM to avoid production disk I/O impact.',
      partsUsed: ['Dell PERC H755 Li-ion Battery 7.4V']
    },
    timeline: [
      {
        id: 'tl-601',
        stage: 'Creation',
        actorName: 'David Kim',
        actorRole: 'Requester',
        timestamp: '2026-08-16 07:30 AM',
        action: 'Created Critical Server Alert Ticket'
      },
      {
        id: 'tl-602',
        stage: 'Dept Approval',
        actorName: 'Michael Chang',
        actorRole: 'IT Operations Lead',
        timestamp: '2026-08-16 07:45 AM',
        action: 'Fast-Track Approved'
      },
      {
        id: 'tl-603',
        stage: 'IT Assignment',
        actorName: 'Michael Chang',
        actorRole: 'IT Operations Lead',
        timestamp: '2026-08-16 08:00 AM',
        action: 'Assigned to Sam Taylor'
      },
      {
        id: 'tl-604',
        stage: 'Planning',
        actorName: 'Sam Taylor',
        actorRole: 'SysAdmin',
        timestamp: '2026-08-16 08:30 AM',
        action: 'Scheduled Maintenance Window (11:00 PM)'
      }
    ]
  }
];

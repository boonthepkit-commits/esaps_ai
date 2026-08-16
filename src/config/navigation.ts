import {
  LayoutDashboard,
  Boxes,
  UserCheck,
  Wrench,
  KeyRound,
  ShoppingCart,
  ClipboardCheck,
  Warehouse,
  FileText,
  GitPullRequestArrow,
  FileBarChart,
  BarChart3,
  Bell,
  Users,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
    ],
  },
  {
    label: 'Assets',
    items: [
      { id: 'assets', label: 'Asset Management', icon: Boxes, group: 'Assets' },
      { id: 'assignment', label: 'Employee Management', icon: Users, group: 'Assets' },
      { id: 'maintenance', label: 'Maintenance', icon: Wrench, group: 'Assets' },
      { id: 'licenses', label: 'Software License', icon: KeyRound, group: 'Assets' },
      { id: 'inventory', label: 'Inventory', icon: Warehouse, group: 'Assets' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'procurement', label: 'Procurement', icon: ShoppingCart, group: 'Operations' },
      { id: 'audit', label: 'Audit', icon: ClipboardCheck, group: 'Operations' },
      { id: 'documents', label: 'Document Management', icon: FileText, group: 'Operations' },
      { id: 'approvals', label: 'Approval Workflow', icon: GitPullRequestArrow, group: 'Operations' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { id: 'reports', label: 'Reports', icon: FileBarChart, group: 'Insights' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, group: 'Insights' },
      { id: 'notifications', label: 'Notification Center', icon: Bell, group: 'Insights' },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'administration', label: 'Administration', icon: Users, group: 'System' },
      { id: 'settings', label: 'System Settings', icon: Settings, group: 'System' },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);

export const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Executive Dashboard', subtitle: 'Real-time overview of your asset portfolio' },
  assets: { title: 'Asset Management', subtitle: 'Track and manage all organizational assets' },
  'asset-detail': { title: 'Asset Details', subtitle: 'Comprehensive asset information' },
  'create-asset': { title: 'Create Asset', subtitle: 'Register a new asset in the system' },
  assignment: { title: 'Employee Management', subtitle: 'Manage employees and their assigned assets' },
  maintenance: { title: 'Maintenance', subtitle: 'Schedule and track asset maintenance' },
  licenses: { title: 'Software Licenses', subtitle: 'Monitor license usage and renewals' },
  inventory: { title: 'Inventory', subtitle: 'Warehouse stock and supplies' },
  procurement: { title: 'Procurement', subtitle: 'Purchase orders and vendor management' },
  audit: { title: 'Audit', subtitle: 'Asset audits and compliance' },
  documents: { title: 'Document Management', subtitle: 'Centralized document repository' },
  approvals: { title: 'Approval Workflow', subtitle: 'Review and approve pending requests' },
  reports: { title: 'Reports', subtitle: 'Generate and export asset reports' },
  analytics: { title: 'Analytics', subtitle: 'Deep insights into asset performance' },
  notifications: { title: 'Notification Center', subtitle: 'All your alerts in one place' },
  administration: { title: 'Administration', subtitle: 'Manage users, roles, and departments' },
  'user-management': { title: 'User Management', subtitle: 'Manage user accounts and access' },
  'role-management': { title: 'Role Management', subtitle: 'Configure roles and permissions' },
  settings: { title: 'System Settings', subtitle: 'Configure platform preferences' },
  profile: { title: 'Profile', subtitle: 'Manage your account and preferences' },
};

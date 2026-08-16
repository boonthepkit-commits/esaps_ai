import {
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Printer,
  Server,
  Router,
  Headphones,
  Camera,
  Projector,
  type LucideIcon,
} from 'lucide-react';

export type AssetStatus = 'Available' | 'Assigned' | 'In Maintenance' | 'Retired';
export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface AssetSpec {
  label: string;
  value: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  type: string;
  status: AssetStatus;
  condition: AssetCondition;
  location: string;
  department: string;
  assignedTo: string | null;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  warrantyExpiry: string;
  vendor: string;
  serialNumber: string;
  icon: LucideIcon;
  specs: AssetSpec[];
  assignedDate?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  title: string;
  department: string;
  location: string;
  manager: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  avatarColor: string;
  initials: string;
  assignedCount: number;
}

export interface MaintenanceRecord {
  id: string;
  assetCode: string;
  assetName: string;
  type: 'Preventive' | 'Corrective' | 'Upgrade' | 'Inspection';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  scheduledDate: string;
  vendor: string;
  cost: number;
  technician: string;
}

export interface SoftwareLicense {
  id: string;
  product: string;
  vendor: string;
  type: 'Perpetual' | 'Subscription' | 'Volume';
  seatsPurchased: number;
  seatsUsed: number;
  startDate: string;
  expiryDate: string;
  cost: number;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouse: string;
  quantity: number;
  minStock: number;
  unitCost: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Activity {
  id: string;
  type: 'assignment' | 'maintenance' | 'procurement' | 'license' | 'audit' | 'transfer';
  title: string;
  description: string;
  user: string;
  timestamp: string;
}

export interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  requester: string;
  date: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface AppNotification {
  id: string;
  category: 'assignment' | 'maintenance' | 'license' | 'system' | 'approval';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastActive: string;
  initials: string;
  avatarColor: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: number;
  system: boolean;
}

const iconMap = {
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Printer,
  Server,
  Router,
  Headphones,
  Camera,
  Projector,
};

export const assets: Asset[] = [
  { id: 'a1', code: 'AST-0001', name: 'MacBook Pro 16" M3', category: 'IT Hardware', type: 'Laptop', status: 'Assigned', condition: 'Excellent', location: 'HQ - Floor 4', department: 'Engineering', assignedTo: 'Sarah Chen', assignedDate: '2024-01-16', purchaseDate: '2024-01-15', purchaseCost: 3299, currentValue: 2800, warrantyExpiry: '2027-01-15', vendor: 'Apple Inc.', serialNumber: 'C02XK1ABJGH', icon: Laptop, specs: [
    { label: 'CPU', value: 'Apple M3 Max 16-core' },
    { label: 'Memory', value: '36 GB Unified' },
    { label: 'Storage', value: '1 TB SSD' },
    { label: 'Display', value: '16.2" Liquid Retina XDR' },
    { label: 'GPU', value: '40-core GPU' },
    { label: 'OS', value: 'macOS Sonoma 14.5' },
    { label: 'Battery', value: '100 Wh · 22 cycles' },
    { label: 'Ports', value: '3× Thunderbolt 4, HDMI, SDXC' },
  ] },
  { id: 'a2', code: 'AST-0002', name: 'Dell UltraSharp 32" Monitor', category: 'IT Hardware', type: 'Monitor', status: 'Assigned', condition: 'Good', location: 'HQ - Floor 4', department: 'Engineering', assignedTo: 'Sarah Chen', assignedDate: '2024-01-16', purchaseDate: '2024-01-15', purchaseCost: 899, currentValue: 720, warrantyExpiry: '2027-01-15', vendor: 'Dell Technologies', serialNumber: 'DL3209UHG', icon: Monitor, specs: [
    { label: 'Screen Size', value: '32 inches' },
    { label: 'Resolution', value: '3840 × 2160 (4K UHD)' },
    { label: 'Panel Type', value: 'IPS Black' },
    { label: 'Refresh Rate', value: '60 Hz' },
    { label: 'Ports', value: '2× HDMI 2.0, 1× DisplayPort 1.4, USB-C 3.2' },
    { label: 'Color Gamut', value: '100% sRGB, 98% DCI-P3' },
    { label: 'Brightness', value: '400 nits' },
    { label: 'Stand', value: 'Height-adjustable, tilt, swivel' },
  ] },
  { id: 'a3', code: 'AST-0003', name: 'iPhone 15 Pro', category: 'Mobile', type: 'Smartphone', status: 'Assigned', condition: 'Excellent', location: 'HQ - Floor 2', department: 'Sales', assignedTo: 'Marcus Johnson', assignedDate: '2024-03-23', purchaseDate: '2024-03-22', purchaseCost: 1199, currentValue: 1050, warrantyExpiry: '2026-03-22', vendor: 'Apple Inc.', serialNumber: 'IP15P0982', icon: Smartphone, specs: [
    { label: 'Chip', value: 'Apple A17 Pro' },
    { label: 'Memory', value: '8 GB' },
    { label: 'Storage', value: '256 GB' },
    { label: 'Display', value: '6.1" Super Retina XDR OLED' },
    { label: 'Camera', value: '48 MP main + 12 MP ultrawide + 12 MP telephoto' },
    { label: 'Battery', value: '3274 mAh · 282 cycles' },
    { label: 'OS', value: 'iOS 17.5' },
    { label: 'Connectivity', value: '5G, Wi-Fi 6E, Bluetooth 5.3' },
  ] },
  { id: 'a4', code: 'AST-0004', name: 'HP LaserJet Pro M404', category: 'Office Equipment', type: 'Printer', status: 'Available', condition: 'Good', location: 'Branch - Boston', department: 'Operations', assignedTo: null, purchaseDate: '2023-06-10', purchaseCost: 329, currentValue: 210, warrantyExpiry: '2025-06-10', vendor: 'HP Inc.', serialNumber: 'HPLJ404X1', icon: Printer, specs: [
    { label: 'Print Speed', value: '40 ppm (black)' },
    { label: 'Print Resolution', value: '1200 × 1200 dpi' },
    { label: 'Paper Size', value: 'A4, Letter, Legal' },
    { label: 'Duplex', value: 'Automatic' },
    { label: 'Connectivity', value: 'USB 2.0, Ethernet, Wi-Fi' },
    { label: 'Monthly Duty Cycle', value: '80,000 pages' },
    { label: 'Toner', value: 'HP 142A Black · 9,500 pages' },
    { label: 'Trays', value: '2 (250 + 100 sheets)' },
  ] },
  { id: 'a5', code: 'AST-0005', name: 'Dell PowerEdge R750', category: 'Infrastructure', type: 'Server', status: 'In Maintenance', condition: 'Fair', location: 'Data Center East', department: 'IT Operations', assignedTo: null, purchaseDate: '2022-11-05', purchaseCost: 8500, currentValue: 5100, warrantyExpiry: '2025-11-05', vendor: 'Dell Technologies', serialNumber: 'PER750X22', icon: Server, specs: [
    { label: 'CPU', value: '2× Intel Xeon Gold 6338 (32-core)' },
    { label: 'Memory', value: '256 GB DDR4 ECC' },
    { label: 'Storage', value: '8× 2.4 TB SAS 10K RAID 10' },
    { label: 'Network', value: '4× 10 GbE' },
    { label: 'Power Supply', value: '2× 1100W redundant' },
    { label: 'Form Factor', value: '2U Rack Server' },
    { label: 'OS', value: 'VMware ESXi 8.0' },
    { label: 'iDRAC', value: 'iDRAC9 Enterprise' },
  ] },
  { id: 'a6', code: 'AST-0006', name: 'iPad Pro 12.9"', category: 'Mobile', type: 'Tablet', status: 'Assigned', condition: 'Excellent', location: 'HQ - Floor 3', department: 'Design', assignedTo: 'Priya Patel', assignedDate: '2024-05-20', purchaseDate: '2024-05-18', purchaseCost: 1299, currentValue: 1150, warrantyExpiry: '2026-05-18', vendor: 'Apple Inc.', serialNumber: 'IPP129021', icon: Tablet, specs: [
    { label: 'Chip', value: 'Apple M2' },
    { label: 'Memory', value: '8 GB' },
    { label: 'Storage', value: '256 GB' },
    { label: 'Display', value: '12.9" Liquid Retina XDR' },
    { label: 'Camera', value: '12 MP wide + 10 MP ultrawide' },
    { label: 'Battery', value: '10758 mAh · 45 cycles' },
    { label: 'OS', value: 'iPadOS 17.5' },
    { label: 'Accessories', value: 'Apple Pencil 2, Magic Keyboard' },
  ] },
  { id: 'a7', code: 'AST-0007', name: 'Cisco Catalyst 9300', category: 'Infrastructure', type: 'Router', status: 'Assigned', condition: 'Good', location: 'Data Center East', department: 'IT Operations', assignedTo: 'David Kim', assignedDate: '2023-03-01', purchaseDate: '2023-02-28', purchaseCost: 4200, currentValue: 3100, warrantyExpiry: '2026-02-28', vendor: 'Cisco Systems', serialNumber: 'CSC930017', icon: Router, specs: [
    { label: 'Model', value: 'C9300-48T' },
    { label: 'Ports', value: '48× 1 GbE + 4× 10 GbE Uplink' },
    { label: 'Switching Capacity', value: '128 Gbps' },
    { label: 'Forwarding Rate', value: '95 Mpps' },
    { label: 'PoE', value: 'PoE+ (30W per port)' },
    { label: 'Stacking', value: 'StackWise-480' },
    { label: 'OS', value: 'Cisco IOS XE 17.9' },
    { label: 'Power', value: '2× 715W AC' },
  ] },
  { id: 'a8', code: 'AST-0008', name: 'Sony A7 IV Camera', category: 'Media Equipment', type: 'Camera', status: 'Available', condition: 'Excellent', location: 'HQ - Floor 1', department: 'Marketing', assignedTo: null, purchaseDate: '2024-02-12', purchaseCost: 2499, currentValue: 2200, warrantyExpiry: '2026-02-12', vendor: 'Sony Electronics', serialNumber: 'SNYA7IV08', icon: Camera, specs: [
    { label: 'Sensor', value: '33 MP Full-frame CMOS' },
    { label: 'Video', value: '4K 60p, 10-bit 4:2:2' },
    { label: 'ISO Range', value: '100–51,200' },
    { label: 'Autofocus', value: '759 phase-detection points' },
    { label: 'Stabilization', value: '5-axis in-body (5.5 stops)' },
    { label: 'Memory', value: '2× SD card slots (CFexpress Type A)' },
    { label: 'Battery', value: 'NP-FZ100 · 580 shots' },
    { label: 'Lens Kit', value: 'Sony 28-70mm f/3.5-5.6' },
  ] },
  { id: 'a9', code: 'AST-0009', name: 'Epson PowerLite Projector', category: 'Office Equipment', type: 'Projector', status: 'Assigned', condition: 'Fair', location: 'HQ - Floor 1', department: 'Operations', assignedTo: 'Conference Room A', assignedDate: '2022-09-01', purchaseDate: '2022-08-20', purchaseCost: 899, currentValue: 450, warrantyExpiry: '2024-08-20', vendor: 'Epson America', serialNumber: 'EPPL0912', icon: Projector, specs: [
    { label: 'Brightness', value: '3,000 lumens' },
    { label: 'Resolution', value: '1920 × 1080 (Full HD)' },
    { label: 'Lamp Life', value: '6,000 hours (eco mode)' },
    { label: 'Throw Ratio', value: '1.48–1.77:1' },
    { label: 'Connectivity', value: '2× HDMI, USB, VGA, RJ-45' },
    { label: 'Speaker', value: '16W built-in' },
    { label: 'Lamp Hours Used', value: '4,200 hours' },
    { label: 'Mount', value: 'Ceiling mount installed' },
  ] },
  { id: 'a10', code: 'AST-0010', name: 'Bose Noise-Canceling Headphones', category: 'IT Hardware', type: 'Headphones', status: 'Assigned', condition: 'Good', location: 'Remote', department: 'Engineering', assignedTo: 'Elena Rodriguez', assignedDate: '2024-04-05', purchaseDate: '2024-04-03', purchaseCost: 379, currentValue: 320, warrantyExpiry: '2026-04-03', vendor: 'Bose Corporation', serialNumber: 'BSNC7005', icon: Headphones, specs: [
    { label: 'Model', value: 'QuietComfort Ultra' },
    { label: 'Type', value: 'Over-ear, wireless' },
    { label: 'Battery Life', value: '24 hours (ANC on)' },
    { label: 'Noise Cancellation', value: 'Adaptive ANC' },
    { label: 'Bluetooth', value: '5.3 with multipoint' },
    { label: 'Codecs', value: 'SBC, AAC, aptX Adaptive' },
    { label: 'Charging', value: 'USB-C' },
    { label: 'Weight', value: '254 g' },
  ] },
  { id: 'a11', code: 'AST-0011', name: 'MacBook Air M2', category: 'IT Hardware', type: 'Laptop', status: 'Available', condition: 'Excellent', location: 'HQ - Floor 4', department: 'Engineering', assignedTo: null, purchaseDate: '2024-06-15', purchaseCost: 1199, currentValue: 1100, warrantyExpiry: '2027-06-15', vendor: 'Apple Inc.', serialNumber: 'C02MBA22J', icon: Laptop, specs: [
    { label: 'CPU', value: 'Apple M2 8-core' },
    { label: 'Memory', value: '16 GB Unified' },
    { label: 'Storage', value: '512 GB SSD' },
    { label: 'Display', value: '13.6" Liquid Retina' },
    { label: 'GPU', value: '10-core GPU' },
    { label: 'OS', value: 'macOS Sonoma 14.5' },
    { label: 'Battery', value: '52.6 Wh · 14 cycles' },
    { label: 'Ports', value: '2× Thunderbolt 3, MagSafe 3' },
  ] },
  { id: 'a12', code: 'AST-0012', name: 'ThinkPad X1 Carbon Gen 11', category: 'IT Hardware', type: 'Laptop', status: 'Assigned', condition: 'Good', location: 'Branch - Austin', department: 'Finance', assignedTo: 'James Wilson', assignedDate: '2023-09-15', purchaseDate: '2023-09-12', purchaseCost: 1899, currentValue: 1200, warrantyExpiry: '2026-09-12', vendor: 'Lenovo', serialNumber: 'TPX1C11G', icon: Laptop, specs: [
    { label: 'CPU', value: 'Intel Core i7-1365U vPro' },
    { label: 'Memory', value: '32 GB LPDDR5' },
    { label: 'Storage', value: '1 TB NVMe SSD' },
    { label: 'Display', value: '14" 2.8K OLED' },
    { label: 'GPU', value: 'Intel Iris Xe' },
    { label: 'OS', value: 'Windows 11 Pro 23H2' },
    { label: 'Battery', value: '57 Wh · 120 cycles' },
    { label: 'Ports', value: '2× Thunderbolt 4, 2× USB-A, HDMI' },
  ] },
  { id: 'a13', code: 'AST-0013', name: 'Dell OptiPlex 7090', category: 'IT Hardware', type: 'Monitor', status: 'Retired', condition: 'Poor', location: 'Storage - Warehouse', department: 'Operations', assignedTo: null, purchaseDate: '2021-03-15', purchaseCost: 1099, currentValue: 0, warrantyExpiry: '2024-03-15', vendor: 'Dell Technologies', serialNumber: 'DLOP7090X', icon: Monitor, specs: [
    { label: 'CPU', value: 'Intel Core i5-11400' },
    { label: 'Memory', value: '16 GB DDR4' },
    { label: 'Storage', value: '512 GB SATA SSD' },
    { label: 'Form Factor', value: 'Micro' },
    { label: 'GPU', value: 'Intel UHD Graphics 730' },
    { label: 'OS', value: 'Windows 10 Pro (retired)' },
    { label: 'Ports', value: '4× USB-A, 2× DisplayPort, Ethernet' },
    { label: 'Condition Notes', value: 'Fan failure, motherboard issues' },
  ] },
  { id: 'a14', code: 'AST-0014', name: 'Samsung Galaxy S23', category: 'Mobile', type: 'Smartphone', status: 'Available', condition: 'Good', location: 'Branch - Boston', department: 'Sales', assignedTo: null, purchaseDate: '2023-12-01', purchaseCost: 799, currentValue: 580, warrantyExpiry: '2025-12-01', vendor: 'Samsung Electronics', serialNumber: 'SGS2311X', icon: Smartphone, specs: [
    { label: 'Chip', value: 'Snapdragon 8 Gen 2' },
    { label: 'Memory', value: '8 GB' },
    { label: 'Storage', value: '128 GB' },
    { label: 'Display', value: '6.1" Dynamic AMOLED 2X' },
    { label: 'Camera', value: '50 MP main + 12 MP ultrawide + 10 MP telephoto' },
    { label: 'Battery', value: '3900 mAh · 198 cycles' },
    { label: 'OS', value: 'Android 14 / One UI 6.1' },
    { label: 'Connectivity', value: '5G, Wi-Fi 6E, Bluetooth 5.3' },
  ] },
  { id: 'a15', code: 'AST-0015', name: 'Surface Pro 9', category: 'Mobile', type: 'Tablet', status: 'In Maintenance', condition: 'Fair', location: 'HQ - Floor 3', department: 'Design', assignedTo: null, purchaseDate: '2023-07-22', purchaseCost: 1599, currentValue: 980, warrantyExpiry: '2026-07-22', vendor: 'Microsoft', serialNumber: 'SP91599X', icon: Tablet, specs: [
    { label: 'CPU', value: 'Intel Core i7-1255U' },
    { label: 'Memory', value: '16 GB LPDDR5' },
    { label: 'Storage', value: '512 GB SSD' },
    { label: 'Display', value: '13" PixelSense Flow 120Hz' },
    { label: 'GPU', value: 'Intel Iris Xe' },
    { label: 'OS', value: 'Windows 11 Pro 23H2' },
    { label: 'Battery', value: '47.7 Wh · 340 cycles' },
    { label: 'Accessories', value: 'Surface Pro Signature Keyboard, Surface Pen' },
  ] },
];

export const employees: Employee[] = [
  { id: 'e1', name: 'Sarah Chen', email: 'sarah.chen@raise.co', jobTitle: 'Senior Software Engineer', title: 'Senior Software Engineer', department: 'Engineering', location: 'HQ - Floor 4', manager: 'David Kim', status: 'Active', avatarColor: 'bg-brand-500', initials: 'SC', assignedCount: 2 },
  { id: 'e2', name: 'Marcus Johnson', email: 'marcus.j@raise.co', jobTitle: 'Account Executive', title: 'Account Executive', department: 'Sales', location: 'HQ - Floor 2', manager: 'Sarah Chen', status: 'Active', avatarColor: 'bg-accent-500', initials: 'MJ', assignedCount: 1 },
  { id: 'e3', name: 'Priya Patel', email: 'priya.p@raise.co', jobTitle: 'Product Designer', title: 'Product Designer', department: 'Design', location: 'HQ - Floor 3', manager: 'Sarah Chen', status: 'Active', avatarColor: 'bg-success-500', initials: 'PP', assignedCount: 1 },
  { id: 'e4', name: 'David Kim', email: 'david.kim@raise.co', jobTitle: 'Network Engineer', title: 'Network Engineer', department: 'IT Operations', location: 'Data Center East', manager: 'Alex Morgan', status: 'Active', avatarColor: 'bg-warning-500', initials: 'DK', assignedCount: 1 },
  { id: 'e5', name: 'Elena Rodriguez', email: 'elena.r@raise.co', jobTitle: 'DevOps Engineer', title: 'DevOps Engineer', department: 'Engineering', location: 'Remote', manager: 'Sarah Chen', status: 'Active', avatarColor: 'bg-error-500', initials: 'ER', assignedCount: 1 },
  { id: 'e6', name: 'James Wilson', email: 'james.w@raise.co', jobTitle: 'Financial Analyst', title: 'Financial Analyst', department: 'Finance', location: 'Branch - Austin', manager: 'Alex Morgan', status: 'Active', avatarColor: 'bg-brand-600', initials: 'JW', assignedCount: 1 },
  { id: 'e7', name: 'Olivia Brown', email: 'olivia.b@raise.co', jobTitle: 'Sales Representative', title: 'Sales Representative', department: 'Sales', location: 'Branch - Boston', manager: 'Marcus Johnson', status: 'Active', avatarColor: 'bg-accent-600', initials: 'OB', assignedCount: 0 },
];

export const maintenanceRecords: MaintenanceRecord[] = [
  { id: 'm1', assetCode: 'AST-0005', assetName: 'Dell PowerEdge R750', type: 'Corrective', status: 'In Progress', priority: 'High', scheduledDate: '2025-07-28', vendor: 'Dell ProSupport', cost: 1200, technician: 'David Kim' },
  { id: 'm2', assetCode: 'AST-0015', assetName: 'Surface Pro 9', type: 'Corrective', status: 'In Progress', priority: 'Medium', scheduledDate: '2025-07-28', vendor: 'Microsoft Complete', cost: 350, technician: 'IT Helpdesk' },
  { id: 'm3', assetCode: 'AST-0009', assetName: 'Epson PowerLite Projector', type: 'Preventive', status: 'Overdue', priority: 'Low', scheduledDate: '2025-07-20', vendor: 'Epson Service', cost: 120, technician: 'Facilities Team' },
  { id: 'm4', assetCode: 'AST-0001', assetName: 'MacBook Pro 16" M3', type: 'Inspection', status: 'Scheduled', priority: 'Low', scheduledDate: '2025-08-02', vendor: 'Internal IT', cost: 0, technician: 'IT Helpdesk' },
  { id: 'm5', assetCode: 'AST-0007', assetName: 'Cisco Catalyst 9300', type: 'Upgrade', status: 'Scheduled', priority: 'Medium', scheduledDate: '2025-08-05', vendor: 'Cisco SMARTnet', cost: 800, technician: 'David Kim' },
  { id: 'm6', assetCode: 'AST-0013', assetName: 'Dell OptiPlex 7090', type: 'Inspection', status: 'Completed', priority: 'Low', scheduledDate: '2025-07-15', vendor: 'Internal IT', cost: 0, technician: 'IT Helpdesk' },
  { id: 'm7', assetCode: 'AST-0004', assetName: 'HP LaserJet Pro M404', type: 'Preventive', status: 'Completed', priority: 'Low', scheduledDate: '2025-07-12', vendor: 'HP CarePack', cost: 90, technician: 'Facilities Team' },
];

export const softwareLicenses: SoftwareLicense[] = [
  { id: 'l1', product: 'Microsoft 365 E5', vendor: 'Microsoft', type: 'Subscription', seatsPurchased: 500, seatsUsed: 412, startDate: '2025-01-01', expiryDate: '2026-01-01', cost: 285000, status: 'Active' },
  { id: 'l2', product: 'JetBrains All Products Pack', vendor: 'JetBrains', type: 'Subscription', seatsPurchased: 80, seatsUsed: 74, startDate: '2024-09-01', expiryDate: '2025-09-01', cost: 19200, status: 'Expiring Soon' },
  { id: 'l3', product: 'Adobe Creative Cloud', vendor: 'Adobe', type: 'Subscription', seatsPurchased: 40, seatsUsed: 38, startDate: '2024-11-15', expiryDate: '2025-11-15', cost: 14400, status: 'Active' },
  { id: 'l4', product: 'Figma Organization', vendor: 'Figma', type: 'Subscription', seatsPurchased: 60, seatsUsed: 55, startDate: '2025-02-01', expiryDate: '2026-02-01', cost: 36000, status: 'Active' },
  { id: 'l5', product: 'Slack Business+', vendor: 'Salesforce', type: 'Subscription', seatsPurchased: 500, seatsUsed: 487, startDate: '2024-12-01', expiryDate: '2025-12-01', cost: 180000, status: 'Active' },
  { id: 'l6', product: 'GitHub Enterprise', vendor: 'GitHub', type: 'Subscription', seatsPurchased: 120, seatsUsed: 118, startDate: '2024-08-01', expiryDate: '2025-08-01', cost: 43200, status: 'Expiring Soon' },
  { id: 'l7', product: 'Zoom Phone Pro', vendor: 'Zoom', type: 'Subscription', seatsPurchased: 200, seatsUsed: 156, startDate: '2025-03-01', expiryDate: '2026-03-01', cost: 36000, status: 'Active' },
  { id: 'l8', product: 'Oracle Database 19c', vendor: 'Oracle', type: 'Perpetual', seatsPurchased: 8, seatsUsed: 8, startDate: '2021-06-01', expiryDate: '2025-06-01', cost: 96000, status: 'Expired' },
];

export const inventoryItems: InventoryItem[] = [
  { id: 'i1', sku: 'INV-1001', name: 'Logitech MX Master 3S', category: 'Accessory', warehouse: 'HQ Storage', quantity: 45, minStock: 20, unitCost: 99, status: 'In Stock' },
  { id: 'i2', sku: 'INV-1002', name: 'Dell USB-C Dock', category: 'Accessory', warehouse: 'HQ Storage', quantity: 12, minStock: 15, unitCost: 199, status: 'Low Stock' },
  { id: 'i3', sku: 'INV-1003', name: '27" 4K Monitor', category: 'Display', warehouse: 'Boston Branch', quantity: 8, minStock: 5, unitCost: 450, status: 'In Stock' },
  { id: 'i4', sku: 'INV-1004', name: 'Mechanical Keyboard', category: 'Accessory', warehouse: 'HQ Storage', quantity: 0, minStock: 10, unitCost: 140, status: 'Out of Stock' },
  { id: 'i5', sku: 'INV-1005', name: 'Cat6 Ethernet Cable 3m', category: 'Cabling', warehouse: 'Austin Branch', quantity: 120, minStock: 50, unitCost: 12, status: 'In Stock' },
  { id: 'i6', sku: 'INV-1006', name: 'UPS Battery Backup', category: 'Power', warehouse: 'Data Center East', quantity: 6, minStock: 4, unitCost: 320, status: 'In Stock' },
  { id: 'i7', sku: 'INV-1007', name: 'Webcam 1080p', category: 'Accessory', warehouse: 'HQ Storage', quantity: 18, minStock: 15, unitCost: 85, status: 'In Stock' },
  { id: 'i8', sku: 'INV-1008', name: 'Laptop Stand Adjustable', category: 'Accessory', warehouse: 'Boston Branch', quantity: 7, minStock: 10, unitCost: 45, status: 'Low Stock' },
];

export const activities: Activity[] = [
  { id: 'ac1', type: 'assignment', title: 'Asset Assigned', description: 'MacBook Pro 16" assigned to Sarah Chen', user: 'Admin', timestamp: '2 minutes ago' },
  { id: 'ac2', type: 'maintenance', title: 'Maintenance Scheduled', description: 'Preventive maintenance for Cisco Catalyst 9300', user: 'David Kim', timestamp: '1 hour ago' },
  { id: 'ac3', type: 'procurement', title: 'Purchase Order Approved', description: 'PO-2025-0142 for 25 Logitech mice approved', user: 'James Wilson', timestamp: '3 hours ago' },
  { id: 'ac4', type: 'license', title: 'License Renewal', description: 'JetBrains All Products Pack renewed for 80 seats', user: 'Admin', timestamp: '5 hours ago' },
  { id: 'ac5', type: 'transfer', title: 'Asset Transferred', description: 'iPhone 15 Pro transferred from HQ to Boston Branch', user: 'Marcus Johnson', timestamp: 'Yesterday' },
  { id: 'ac6', type: 'audit', title: 'Audit Completed', description: 'Q2 IT hardware audit completed — 14 discrepancies found', user: 'Auditor', timestamp: 'Yesterday' },
];

export const approvals: ApprovalItem[] = [
  { id: 'ap1', type: 'Asset Disposal', title: 'Dispose Dell OptiPlex 7090 (AST-0013)', requester: 'Operations', date: '2025-07-28', priority: 'Medium' },
  { id: 'ap2', type: 'Procurement', title: 'Purchase 50 ergonomic chairs — $24,500', requester: 'Facilities', date: '2025-07-27', priority: 'High' },
  { id: 'ap3', type: 'License Renewal', title: 'Renew GitHub Enterprise — $43,200', requester: 'Engineering', date: '2025-07-26', priority: 'High' },
  { id: 'ap4', type: 'Asset Transfer', title: 'Transfer Surface Pro 9 to Design team', requester: 'IT Operations', date: '2025-07-25', priority: 'Low' },
];

export const notifications: AppNotification[] = [
  { id: 'n1', category: 'maintenance', title: 'Maintenance Overdue', message: 'Epson PowerLite Projector maintenance is 8 days overdue', timestamp: '10 min ago', read: false },
  { id: 'n2', category: 'license', title: 'License Expiring', message: 'JetBrains All Products Pack expires in 34 days', timestamp: '1 hour ago', read: false },
  { id: 'n3', category: 'license', title: 'License Expired', message: 'Oracle Database 19c license has expired', timestamp: '2 hours ago', read: false },
  { id: 'n4', category: 'approval', title: 'Approval Required', message: 'Asset disposal request awaiting your approval', timestamp: '3 hours ago', read: false },
  { id: 'n5', category: 'assignment', title: 'New Assignment', message: 'MacBook Pro 16" was assigned to Sarah Chen', timestamp: '5 hours ago', read: true },
  { id: 'n6', category: 'system', title: 'System Update', message: 'RAISE v4.2 deployed successfully', timestamp: 'Yesterday', read: true },
];

export const users: User[] = [
  { id: 'u1', name: 'Alex Morgan', email: 'alex.morgan@raise.co', role: 'System Administrator', department: 'IT Operations', status: 'Active', lastActive: '2 min ago', initials: 'AM', avatarColor: 'bg-brand-500' },
  { id: 'u2', name: 'Sarah Chen', email: 'sarah.chen@raise.co', role: 'Asset Manager', department: 'Engineering', status: 'Active', lastActive: '15 min ago', initials: 'SC', avatarColor: 'bg-accent-500' },
  { id: 'u3', name: 'Marcus Johnson', email: 'marcus.j@raise.co', role: 'Viewer', department: 'Sales', status: 'Active', lastActive: '1 hour ago', initials: 'MJ', avatarColor: 'bg-success-500' },
  { id: 'u4', name: 'Priya Patel', email: 'priya.p@raise.co', role: 'Editor', department: 'Design', status: 'Active', lastActive: '3 hours ago', initials: 'PP', avatarColor: 'bg-warning-500' },
  { id: 'u5', name: 'David Kim', email: 'david.kim@raise.co', role: 'Maintenance Manager', department: 'IT Operations', status: 'Active', lastActive: 'Yesterday', initials: 'DK', avatarColor: 'bg-error-500' },
  { id: 'u6', name: 'Elena Rodriguez', email: 'elena.r@raise.co', role: 'Editor', department: 'Engineering', status: 'Inactive', lastActive: '3 days ago', initials: 'ER', avatarColor: 'bg-brand-600' },
  { id: 'u7', name: 'James Wilson', email: 'james.w@raise.co', role: 'Procurement Officer', department: 'Finance', status: 'Active', lastActive: '5 hours ago', initials: 'JW', avatarColor: 'bg-accent-600' },
  { id: 'u8', name: 'Olivia Brown', email: 'olivia.b@raise.co', role: 'Viewer', department: 'Sales', status: 'Suspended', lastActive: '2 weeks ago', initials: 'OB', avatarColor: 'bg-success-600' },
];

export const roles: Role[] = [
  { id: 'r1', name: 'System Administrator', description: 'Full access to all modules, settings, and user management', users: 1, permissions: 48, system: true },
  { id: 'r2', name: 'Asset Manager', description: 'Manage assets, assignments, transfers, and disposals', users: 3, permissions: 32, system: false },
  { id: 'r3', name: 'Maintenance Manager', description: 'Schedule and track maintenance, manage vendors', users: 2, permissions: 18, system: false },
  { id: 'r4', name: 'Procurement Officer', description: 'Create purchase orders, manage vendors and contracts', users: 1, permissions: 14, system: false },
  { id: 'r5', name: 'Editor', description: 'View and edit asset details, add documents and comments', users: 12, permissions: 16, system: false },
  { id: 'r6', name: 'Viewer', description: 'Read-only access to dashboards and reports', users: 28, permissions: 6, system: true },
];

export const departments = ['Engineering', 'Sales', 'Design', 'IT Operations', 'Finance', 'Operations', 'Marketing'];
export const locations = ['HQ - Floor 1', 'HQ - Floor 2', 'HQ - Floor 3', 'HQ - Floor 4', 'Branch - Boston', 'Branch - Austin', 'Data Center East', 'Remote', 'Storage - Warehouse'];

// KPI summary
export const kpis = {
  totalAssets: 1248,
  available: 486,
  assigned: 612,
  inMaintenance: 34,
  expiredWarranty: 89,
  softwareLicenses: 8,
  monthlyDepreciation: 42800,
  monthlyCost: 156200,
};

// Chart data
export const assetLifecycleData = [
  { month: 'Jan', acquired: 32, retired: 8 },
  { month: 'Feb', acquired: 28, retired: 12 },
  { month: 'Mar', acquired: 45, retired: 6 },
  { month: 'Apr', acquired: 38, retired: 15 },
  { month: 'May', acquired: 52, retired: 10 },
  { month: 'Jun', acquired: 41, retired: 18 },
  { month: 'Jul', acquired: 36, retired: 9 },
];

export const departmentDistribution = [
  { department: 'Engineering', count: 342, color: 'bg-brand-500' },
  { department: 'Sales', count: 218, color: 'bg-accent-500' },
  { department: 'IT Operations', count: 286, color: 'bg-success-500' },
  { department: 'Design', count: 124, color: 'bg-warning-500' },
  { department: 'Finance', count: 98, color: 'bg-error-500' },
  { department: 'Operations', count: 180, color: 'bg-surface-500' },
];

export const assetTypeDistribution = [
  { type: 'Laptops', count: 412, color: 'bg-brand-500' },
  { type: 'Monitors', count: 298, color: 'bg-accent-500' },
  { type: 'Mobile', count: 186, color: 'bg-success-500' },
  { type: 'Servers', count: 64, color: 'bg-warning-500' },
  { type: 'Peripherals', count: 288, color: 'bg-error-500' },
];

export { iconMap };

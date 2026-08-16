import { useState, useMemo } from 'react';
import {
  UserPlus,
  Users,
  UserCheck,
  Package,
  Mail,
  MapPin,
  Briefcase,
  Shield,
  Eye,
  Plus,
  ArrowRightLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Laptop,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  StatusBadge,
  Avatar,
  Drawer,
  Modal,
  Select,
  Input,
  useToast,
  EmptyState,
} from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import {
  assets as initialAssets,
  employees as initialEmployees,
  departments,
  locations,
  type Asset,
  type Employee,
} from '@/data/mockData';

interface AssignmentProps {
  onNavigate: (id: string, assetId?: string) => void;
}

export function Assignment({ onNavigate }: AssignmentProps) {
  const { push } = useToast();

  // Primary State
  const [employeeList, setEmployeeList] = useState<Employee[]>(initialEmployees);
  const [assetList, setAssetList] = useState<Asset[]>(initialAssets);
  const [viewMode, setViewMode] = useState<'employees' | 'assets'>('employees');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal / Drawer States
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeDetailOpen, setEmployeeDetailOpen] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedAssetForTransfer, setSelectedAssetForTransfer] = useState<Asset | null>(null);

  // Form State: Add Employee
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpTitle, setNewEmpTitle] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpDept, setNewEmpDept] = useState(departments[0] || 'Engineering');
  const [newEmpLoc, setNewEmpLoc] = useState(locations[0] || 'HQ - Floor 4');
  const [newEmpManager, setNewEmpManager] = useState('David Kim');
  const [newEmpStatus, setNewEmpStatus] = useState<'Active' | 'On Leave' | 'Inactive'>('Active');

  // Form State: Assign Asset
  const [assignEmpId, setAssignEmpId] = useState('');
  const [assignAssetId, setAssignAssetId] = useState('');
  const [assignDate, setAssignDate] = useState('2026-08-16');
  const [assignReturnDate, setAssignReturnDate] = useState('');
  const [assignType, setAssignType] = useState('Permanent');

  // Form State: Transfer Asset
  const [transferFromEmpId, setTransferFromEmpId] = useState('');
  const [transferToEmpId, setTransferToEmpId] = useState('');
  const [transferDate, setTransferDate] = useState('2026-08-16');
  const [transferReason, setTransferReason] = useState('');

  // Helper: Get assigned assets for an employee
  const getEmployeeAssets = (employeeName: string): Asset[] => {
    return assetList.filter((a) => a.assignedTo === employeeName && a.status === 'Assigned');
  };

  // KPI Calculations
  const totalEmployees = employeeList.length;
  const activeEmployees = employeeList.filter((e) => e.status === 'Active').length;
  const employeesWithAssets = employeeList.filter(
    (e) => getEmployeeAssets(e.name).length > 0
  ).length;
  const unassignedAssets = assetList.filter(
    (a) => !a.assignedTo || a.status === 'Available'
  ).length;

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return employeeList.filter((emp) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.jobTitle.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q);

      const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
      const matchesLoc = locationFilter === 'ALL' || emp.location === locationFilter;
      const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

      return matchesSearch && matchesDept && matchesLoc && matchesStatus;
    });
  }, [employeeList, searchQuery, departmentFilter, locationFilter, statusFilter]);

  // Assigned Assets for By-Asset perspective
  const assignedAssets = useMemo(() => {
    return assetList.filter((a) => a.status === 'Assigned');
  }, [assetList]);

  // Handlers
  const handleOpenEmployeeDetail = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEmployeeDetailOpen(true);
  };

  const handleOpenAssignModal = (emp?: Employee) => {
    if (emp) {
      setAssignEmpId(emp.id);
    } else if (employeeList.length > 0) {
      setAssignEmpId(employeeList[0].id);
    }

    const available = assetList.filter((a) => a.status === 'Available');
    if (available.length > 0) {
      setAssignAssetId(available[0].id);
    } else {
      setAssignAssetId('');
    }

    setAssignOpen(true);
  };

  const handleOpenTransferModal = (asset: Asset) => {
    setSelectedAssetForTransfer(asset);
    const currentHolder = employeeList.find((e) => e.name === asset.assignedTo);
    if (currentHolder) {
      setTransferFromEmpId(currentHolder.id);
    }
    const otherEmps = employeeList.filter((e) => e.name !== asset.assignedTo);
    if (otherEmps.length > 0) {
      setTransferToEmpId(otherEmps[0].id);
    }
    setTransferOpen(true);
  };

  const handleUnassignAsset = (asset: Asset) => {
    const prevHolder = asset.assignedTo;
    setAssetList((prev) =>
      prev.map((a) =>
        a.id === asset.id ? { ...a, status: 'Available', assignedTo: null, assignedDate: undefined } : a
      )
    );

    if (prevHolder) {
      setEmployeeList((prev) =>
        prev.map((e) => (e.name === prevHolder ? { ...e, assignedCount: Math.max(0, e.assignedCount - 1) } : e))
      );
    }

    push({
      variant: 'success',
      title: 'Asset unassigned',
      message: `${asset.name} (${asset.code}) has been unassigned`,
    });
  };

  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpEmail.trim() || !newEmpTitle.trim()) {
      push({
        variant: 'error',
        title: 'Missing information',
        message: 'Please fill in all required employee fields.',
      });
      return;
    }

    const initials = newEmpName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const colors = ['bg-brand-500', 'bg-accent-500', 'bg-success-500', 'bg-warning-500', 'bg-brand-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newEmp: Employee = {
      id: `e${Date.now()}`,
      name: newEmpName.trim(),
      jobTitle: newEmpTitle.trim(),
      title: newEmpTitle.trim(),
      email: newEmpEmail.trim(),
      department: newEmpDept,
      location: newEmpLoc,
      manager: newEmpManager.trim() || 'Alex Morgan',
      status: newEmpStatus,
      avatarColor: randomColor,
      initials: initials || 'EM',
      assignedCount: 0,
    };

    setEmployeeList((prev) => [newEmp, ...prev]);
    setAddEmployeeOpen(false);

    // Reset form
    setNewEmpName('');
    setNewEmpTitle('');
    setNewEmpEmail('');

    push({
      variant: 'success',
      title: 'Employee added',
      message: `${newEmp.name} has been added to Employee Management.`,
    });
  };

  const handleAssignSubmit = () => {
    const targetEmp = employeeList.find((e) => e.id === assignEmpId);
    const targetAsset = assetList.find((a) => a.id === assignAssetId);

    if (!targetEmp || !targetAsset) {
      push({
        variant: 'error',
        title: 'Assignment failed',
        message: 'Please select both an employee and an available asset.',
      });
      return;
    }

    // Update Asset
    setAssetList((prev) =>
      prev.map((a) =>
        a.id === targetAsset.id
          ? {
              ...a,
              status: 'Assigned',
              assignedTo: targetEmp.name,
              assignedDate: assignDate || '2026-08-16',
              department: targetEmp.department,
              location: targetEmp.location,
            }
          : a
      )
    );

    // Update Employee count
    setEmployeeList((prev) =>
      prev.map((e) => (e.id === targetEmp.id ? { ...e, assignedCount: e.assignedCount + 1 } : e))
    );

    setAssignOpen(false);

    push({
      variant: 'success',
      title: 'Asset assigned successfully',
      message: `${targetAsset.name} assigned to ${targetEmp.name}`,
    });
  };

  const handleTransferSubmit = () => {
    if (!selectedAssetForTransfer) return;
    const fromEmp = employeeList.find((e) => e.id === transferFromEmpId);
    const toEmp = employeeList.find((e) => e.id === transferToEmpId);

    if (!toEmp) {
      push({
        variant: 'error',
        title: 'Transfer failed',
        message: 'Please select a recipient employee.',
      });
      return;
    }

    // Update Asset
    setAssetList((prev) =>
      prev.map((a) =>
        a.id === selectedAssetForTransfer.id
          ? {
              ...a,
              assignedTo: toEmp.name,
              assignedDate: transferDate,
              department: toEmp.department,
              location: toEmp.location,
            }
          : a
      )
    );

    // Update Employee counts
    setEmployeeList((prev) =>
      prev.map((e) => {
        if (fromEmp && e.id === fromEmp.id) {
          return { ...e, assignedCount: Math.max(0, e.assignedCount - 1) };
        }
        if (e.id === toEmp.id) {
          return { ...e, assignedCount: e.assignedCount + 1 };
        }
        return e;
      })
    );

    setTransferOpen(false);

    push({
      variant: 'success',
      title: 'Asset transferred',
      message: `${selectedAssetForTransfer.name} transferred to ${toEmp.name}`,
    });
  };

  // Asset Columns for "By Asset" DataTable
  const assetColumns: Column<Asset>[] = [
    {
      key: 'name',
      header: 'Asset',
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-surface-100 flex items-center justify-center shrink-0">
            <r.icon className="h-4 w-4 text-surface-500" />
          </div>
          <div>
            <p className="font-medium text-surface-900">{r.name}</p>
            <p className="text-caption text-surface-500">{r.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'assignedTo',
      header: 'Assigned Employee',
      sortable: true,
      sortValue: (r) => r.assignedTo ?? '',
      render: (r) => {
        const emp = employeeList.find((e) => e.name === r.assignedTo);
        return r.assignedTo ? (
          <div className="flex items-center gap-2.5">
            <Avatar
              initials={r.assignedTo.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              color={emp?.avatarColor ?? 'bg-brand-500'}
              size="xs"
            />
            <div>
              <p className="text-body font-medium text-surface-900">{r.assignedTo}</p>
              {emp && <p className="text-caption text-surface-500">{emp.jobTitle}</p>}
            </div>
          </div>
        ) : (
          <span className="text-surface-400">—</span>
        );
      },
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      sortValue: (r) => r.department,
      render: (r) => <span className="text-surface-600">{r.department}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      render: (r) => <span className="text-surface-600">{r.location}</span>,
    },
    {
      key: 'assignedDate',
      header: 'Assigned Date',
      render: (r) => <span className="text-surface-600">{r.assignedDate || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Page Summary / KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4 flex items-center gap-3.5 bg-white border border-surface-200 shadow-xs">
          <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-caption font-medium text-surface-500">Employees</p>
            <p className="text-heading font-bold text-surface-900 mt-0.5">{totalEmployees}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 bg-white border border-surface-200 shadow-xs">
          <div className="h-10 w-10 rounded-lg bg-success-50 text-success-600 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-caption font-medium text-surface-500">Active Employees</p>
            <p className="text-heading font-bold text-surface-900 mt-0.5">{activeEmployees}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 bg-white border border-surface-200 shadow-xs">
          <div className="h-10 w-10 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-caption font-medium text-surface-500">Employees with Assets</p>
            <p className="text-heading font-bold text-surface-900 mt-0.5">{employeesWithAssets}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 bg-white border border-surface-200 shadow-xs">
          <div className="h-10 w-10 rounded-lg bg-surface-100 text-surface-600 flex items-center justify-center shrink-0">
            <Laptop className="h-5 w-5" />
          </div>
          <div>
            <p className="text-caption font-medium text-surface-500">Unassigned Assets</p>
            <p className="text-heading font-bold text-surface-900 mt-0.5">{unassignedAssets}</p>
          </div>
        </Card>
      </div>

      {/* 2. Controls & Actions Header */}
      <div className="flex flex-col gap-3.5 bg-white p-4 rounded-lg border border-surface-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* View Perspective Switcher */}
          <div className="flex items-center p-1 bg-surface-100 rounded-lg w-fit">
            <button
              onClick={() => setViewMode('employees')}
              className={`px-3.5 py-1.5 rounded-md text-caption font-semibold transition-all ${
                viewMode === 'employees'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              By Employee
            </button>
            <button
              onClick={() => setViewMode('assets')}
              className={`px-3.5 py-1.5 rounded-md text-caption font-semibold transition-all ${
                viewMode === 'assets'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              By Asset
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => handleOpenAssignModal()}
            >
              Assign Asset
            </Button>
            <Button
              size="sm"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={() => setAddEmployeeOpen(true)}
            >
              Add Employee
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 border-t border-surface-100">
          <Input
            placeholder="Search employees..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select
            options={[
              { value: 'ALL', label: 'All Departments' },
              ...departments.map((d) => ({ value: d, label: d })),
            ]}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          />

          <Select
            options={[
              { value: 'ALL', label: 'All Locations' },
              ...locations.map((l) => ({ value: l, label: l })),
            ]}
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />

          <Select
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'On Leave', label: 'On Leave' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Main View: By Employee (Default) */}
      {viewMode === 'employees' ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-body text-surface-500">
              Showing {filteredEmployees.length} of {employeeList.length} employees
            </p>
          </div>

          {filteredEmployees.length === 0 ? (
            <EmptyState
              title="No employees found"
              description="No employee records match your search and filter criteria."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setDepartmentFilter('ALL');
                    setLocationFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => {
                const assigned = getEmployeeAssets(emp.name);
                return (
                  <Card
                    key={emp.id}
                    className="p-5 hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-200 bg-white"
                  >
                    <div>
                      {/* Top profile banner */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar initials={emp.initials} color={emp.avatarColor} size="md" />
                          <div className="min-w-0">
                            <h3 className="text-title font-semibold text-surface-900 truncate">
                              {emp.name}
                            </h3>
                            <p className="text-caption text-surface-500 truncate">{emp.jobTitle}</p>
                          </div>
                        </div>
                        <StatusBadge status={emp.status} />
                      </div>

                      {/* Info lines */}
                      <div className="mt-4 space-y-2 text-caption text-surface-600">
                        <p className="flex items-center gap-2.5 truncate">
                          <Mail className="h-3.5 w-3.5 text-surface-400 shrink-0" />
                          <span className="truncate">{emp.email}</span>
                        </p>
                        <p className="flex items-center gap-2.5 truncate">
                          <Briefcase className="h-3.5 w-3.5 text-surface-400 shrink-0" />
                          <span className="truncate">{emp.department}</span>
                        </p>
                        <p className="flex items-center gap-2.5 truncate">
                          <MapPin className="h-3.5 w-3.5 text-surface-400 shrink-0" />
                          <span className="truncate">{emp.location}</span>
                        </p>
                      </div>

                      {/* Assigned Assets summary */}
                      <div className="mt-4 pt-3 border-t border-surface-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-caption font-medium text-surface-700">
                            Assigned Assets
                          </span>
                          <Badge variant={assigned.length > 0 ? 'brand' : 'default'}>
                            {assigned.length}
                          </Badge>
                        </div>

                        {assigned.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {assigned.slice(0, 2).map((a) => (
                              <span
                                key={a.id}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-50 border border-surface-200 text-caption text-surface-700 font-mono text-[11px]"
                              >
                                <span className="font-semibold text-brand-600">{a.code}</span>
                                <span className="text-surface-400">·</span>
                                <span className="truncate max-w-[110px] font-sans font-normal text-surface-600">
                                  {a.name}
                                </span>
                              </span>
                            ))}
                            {assigned.length > 2 && (
                              <span className="inline-flex items-center px-1.5 py-1 rounded bg-surface-100 text-caption text-surface-500 text-[11px]">
                                +{assigned.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-caption text-surface-400 italic">
                            No assets currently assigned
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-surface-100">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="h-3.5 w-3.5" />}
                        onClick={() => handleOpenEmployeeDetail(emp)}
                      >
                        View Employee
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Plus className="h-3.5 w-3.5" />}
                        onClick={() => handleOpenAssignModal(emp)}
                      >
                        Assign Asset
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* 4. Secondary View: By Asset (Asset -> Assigned Employee) */
        <DataTable
          columns={assetColumns}
          data={assignedAssets}
          searchable
          searchPlaceholder="Search assigned assets..."
          onRowClick={(row) => onNavigate('asset-detail', row.id)}
          rowActions={(row) => [
            {
              label: 'View Details',
              icon: <ChevronRight className="h-4 w-4" />,
              onClick: () => onNavigate('asset-detail', row.id),
            },
            {
              label: 'Transfer Asset',
              icon: <ArrowRightLeft className="h-4 w-4" />,
              onClick: () => handleOpenTransferModal(row),
            },
            {
              label: 'Unassign Asset',
              icon: <UserPlus className="h-4 w-4" />,
              danger: true,
              onClick: () => handleUnassignAsset(row),
            },
          ]}
          emptyTitle="No assigned assets"
          emptyDescription="There are no assets currently assigned to employees."
        />
      )}

      {/* ========================================================================= */}
      {/* 5. EMPLOYEE DETAIL DRAWER */}
      {/* ========================================================================= */}
      <Drawer
        open={employeeDetailOpen}
        onClose={() => setEmployeeDetailOpen(false)}
        title="Employee Profile"
        description="Employee details and assigned organizational assets"
        width="max-w-xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmployeeDetailOpen(false)}
            >
              Close
            </Button>
            {selectedEmployee && (
              <Button
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setEmployeeDetailOpen(false);
                  handleOpenAssignModal(selectedEmployee);
                }}
              >
                Assign Asset
              </Button>
            )}
          </div>
        }
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Profile Overview Header */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-50 border border-surface-200">
              <Avatar
                initials={selectedEmployee.initials}
                color={selectedEmployee.avatarColor}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-title font-bold text-surface-900 truncate">
                    {selectedEmployee.name}
                  </h3>
                  <StatusBadge status={selectedEmployee.status} />
                </div>
                <p className="text-body text-surface-600">{selectedEmployee.jobTitle}</p>
                <p className="text-caption text-surface-500 mt-0.5">{selectedEmployee.email}</p>
              </div>
            </div>

            {/* Profile Information Attributes */}
            <div>
              <h4 className="text-caption font-semibold text-surface-500 uppercase tracking-wider mb-3">
                Employee Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white border border-surface-200">
                  <span className="text-caption text-surface-500 block">Department</span>
                  <span className="text-body font-medium text-surface-900 mt-0.5 block">
                    {selectedEmployee.department}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-white border border-surface-200">
                  <span className="text-caption text-surface-500 block">Location</span>
                  <span className="text-body font-medium text-surface-900 mt-0.5 block">
                    {selectedEmployee.location}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-white border border-surface-200">
                  <span className="text-caption text-surface-500 block">Manager</span>
                  <span className="text-body font-medium text-surface-900 mt-0.5 block">
                    {selectedEmployee.manager || 'Alex Morgan'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-white border border-surface-200">
                  <span className="text-caption text-surface-500 block">Status</span>
                  <span className="text-body font-medium text-surface-900 mt-0.5 block">
                    {selectedEmployee.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Assets Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-caption font-semibold text-surface-500 uppercase tracking-wider">
                  Assigned Assets ({getEmployeeAssets(selectedEmployee.name).length})
                </h4>
              </div>

              {getEmployeeAssets(selectedEmployee.name).length === 0 ? (
                <div className="p-6 text-center border border-dashed border-surface-300 rounded-lg bg-surface-50">
                  <Package className="h-8 w-8 text-surface-400 mx-auto mb-2" />
                  <p className="text-body font-medium text-surface-800">No assets assigned</p>
                  <p className="text-caption text-surface-500 mt-1 mb-4">
                    This employee currently does not have any assets assigned.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => {
                      setEmployeeDetailOpen(false);
                      handleOpenAssignModal(selectedEmployee);
                    }}
                  >
                    Assign an Asset
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {getEmployeeAssets(selectedEmployee.name).map((asset) => (
                    <div
                      key={asset.id}
                      className="p-4 rounded-lg border border-surface-200 bg-white hover:border-surface-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                            <asset.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-caption font-mono font-semibold text-brand-600">
                              {asset.code}
                            </span>
                            <h5 className="text-body font-semibold text-surface-900">
                              {asset.name}
                            </h5>
                          </div>
                        </div>
                        <StatusBadge status={asset.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-surface-100 text-caption text-surface-600">
                        <div>
                          <span className="text-surface-400">Category: </span>
                          <span>{asset.category} · {asset.type}</span>
                        </div>
                        <div>
                          <span className="text-surface-400">Location: </span>
                          <span>{asset.location}</span>
                        </div>
                        <div>
                          <span className="text-surface-400">Assigned: </span>
                          <span>{asset.assignedDate || '2024-01-16'}</span>
                        </div>
                        <div>
                          <span className="text-surface-400">Condition: </span>
                          <span>{asset.condition}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-surface-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEmployeeDetailOpen(false);
                            onNavigate('asset-detail', asset.id);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<ArrowRightLeft className="h-3.5 w-3.5" />}
                          onClick={() => {
                            setEmployeeDetailOpen(false);
                            handleOpenTransferModal(asset);
                          }}
                        >
                          Transfer
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error-600 hover:text-error-700 hover:bg-error-50"
                          onClick={() => handleUnassignAsset(asset)}
                        >
                          Unassign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* 6. ADD EMPLOYEE DRAWER */}
      {/* ========================================================================= */}
      <Drawer
        open={addEmployeeOpen}
        onClose={() => setAddEmployeeOpen(false)}
        title="Add New Employee"
        description="Create a new employee profile in the organizational directory"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setAddEmployeeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployeeSubmit}>Add Employee</Button>
          </div>
        }
      >
        <form onSubmit={handleAddEmployeeSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Alex Morgan"
            value={newEmpName}
            onChange={(e) => setNewEmpName(e.target.value)}
            required
          />

          <Input
            label="Job Title *"
            placeholder="e.g. Senior DevOps Engineer"
            value={newEmpTitle}
            onChange={(e) => setNewEmpTitle(e.target.value)}
            required
          />

          <Input
            label="Work Email *"
            type="email"
            placeholder="e.g. alex.morgan@raise.co"
            value={newEmpEmail}
            onChange={(e) => setNewEmpEmail(e.target.value)}
            required
          />

          <Select
            label="Department *"
            options={departments.map((d) => ({ value: d, label: d }))}
            value={newEmpDept}
            onChange={(e) => setNewEmpDept(e.target.value)}
          />

          <Select
            label="Location *"
            options={locations.map((l) => ({ value: l, label: l }))}
            value={newEmpLoc}
            onChange={(e) => setNewEmpLoc(e.target.value)}
          />

          <Select
            label="Manager"
            options={[
              { value: 'David Kim', label: 'David Kim (IT Operations)' },
              { value: 'Sarah Chen', label: 'Sarah Chen (Engineering)' },
              { value: 'Marcus Johnson', label: 'Marcus Johnson (Sales)' },
              { value: 'Alex Morgan', label: 'Alex Morgan (Admin)' },
            ]}
            value={newEmpManager}
            onChange={(e) => setNewEmpManager(e.target.value)}
          />

          <Select
            label="Employee Status"
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'On Leave', label: 'On Leave' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            value={newEmpStatus}
            onChange={(e) =>
              setNewEmpStatus(e.target.value as 'Active' | 'On Leave' | 'Inactive')
            }
          />
        </form>
      </Drawer>

      {/* ========================================================================= */}
      {/* 7. ASSIGN ASSET DRAWER */}
      {/* ========================================================================= */}
      <Drawer
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign Asset"
        description="Select an employee and an available asset to complete assignment"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignSubmit}>Confirm Assignment</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Employee *"
            options={[
              { value: '', label: 'Select employee' },
              ...employeeList.map((e) => ({
                value: e.id,
                label: `${e.name} — ${e.jobTitle} (${e.department})`,
              })),
            ]}
            value={assignEmpId}
            onChange={(e) => setAssignEmpId(e.target.value)}
          />

          <Select
            label="Available Asset *"
            options={[
              { value: '', label: 'Select available asset' },
              ...assetList
                .filter((a) => a.status === 'Available')
                .map((a) => ({
                  value: a.id,
                  label: `${a.name} (${a.code}) — ${a.category}`,
                })),
            ]}
            value={assignAssetId}
            onChange={(e) => setAssignAssetId(e.target.value)}
            helpText={
              assetList.filter((a) => a.status === 'Available').length === 0
                ? 'No available assets in inventory. Return or create an asset first.'
                : undefined
            }
          />

          <Input
            label="Assignment Date *"
            type="date"
            value={assignDate}
            onChange={(e) => setAssignDate(e.target.value)}
          />

          <Input
            label="Expected Return Date"
            type="date"
            value={assignReturnDate}
            onChange={(e) => setAssignReturnDate(e.target.value)}
            helpText="Optional for temporary or loan assignments"
          />

          <Select
            label="Assignment Type"
            options={[
              { value: 'Permanent', label: 'Permanent' },
              { value: 'Temporary', label: 'Temporary' },
              { value: 'Loan', label: 'Loan' },
            ]}
            value={assignType}
            onChange={(e) => setAssignType(e.target.value)}
          />
        </div>
      </Drawer>

      {/* ========================================================================= */}
      {/* 8. TRANSFER ASSET DRAWER */}
      {/* ========================================================================= */}
      <Drawer
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        title="Transfer Asset"
        description="Reassign asset to a new employee"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setTransferOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransferSubmit}>Confirm Transfer</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {selectedAssetForTransfer && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-50 border border-surface-200">
              <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-body font-medium text-surface-900 truncate">
                  {selectedAssetForTransfer.name}
                </p>
                <p className="text-caption text-surface-500 font-mono">
                  {selectedAssetForTransfer.code}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center text-surface-400 py-1">
            <ArrowRightLeft className="h-5 w-5 text-brand-500" />
          </div>

          <Select
            label="From Employee"
            options={[
              { value: '', label: 'Current holder' },
              ...employeeList.map((e) => ({
                value: e.id,
                label: `${e.name} (${e.department})`,
              })),
            ]}
            value={transferFromEmpId}
            onChange={(e) => setTransferFromEmpId(e.target.value)}
          />

          <Select
            label="To New Employee *"
            options={[
              { value: '', label: 'Select new employee' },
              ...employeeList.map((e) => ({
                value: e.id,
                label: `${e.name} — ${e.jobTitle} (${e.department})`,
              })),
            ]}
            value={transferToEmpId}
            onChange={(e) => setTransferToEmpId(e.target.value)}
          />

          <Input
            label="Transfer Date"
            type="date"
            value={transferDate}
            onChange={(e) => setTransferDate(e.target.value)}
          />

          <Input
            label="Transfer Reason"
            placeholder="e.g. Department reorganization / hardware upgrade"
            value={transferReason}
            onChange={(e) => setTransferReason(e.target.value)}
          />
        </div>
      </Drawer>
    </div>
  );
}

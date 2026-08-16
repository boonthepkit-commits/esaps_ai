import { useState } from 'react';
import { Plus, MoreHorizontal, Mail, Shield, Search, UserPlus, Upload } from 'lucide-react';
import { Card, CardHeader, Button, Badge, StatusBadge, Avatar, Select, Input, useToast, ConfirmDialog, Modal } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { users, departments, type User } from '@/data/mockData';
import { cn } from '@/lib/cn';

interface UserManagementProps {
  onNavigate: (id: string) => void;
}

export function UserManagement({ onNavigate }: UserManagementProps) {
  const { push } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns: Column<User>[] = [
    { key: 'name', header: 'User', sortable: true, sortValue: (r) => r.name, render: (r) => (
      <div className="flex items-center gap-3">
        <Avatar initials={r.initials} color={r.avatarColor} size="sm" />
        <div><p className="font-medium text-surface-900">{r.name}</p><p className="text-caption text-surface-500">{r.email}</p></div>
      </div>
    ) },
    { key: 'role', header: 'Role', sortable: true, sortValue: (r) => r.role, render: (r) => <Badge variant="brand">{r.role}</Badge> },
    { key: 'department', header: 'Department', sortable: true, sortValue: (r) => r.department, render: (r) => <span className="text-surface-600">{r.department}</span> },
    { key: 'status', header: 'Status', sortable: true, sortValue: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'lastActive', header: 'Last Active', sortable: true, sortValue: (r) => r.lastActive, render: (r) => <span className="text-surface-500">{r.lastActive}</span> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="brand">{filtered.length} users</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />}>Import</Button>
          <Button size="sm" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setInviteOpen(true)}>Invite User</Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchable
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users by name or email..."
        toolbar={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
            { value: 'Suspended', label: 'Suspended' },
          ]} />
        }
        rowActions={(row) => [
          { label: 'View Profile', onClick: () => onNavigate('profile') },
          { label: 'Edit Role', onClick: () => push({ variant: 'info', title: 'Edit role', message: row.name }) },
          { label: 'Reset Password', onClick: () => push({ variant: 'success', title: 'Password reset sent', message: row.email }) },
          { divider: true, label: '' },
          { label: 'Suspend', danger: true, onClick: () => setSuspendTarget(row) },
        ]}
      />

      {/* Invite Modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite User" description="Send an invitation to join RAISE" footer={
        <>
          <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
          <Button onClick={() => { push({ variant: 'success', title: 'Invitation sent', message: 'User will receive an email invitation' }); setInviteOpen(false); }}>Send Invitation</Button>
        </>
      }>
        <div className="flex flex-col gap-4">
          <Input label="Full Name" placeholder="e.g. Jordan Smith" />
          <Input label="Email Address" type="email" placeholder="jordan@raise.co" leftIcon={<Mail className="h-4 w-4" />} />
          <Select label="Role" options={[
            { value: 'viewer', label: 'Viewer' },
            { value: 'editor', label: 'Editor' },
            { value: 'manager', label: 'Asset Manager' },
            { value: 'admin', label: 'Administrator' },
          ]} />
          <Select label="Department" options={departments.map((d) => ({ value: d, label: d }))} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={() => push({ variant: 'warning', title: 'User suspended', message: suspendTarget?.name ?? '' })}
        title="Suspend this user?"
        message={`${suspendTarget?.name} will lose access immediately. They can be reactivated at any time.`}
        confirmLabel="Suspend"
        variant="danger"
      />
    </div>
  );
}

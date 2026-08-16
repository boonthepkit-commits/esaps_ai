import { useState } from 'react';
import { Plus, Shield, Check, X, MoreHorizontal, Lock } from 'lucide-react';
import { Card, CardHeader, Button, Badge, Input, Textarea, useToast, Modal, ConfirmDialog } from '@/components/ui';
import { roles, type Role } from '@/data/mockData';
import { cn } from '@/lib/cn';

interface RoleManagementProps {
  onNavigate: (id: string) => void;
}

const permissionModules = [
  'Dashboard', 'Assets', 'Assignment', 'Maintenance', 'Licenses', 'Inventory',
  'Procurement', 'Audit', 'Documents', 'Approvals', 'Reports', 'Analytics',
  'Notifications', 'Administration', 'Settings',
];
const permissionActions = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export'];

export function RoleManagement({ onNavigate }: RoleManagementProps) {
  const { push } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role>(roles[1]);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    permissionModules.forEach((m) => {
      init[m] = new Set(['View']);
      if (selectedRole.name === 'System Administrator') init[m] = new Set(permissionActions);
      if (selectedRole.name === 'Asset Manager') init[m] = new Set(['View', 'Create', 'Edit']);
    });
    return init;
  });

  const togglePermission = (module: string, action: string) => {
    setPermissions((prev) => {
      const next = { ...prev };
      const set = new Set(next[module]);
      if (set.has(action)) set.delete(action);
      else set.add(action);
      next[module] = set;
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Role list */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-body text-surface-500">{roles.length} roles</p>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>New Role</Button>
        </div>
        <div className="flex flex-col gap-2">
          {roles.map((role) => (
            <Card key={role.id} className={cn('p-4 cursor-pointer transition-all', selectedRole.id === role.id ? 'border-brand-300 ring-1 ring-brand-200' : 'hover:shadow-sm')} >
              <div onClick={() => setSelectedRole(role)}>
                <div className="flex items-start gap-3">
                  <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', role.system ? 'bg-surface-100 text-surface-500' : 'bg-accent-50 text-accent-600')}>
                    {role.system ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-surface-900 truncate">{role.name}</p>
                    <p className="text-caption text-surface-500">{role.users} users · {role.permissions} permissions</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Permission matrix */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Card>
          <CardHeader
            title={selectedRole.name}
            description={selectedRole.description}
            action={
              <div className="flex items-center gap-2">
                {selectedRole.system ? (
                  <Badge variant="neutral">System Role</Badge>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => push({ variant: 'success', title: 'Permissions saved', message: selectedRole.name })}>Save Changes</Button>
                    <Button variant="ghost" size="sm" className="text-error-600" onClick={() => setDeleteTarget(selectedRole)}>Delete</Button>
                  </>
                )}
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-caption font-semibold text-surface-600 uppercase">Module</th>
                  {permissionActions.map((a) => (
                    <th key={a} className="px-3 py-2.5 text-center text-caption font-semibold text-surface-600 uppercase">{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {permissionModules.map((module) => (
                  <tr key={module} className="hover:bg-surface-50">
                    <td className="px-4 py-2.5 text-body font-medium text-surface-700">{module}</td>
                    {permissionActions.map((action) => {
                      const checked = permissions[module]?.has(action);
                      return (
                        <td key={action} className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => togglePermission(module, action)}
                            disabled={selectedRole.system}
                            className={cn(
                              'h-6 w-6 rounded-md inline-flex items-center justify-center transition-colors mx-auto',
                              checked ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-300 hover:bg-surface-200',
                              selectedRole.system && 'cursor-not-allowed opacity-50',
                            )}
                          >
                            {checked ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><Shield className="h-5 w-5" /></div>
            <div className="flex-1">
              <p className="text-body font-medium text-surface-900">{selectedRole.users} users assigned</p>
              <p className="text-caption text-surface-500">Changes apply immediately to all assigned users</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate('user-management')}>Manage Users</Button>
          </div>
        </Card>
      </div>

      {/* Create role modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Role" description="Define a new role with custom permissions" footer={
        <>
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={() => { push({ variant: 'success', title: 'Role created', message: 'New role has been created' }); setCreateOpen(false); }}>Create Role</Button>
        </>
      }>
        <div className="flex flex-col gap-4">
          <Input label="Role Name" placeholder="e.g. Asset Auditor" />
          <Textarea label="Description" placeholder="Describe what this role can do..." />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => push({ variant: 'warning', title: 'Role deleted', message: deleteTarget?.name ?? '' })}
        title="Delete this role?"
        message={`${deleteTarget?.name} will be removed. Users with this role will need to be reassigned.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

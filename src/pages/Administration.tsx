import { useState } from 'react';
import { Users, Shield, Building2, MapPin, Database, Plus, MoreHorizontal, ChevronRight } from 'lucide-react';
import { Card, CardHeader, Button, Badge, StatusBadge, Avatar, useToast, SectionCard } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { users, roles, departments, locations, type User } from '@/data/mockData';
import { cn } from '@/lib/cn';

interface AdministrationProps {
  onNavigate: (id: string) => void;
}

export function Administration({ onNavigate }: AdministrationProps) {
  const { push } = useToast();

  const cards = [
    { id: 'user-management', title: 'User Management', description: 'Manage user accounts and access', icon: Users, count: users.length, color: 'brand' },
    { id: 'role-management', title: 'Role Management', description: 'Configure roles and permissions', icon: Shield, count: roles.length, color: 'accent' },
    { id: 'departments', title: 'Departments', description: 'Organizational departments', icon: Building2, count: departments.length, color: 'success' },
    { id: 'locations', title: 'Locations', description: 'Physical locations and sites', icon: MapPin, count: locations.length, color: 'warning' },
    { id: 'master-data', title: 'Master Data', description: 'Categories, vendors, and types', icon: Database, count: 24, color: 'error' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer group" >
            <div onClick={() => onNavigate(c.id)}>
              <div className="flex items-start justify-between">
                <div className={cn('h-11 w-11 rounded-lg flex items-center justify-center', `bg-${c.color}-50`, `text-${c.color}-600`)}>
                  <c.icon className="h-5 w-5" />
                </div>
                <ChevronRight className="h-5 w-5 text-surface-300 group-hover:text-surface-500 transition-colors" />
              </div>
              <p className="text-title font-semibold text-surface-900 mt-4">{c.title}</p>
              <p className="text-body text-surface-500 mt-1">{c.description}</p>
              <Badge variant="neutral" className="mt-3">{c.count} items</Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent users preview */}
      <Card>
        <CardHeader title="Recent Users" description="Latest user accounts" action={<Button variant="ghost" size="sm" onClick={() => onNavigate('user-management')}>View all</Button>} />
        <div className="p-3">
          {users.slice(0, 5).map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-surface-50 transition-colors">
              <Avatar initials={u.initials} color={u.avatarColor} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-surface-900 truncate">{u.name}</p>
                <p className="text-caption text-surface-500">{u.email}</p>
              </div>
              <Badge variant="neutral">{u.role}</Badge>
              <StatusBadge status={u.status} />
            </div>
          ))}
        </div>
      </Card>

      {/* Roles overview */}
      <Card>
        <CardHeader title="Roles & Permissions" description="Access control configuration" action={<Button variant="ghost" size="sm" onClick={() => onNavigate('role-management')}>Manage roles</Button>} />
        <div className="p-3">
          {roles.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-surface-50 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center"><Shield className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-surface-900">{r.name}{r.system && <Badge variant="neutral" className="ml-2">System</Badge>}</p>
                <p className="text-caption text-surface-500 truncate">{r.description}</p>
              </div>
              <div className="flex items-center gap-4 text-caption text-surface-500">
                <span>{r.users} users</span>
                <span>{r.permissions} permissions</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

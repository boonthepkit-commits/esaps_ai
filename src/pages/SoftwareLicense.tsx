import { useState } from 'react';
import { Plus, KeyRound, Calendar, Users, DollarSign, TrendingUp, AlertTriangle, RefreshCw, MoreHorizontal } from 'lucide-react';
import { Card, CardHeader, Button, Badge, StatusBadge, Progress, Dropdown, useToast, EmptyState } from '@/components/ui';
import { softwareLicenses, type SoftwareLicense } from '@/data/mockData';
import { cn } from '@/lib/cn';

interface SoftwareLicenseProps {
  onNavigate: (id: string) => void;
}

export function SoftwareLicensePage({ onNavigate }: SoftwareLicenseProps) {
  const { push } = useToast();

  const stats = [
    { label: 'Total Licenses', value: softwareLicenses.length, icon: KeyRound, color: 'brand' },
    { label: 'Active', value: softwareLicenses.filter((l) => l.status === 'Active').length, icon: TrendingUp, color: 'success' },
    { label: 'Expiring Soon', value: softwareLicenses.filter((l) => l.status === 'Expiring Soon').length, icon: AlertTriangle, color: 'warning' },
    { label: 'Total Spend', value: `$${(softwareLicenses.reduce((s, l) => s + l.cost, 0) / 1000).toFixed(0)}K`, icon: DollarSign, color: 'accent' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', `bg-${s.color}-50`, `text-${s.color}-600`)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-heading font-bold text-surface-900">{s.value}</p>
                <p className="text-caption text-surface-500">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-body text-surface-500">{softwareLicenses.length} software licenses</p>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => push({ variant: 'info', title: 'Add license', message: 'Open the license form' })}>Add License</Button>
      </div>

      {/* License cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {softwareLicenses.map((license) => {
          const usagePct = Math.round((license.seatsUsed / license.seatsPurchased) * 100);
          return (
            <Card key={license.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-accent-50 to-brand-50 flex items-center justify-center border border-surface-200 shrink-0">
                    <KeyRound className="h-5 w-5 text-accent-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-title font-semibold text-surface-900 truncate">{license.product}</p>
                    <p className="text-caption text-surface-500">{license.vendor}</p>
                  </div>
                </div>
                <Dropdown align="right" trigger={<span className="flex h-7 w-7 items-center justify-center rounded-md text-surface-400 hover:bg-surface-100"><MoreHorizontal className="h-4 w-4" /></span>} items={[
                  { label: 'View Details', onClick: () => push({ variant: 'info', title: license.product, message: 'License details' }) },
                  { label: 'Renew', icon: <RefreshCw className="h-4 w-4" />, onClick: () => push({ variant: 'success', title: 'Renewal started', message: license.product }) },
                  { label: 'Edit', onClick: () => push({ variant: 'info', title: 'Edit license', message: license.product }) },
                ]} />
              </div>

              <div className="flex items-center gap-2 mt-3">
                <StatusBadge status={license.status} />
                <Badge variant="neutral">{license.type}</Badge>
              </div>

              {/* Seats */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-caption text-surface-500"><Users className="h-3.5 w-3.5" />Seats</span>
                  <span className="text-body font-medium text-surface-900">{license.seatsUsed} / {license.seatsPurchased}</span>
                </div>
                <Progress value={license.seatsUsed} max={license.seatsPurchased} barClass={usagePct > 90 ? 'bg-error-500' : usagePct > 70 ? 'bg-warning-500' : 'bg-brand-500'} />
                <p className="text-caption text-surface-400 mt-1">{usagePct}% utilized</p>
              </div>

              {/* Dates & Cost */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-surface-100">
                <div>
                  <p className="flex items-center gap-1 text-caption text-surface-400"><Calendar className="h-3 w-3" />Expires</p>
                  <p className="text-body font-medium text-surface-900 mt-0.5">{license.expiryDate}</p>
                </div>
                <div className="text-right">
                  <p className="flex items-center gap-1 justify-end text-caption text-surface-400"><DollarSign className="h-3 w-3" />Annual Cost</p>
                  <p className="text-body font-medium text-surface-900 mt-0.5">${license.cost.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

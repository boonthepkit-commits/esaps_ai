import { useState } from 'react';
import { Plus, Wrench, Calendar, DollarSign, AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Card, CardHeader, Button, Badge, StatusBadge, useToast, SectionCard } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { BarChart, ProgressBarChart } from '@/components/Charts';
import { maintenanceRecords, type MaintenanceRecord } from '@/data/mockData';
import { cn } from '@/lib/cn';

interface MaintenanceProps {
  onNavigate: (id: string) => void;
}

const statusIcons: Record<string, React.ReactNode> = {
  'Scheduled': <Calendar className="h-4 w-4" />,
  'In Progress': <Clock className="h-4 w-4" />,
  'Completed': <CheckCircle2 className="h-4 w-4" />,
  'Overdue': <AlertTriangle className="h-4 w-4" />,
};

export function Maintenance({ onNavigate }: MaintenanceProps) {
  const { push } = useToast();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState('all');

  const stats = [
    { label: 'Scheduled', value: maintenanceRecords.filter((m) => m.status === 'Scheduled').length, icon: Calendar, color: 'accent' },
    { label: 'In Progress', value: maintenanceRecords.filter((m) => m.status === 'In Progress').length, icon: Clock, color: 'warning' },
    { label: 'Completed', value: maintenanceRecords.filter((m) => m.status === 'Completed').length, icon: CheckCircle2, color: 'success' },
    { label: 'Overdue', value: maintenanceRecords.filter((m) => m.status === 'Overdue').length, icon: AlertTriangle, color: 'error' },
  ];

  const filtered = filter === 'all' ? maintenanceRecords : maintenanceRecords.filter((m) => m.status === filter);

  const columns: Column<MaintenanceRecord>[] = [
    { key: 'asset', header: 'Asset', sortable: true, sortValue: (r) => r.assetName, render: (r) => (
      <div><p className="font-medium text-surface-900">{r.assetName}</p><p className="text-caption text-surface-500">{r.assetCode}</p></div>
    ) },
    { key: 'type', header: 'Type', sortable: true, sortValue: (r) => r.type, render: (r) => <Badge variant="neutral">{r.type}</Badge> },
    { key: 'priority', header: 'Priority', sortable: true, sortValue: (r) => r.priority, render: (r) => (
      <Badge variant={r.priority === 'Critical' ? 'error' : r.priority === 'High' ? 'warning' : r.priority === 'Medium' ? 'accent' : 'default'} dot>{r.priority}</Badge>
    ) },
    { key: 'date', header: 'Scheduled', sortable: true, sortValue: (r) => r.scheduledDate, render: (r) => <span className="text-surface-600">{r.scheduledDate}</span> },
    { key: 'vendor', header: 'Vendor', render: (r) => <span className="text-surface-600">{r.vendor}</span> },
    { key: 'cost', header: 'Cost', sortable: true, sortValue: (r) => r.cost, align: 'right', render: (r) => <span className="font-medium text-surface-900">${r.cost.toLocaleString()}</span> },
    { key: 'status', header: 'Status', sortable: true, sortValue: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
  ];

  // Calendar view
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const maintenanceByDay = (day: number) => maintenanceRecords.filter((m) => new Date(m.scheduledDate).getDate() === day);

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const c = s.color;
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', `bg-${c}-50`, `text-${c}-600`)}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-heading font-bold text-surface-900">{s.value}</p>
                  <p className="text-caption text-surface-500">{s.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Cost Analysis + Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Maintenance Cost Analysis" description="Monthly maintenance expenditure" />
          <div className="p-5 h-56">
            <BarChart
              data={[
                { label: 'Feb', value: 1200 }, { label: 'Mar', value: 800 }, { label: 'Apr', value: 2400 },
                { label: 'May', value: 600 }, { label: 'Jun', value: 1800 }, { label: 'Jul', value: 1560 },
              ]}
              height={200}
              color="bg-warning-500"
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="By Priority" description="Open maintenance by priority" />
          <div className="p-5">
            <ProgressBarChart data={[
              { label: 'Critical', value: 0, max: 10, color: 'bg-error-500' },
              { label: 'High', value: 1, max: 10, color: 'bg-warning-500' },
              { label: 'Medium', value: 2, max: 10, color: 'bg-accent-500' },
              { label: 'Low', value: 4, max: 10, color: 'bg-surface-400' },
            ]} />
          </div>
        </Card>
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
          <button onClick={() => setView('list')} className={cn('px-3 py-1.5 rounded-md text-body font-medium transition-colors', view === 'list' ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-600')}>List View</button>
          <button onClick={() => setView('calendar')} className={cn('px-3 py-1.5 rounded-md text-body font-medium transition-colors', view === 'calendar' ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-600')}>Calendar</button>
        </div>
        <div className="flex items-center gap-2">
          {view === 'list' && (
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-base h-9 w-auto">
              <option value="all">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          )}
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => push({ variant: 'info', title: 'Schedule maintenance', message: 'Open the scheduling form' })}>Schedule</Button>
        </div>
      </div>

      {view === 'list' ? (
        <DataTable
          columns={columns}
          data={filtered}
          searchable
          searchPlaceholder="Search maintenance records..."
          rowActions={(row) => [
            { label: 'View Details', onClick: () => push({ variant: 'info', title: row.assetName, message: row.type }) },
            { label: 'Edit', onClick: () => push({ variant: 'info', title: 'Edit record', message: row.assetName }) },
            { label: 'Cancel', danger: true, onClick: () => push({ variant: 'warning', title: 'Maintenance cancelled', message: row.assetName }) },
          ]}
        />
      ) : (
        <Card className="p-5">
          <div className="grid grid-cols-7 gap-1 mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-caption font-semibold text-surface-500 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const items = maintenanceByDay(day);
              return (
                <div key={day} className={cn('min-h-20 rounded-md border p-1.5 transition-colors', items.length > 0 ? 'border-brand-200 bg-brand-50/30' : 'border-surface-200 bg-surface-50')}>
                  <p className="text-caption font-medium text-surface-600 mb-1">{day}</p>
                  {items.map((m) => (
                    <div key={m.id} className={cn('text-caption rounded px-1 py-0.5 mb-0.5 truncate', m.status === 'Overdue' ? 'bg-error-100 text-error-700' : m.status === 'In Progress' ? 'bg-warning-100 text-warning-700' : 'bg-brand-100 text-brand-700')} title={m.assetName}>
                      {m.assetName}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

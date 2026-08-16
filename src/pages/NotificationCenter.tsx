import { useState } from 'react';
import { Bell, Check, Trash2, Filter, CheckCheck, Wrench, KeyRound, UserCheck, GitPullRequestArrow, Settings as SettingsIcon } from 'lucide-react';
import { Card, CardHeader, Button, Badge, StatusBadge, EmptyState, useToast } from '@/components/ui';
import { notifications, type AppNotification } from '@/data/mockData';
import { cn } from '@/lib/cn';

interface NotificationCenterProps {
  onNavigate: (id: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  maintenance: <Wrench className="h-4 w-4" />,
  license: <KeyRound className="h-4 w-4" />,
  assignment: <UserCheck className="h-4 w-4" />,
  approval: <GitPullRequestArrow className="h-4 w-4" />,
  system: <SettingsIcon className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  maintenance: 'bg-warning-50 text-warning-600',
  license: 'bg-accent-50 text-accent-600',
  assignment: 'bg-brand-50 text-brand-600',
  approval: 'bg-error-50 text-error-600',
  system: 'bg-surface-100 text-surface-500',
};

export function NotificationCenter({ onNavigate }: NotificationCenterProps) {
  const { push } = useToast();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [items, setItems] = useState<AppNotification[]>(notifications);

  const filtered = filter === 'all' ? items : items.filter((n) => !n.read);
  const unreadCount = items.filter((n) => !n.read).length;

  const markRead = (id: string) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const remove = (id: string) => setItems((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      {/* Header bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><Bell className="h-5 w-5" /></div>
            <div>
              <p className="text-title font-semibold text-surface-900">Notifications</p>
              <p className="text-caption text-surface-500">{unreadCount} unread of {items.length} total</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
              <button onClick={() => setFilter('all')} className={cn('px-3 py-1.5 rounded-md text-body font-medium transition-colors', filter === 'all' ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-600')}>All</button>
              <button onClick={() => setFilter('unread')} className={cn('px-3 py-1.5 rounded-md text-body font-medium transition-colors', filter === 'unread' ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-600')}>Unread</button>
            </div>
            <Button variant="outline" size="sm" leftIcon={<CheckCheck className="h-4 w-4" />} onClick={markAllRead}>Mark all read</Button>
          </div>
        </div>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bell className="h-6 w-6" />}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            description={filter === 'unread' ? 'You are all caught up.' : 'Notifications will appear here when there is activity.'}
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((n) => (
            <Card key={n.id} className={cn('p-4 transition-all hover:shadow-sm', !n.read && 'border-l-4 border-l-brand-500')}>
              <div className="flex items-start gap-3">
                <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', categoryColors[n.category])}>
                  {categoryIcons[n.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-body font-semibold text-surface-900">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />}
                  </div>
                  <p className="text-body text-surface-600 mt-0.5">{n.message}</p>
                  <p className="text-caption text-surface-400 mt-1.5">{n.timestamp}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} title="Mark as read" className="h-8 w-8 flex items-center justify-center rounded-md text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors">
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => remove(n.id)} title="Delete" className="h-8 w-8 flex items-center justify-center rounded-md text-surface-400 hover:bg-error-50 hover:text-error-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

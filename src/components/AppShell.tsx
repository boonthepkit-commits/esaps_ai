import { useState, type ReactNode } from 'react';
import {
  Search,
  Bell,
  Settings,
  HelpCircle,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Plus,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Command,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { navGroups, pageTitles } from '@/config/navigation';
import { Avatar, Badge, Button, Dropdown, type DropdownItem } from '@/components/ui';
import { AIAssistantDrawer } from '@/components/AIAssistantDrawer';
import { notifications as notifData } from '@/data/mockData';

interface AppShellProps {
  current: string;
  onNavigate: (id: string) => void;
  children: ReactNode;
  breadcrumb: { label: string; href?: string }[];
}

export function AppShell({ current, onNavigate, children, breadcrumb }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const unreadCount = notifData.filter((n) => !n.read).length;
  const meta = pageTitles[current] ?? { title: 'RAISE', subtitle: '' };

  const profileItems: DropdownItem[] = [
    { label: 'View Profile', icon: <UserIcon className="h-4 w-4" />, onClick: () => onNavigate('profile') },
    { label: 'Settings', icon: <Settings className="h-4 w-4" />, onClick: () => onNavigate('settings') },
    { label: 'Help & Support', icon: <HelpCircle className="h-4 w-4" /> },
    { divider: true, label: '' },
    { label: 'Sign Out', icon: <LogOut className="h-4 w-4" />, danger: true, onClick: () => onNavigate('login') },
  ];

  return (
    <div className="h-screen flex bg-surface-50 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-surface-950/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative z-40 h-full bg-white border-r border-surface-200 flex flex-col transition-all duration-200',
          collapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className={cn('h-14 flex items-center border-b border-surface-200 shrink-0', collapsed ? 'justify-center px-2' : 'px-5')}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center text-white font-bold text-body shrink-0 shadow-sm">
              R
            </div>
            {!collapsed && (
              <div className="leading-none">
                <p className="text-title font-bold text-surface-900 tracking-tight">RAISE</p>
                <p className="text-caption text-surface-500 mt-0.5">Asset Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 no-scrollbar">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && <p className="px-3 mb-1 text-caption font-semibold text-surface-400 uppercase tracking-wider">{group.label}</p>}
              {collapsed && <div className="h-px bg-surface-200 mx-2 mb-2" />}
              {group.items.map((item) => {
                const active = current === item.id || (current === 'asset-detail' && item.id === 'assets') || (current === 'create-asset' && item.id === 'assets') || (current === 'user-management' && item.id === 'administration') || (current === 'role-management' && item.id === 'administration');
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-md text-body font-medium transition-colors group',
                      collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
                      active ? 'bg-brand-50 text-brand-700' : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900',
                    )}
                  >
                    <Icon className={cn('h-4.5 w-4.5 shrink-0', active ? 'text-brand-600' : 'text-surface-400 group-hover:text-surface-600')} style={{ width: 18, height: 18 }} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-surface-200 p-2 shrink-0 hidden lg:block">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-caption text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-surface-200 flex items-center gap-2 px-4 lg:px-6 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-surface-500 hover:text-surface-700 p-1.5 rounded-md hover:bg-surface-100">
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 h-9 w-64 lg:w-80 px-3 rounded-md border border-surface-200 bg-surface-50 text-surface-400 hover:bg-surface-100 hover:border-surface-300 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="text-body">Search assets, people, licenses...</span>
            <span className="ml-auto flex items-center gap-0.5 text-caption bg-white border border-surface-200 rounded px-1.5 py-0.5">
              <Command className="h-3 w-3" />K
            </span>
          </button>

          <div className="flex-1" />

          {/* AI Assistant */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="h-4 w-4 text-brand-600" />}
            onClick={() => setAiOpen(true)}
            className="border-brand-200 bg-brand-50/50 hover:bg-brand-50 hover:border-brand-300 text-brand-700"
          >
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="sm:hidden">AI</span>
          </Button>

          {/* Quick actions */}
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} className="hidden sm:inline-flex" onClick={() => onNavigate('create-asset')}>
            New Asset
          </Button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative h-9 w-9 flex items-center justify-center rounded-md text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error-500 ring-2 ring-white" />}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 mt-1 w-80 sm:w-96 bg-white rounded-lg border border-surface-200 shadow-lg z-50 animate-fade-in-up">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
                    <h3 className="text-title font-semibold text-surface-900">Notifications</h3>
                    <Badge variant="error">{unreadCount} new</Badge>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifData.slice(0, 5).map((n) => (
                      <div key={n.id} className={cn('flex gap-3 px-4 py-3 border-b border-surface-100 hover:bg-surface-50 cursor-pointer', !n.read && 'bg-brand-50/40')}>
                        <span className={cn('h-2 w-2 rounded-full mt-1.5 shrink-0', n.read ? 'bg-surface-300' : 'bg-brand-500')} />
                        <div className="min-w-0">
                          <p className="text-body font-medium text-surface-900">{n.title}</p>
                          <p className="text-caption text-surface-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-caption text-surface-400 mt-1">{n.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { onNavigate('notifications'); setNotifOpen(false); }} className="w-full py-2.5 text-body font-medium text-brand-600 hover:bg-brand-50 transition-colors border-t border-surface-200">
                    View all notifications
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Help */}
          <button className="h-9 w-9 flex items-center justify-center rounded-md text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors hidden sm:flex">
            <HelpCircle className="h-5 w-5" />
          </button>

          {/* Profile */}
          <Dropdown items={profileItems} trigger={
            <span className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-md hover:bg-surface-100 transition-colors cursor-pointer">
              <Avatar initials="AM" color="bg-brand-500" size="sm" />
              <span className="hidden sm:block text-left leading-none">
                <span className="block text-body font-medium text-surface-900">Alex Morgan</span>
                <span className="block text-caption text-surface-500 mt-0.5">Administrator</span>
              </span>
              <ChevronDown className="h-4 w-4 text-surface-400 hidden sm:block" />
            </span>
          } />
        </header>

        {/* Breadcrumb + page header */}
        <div className="bg-white border-b border-surface-200 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <nav className="flex items-center gap-1.5 text-caption mb-1">
                {breadcrumb.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-surface-300">/</span>}
                    <span className={cn(i === breadcrumb.length - 1 ? 'text-surface-900 font-medium' : 'text-surface-500')}>{b.label}</span>
                  </span>
                ))}
              </nav>
              <h1 className="text-heading font-bold text-surface-900 tracking-tight">{meta.title}</h1>
              <p className="text-body text-surface-500 mt-0.5">{meta.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-4 lg:p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Command palette / search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div className="absolute inset-0 bg-surface-950/40 backdrop-blur-sm animate-fade-in" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-lg shadow-xl border border-surface-200 animate-scale-in overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200">
              <Search className="h-5 w-5 text-surface-400" />
              <input autoFocus placeholder="Search assets, employees, licenses..." className="flex-1 text-body text-surface-900 placeholder:text-surface-400 outline-none bg-transparent" />
              <kbd className="text-caption text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded">ESC</kbd>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              <p className="px-3 py-1.5 text-caption font-semibold text-surface-400 uppercase">Recent</p>
              {['MacBook Pro 16" M3', 'AST-0001', 'Sarah Chen', 'Microsoft 365 E5'].map((q) => (
                <button key={q} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-100 text-body text-surface-700 transition-colors">
                  <Search className="h-4 w-4 text-surface-400" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} onNavigate={(action) => { setAiOpen(false); onNavigate(action); }} />
    </div>
  );
}

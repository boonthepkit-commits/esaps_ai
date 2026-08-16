import { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { ToastProvider } from '@/components/ui';
import { Dashboard } from '@/pages/Dashboard';
import { AssetList } from '@/pages/AssetList';
import { AssetDetail } from '@/pages/AssetDetail';
import { CreateAsset } from '@/pages/CreateAsset';
import { Assignment } from '@/pages/Assignment';
import { Maintenance } from '@/pages/Maintenance';
import { SoftwareLicensePage } from '@/pages/SoftwareLicense';
import { Inventory } from '@/pages/Inventory';
import { Reports } from '@/pages/Reports';
import { Administration } from '@/pages/Administration';
import { UserManagement } from '@/pages/UserManagement';
import { RoleManagement } from '@/pages/RoleManagement';
import { Settings } from '@/pages/Settings';
import { Profile } from '@/pages/Profile';
import { NotificationCenter } from '@/pages/NotificationCenter';
import { Login, ForgotPassword, Register } from '@/pages/Auth';
import { NotFound, AccessDenied } from '@/pages/ErrorPages';
import { pageTitles } from '@/config/navigation';

type Page =
  | 'dashboard' | 'assets' | 'asset-detail' | 'create-asset'
  | 'assignment' | 'maintenance' | 'licenses' | 'inventory'
  | 'procurement' | 'audit' | 'documents' | 'approvals'
  | 'reports' | 'analytics' | 'notifications'
  | 'administration' | 'user-management' | 'role-management'
  | 'settings' | 'profile'
  | 'login' | 'forgot-password' | 'register'
  | '404' | '403';

function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [assetId, setAssetId] = useState<string | undefined>();

  const navigate = (id: string, aid?: string) => {
    if (aid) setAssetId(aid);
    setPage(id as Page);
    window.scrollTo(0, 0);
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Auth pages — no shell
  if (page === 'login') return <ToastProvider><Login onNavigate={navigate} /></ToastProvider>;
  if (page === 'forgot-password') return <ToastProvider><ForgotPassword onNavigate={navigate} /></ToastProvider>;
  if (page === 'register') return <ToastProvider><Register onNavigate={navigate} /></ToastProvider>;
  if (page === '404') return <ToastProvider><NotFound onNavigate={navigate} /></ToastProvider>;
  if (page === '403') return <ToastProvider><AccessDenied onNavigate={navigate} /></ToastProvider>;

  // Breadcrumb builder
  const breadcrumb = buildBreadcrumb(page);

  return (
    <ToastProvider>
      <AppShell current={page} onNavigate={navigate} breadcrumb={breadcrumb}>
        {renderPage(page, navigate, assetId)}
      </AppShell>
    </ToastProvider>
  );
}

function buildBreadcrumb(page: Page): { label: string; href?: string }[] {
  const meta = pageTitles[page] ?? { title: 'RAISE', subtitle: '' };
  const crumbs: { label: string; href?: string }[] = [{ label: 'Home', href: '#' }];

  if (page === 'asset-detail') {
    crumbs.push({ label: 'Asset Management', href: '#' });
    crumbs.push({ label: 'Asset Details' });
  } else if (page === 'create-asset') {
    crumbs.push({ label: 'Asset Management', href: '#' });
    crumbs.push({ label: 'Create Asset' });
  } else if (page === 'user-management' || page === 'role-management') {
    crumbs.push({ label: 'Administration', href: '#' });
    crumbs.push({ label: meta.title });
  } else {
    crumbs.push({ label: meta.title });
  }

  return crumbs;
}

function renderPage(page: Page, navigate: (id: string, aid?: string) => void, assetId?: string): React.ReactNode {
  switch (page) {
    case 'dashboard': return <Dashboard onNavigate={navigate} />;
    case 'assets': return <AssetList onNavigate={navigate} />;
    case 'asset-detail': return <AssetDetail assetId={assetId ?? 'a1'} onNavigate={navigate} />;
    case 'create-asset': return <CreateAsset onNavigate={navigate} />;
    case 'assignment': return <Assignment onNavigate={navigate} />;
    case 'maintenance': return <Maintenance onNavigate={navigate} />;
    case 'licenses': return <SoftwareLicensePage onNavigate={navigate} />;
    case 'inventory': return <Inventory onNavigate={navigate} />;
    case 'procurement': return <ProcurementPlaceholder onNavigate={navigate} />;
    case 'audit': return <AuditPlaceholder onNavigate={navigate} />;
    case 'documents': return <DocumentsPlaceholder onNavigate={navigate} />;
    case 'approvals': return <ApprovalsPlaceholder onNavigate={navigate} />;
    case 'reports': return <Reports onNavigate={navigate} />;
    case 'analytics': return <AnalyticsPlaceholder onNavigate={navigate} />;
    case 'notifications': return <NotificationCenter onNavigate={navigate} />;
    case 'administration': return <Administration onNavigate={navigate} />;
    case 'user-management': return <UserManagement onNavigate={navigate} />;
    case 'role-management': return <RoleManagement onNavigate={navigate} />;
    case 'settings': return <Settings onNavigate={navigate} />;
    case 'profile': return <Profile onNavigate={navigate} />;
    default: return <Dashboard onNavigate={navigate} />;
  }
}

/* Placeholder pages for nav items without dedicated builds yet */
function Placeholder({ title, icon, onNavigate }: { title: string; icon: React.ReactNode; onNavigate: (id: string) => void }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-sm">
        <div className="h-14 w-14 rounded-full bg-surface-100 flex items-center justify-center text-surface-400 mx-auto mb-4">{icon}</div>
        <h3 className="text-title font-semibold text-surface-900">{title}</h3>
        <p className="text-body text-surface-500 mt-1">This module is part of the RAISE platform design. Connect a backend to activate full functionality.</p>
      </div>
    </div>
  );
}

function ProcurementPlaceholder({ onNavigate }: { onNavigate: (id: string) => void }) {
  return <Placeholder title="Procurement" icon={<span className="text-2xl">🛒</span>} onNavigate={onNavigate} />;
}
function AuditPlaceholder({ onNavigate }: { onNavigate: (id: string) => void }) {
  return <Placeholder title="Audit" icon={<span className="text-2xl">📋</span>} onNavigate={onNavigate} />;
}
function DocumentsPlaceholder({ onNavigate }: { onNavigate: (id: string) => void }) {
  return <Placeholder title="Document Management" icon={<span className="text-2xl">📄</span>} onNavigate={onNavigate} />;
}
function ApprovalsPlaceholder({ onNavigate }: { onNavigate: (id: string) => void }) {
  return <Placeholder title="Approval Workflow" icon={<span className="text-2xl">✅</span>} onNavigate={onNavigate} />;
}
function AnalyticsPlaceholder({ onNavigate }: { onNavigate: (id: string) => void }) {
  return <Placeholder title="Analytics" icon={<span className="text-2xl">📊</span>} onNavigate={onNavigate} />;
}

export default App;

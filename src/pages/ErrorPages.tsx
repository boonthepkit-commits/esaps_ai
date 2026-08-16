import { Link } from 'lucide-react';
import { Button } from '@/components/ui';

interface ErrorPageProps {
  code: string;
  title: string;
  message: string;
  onNavigate: (id: string) => void;
}

export function ErrorPage({ code, title, message, onNavigate }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-12">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center text-white font-bold">R</div>
          <span className="text-title font-bold text-surface-900">RAISE</span>
        </div>

        <p className="text-display font-bold text-brand-600 mb-4">{code}</p>
        <h1 className="text-heading font-bold text-surface-900">{title}</h1>
        <p className="text-body text-surface-500 mt-2">{message}</p>

        <div className="flex items-center justify-center gap-3 mt-8">
          <Button variant="outline" onClick={() => onNavigate('dashboard')}>Back to Dashboard</Button>
          <Button leftIcon={<Link className="h-4 w-4" />} onClick={() => onNavigate('dashboard')}>Go Home</Button>
        </div>
      </div>
    </div>
  );
}

export function NotFound({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <ErrorPage
      code="404"
      title="Page not found"
      message="The page you're looking for doesn't exist or has been moved."
      onNavigate={onNavigate}
    />
  );
}

export function AccessDenied({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <ErrorPage
      code="403"
      title="Access denied"
      message="You don't have permission to access this page. Contact your administrator if you believe this is an error."
      onNavigate={onNavigate}
    />
  );
}

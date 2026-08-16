import { useState, type ReactNode } from 'react';
import { Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button, Input, Checkbox, useToast } from '@/components/ui';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-accent-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center font-bold text-lg">R</div>
            <span className="text-title font-bold tracking-tight">RAISE</span>
          </div>
          <div>
            <h1 className="text-display font-bold leading-tight max-w-md">Enterprise Asset Management, redefined.</h1>
            <p className="text-body text-white/70 mt-4 max-w-sm">Track, manage, and optimize your organization's assets with a platform built for scale.</p>
            <div className="flex flex-col gap-3 mt-8">
              {[
                'Real-time asset tracking and lifecycle management',
                'Automated maintenance scheduling and alerts',
                'Comprehensive audit trails and compliance reporting',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-body text-white/80">
                  <CheckCircle2 className="h-4.5 w-4.5 text-success-300 shrink-0" style={{ width: 18, height: 18 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-caption text-white/50">
            <ShieldCheck className="h-4 w-4" />
            SOC 2 Type II Certified · ISO 27001 Compliant
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center text-white font-bold">R</div>
            <span className="text-title font-bold text-surface-900">RAISE</span>
          </div>

          <h2 className="text-heading font-bold text-surface-900">{title}</h2>
          <p className="text-body text-surface-500 mt-1.5">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-6 text-center text-body text-surface-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

interface LoginProps {
  onNavigate: (id: string) => void;
}

export function Login({ onNavigate }: LoginProps) {
  const { push } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your RAISE account to continue."
      footer={<>Don't have an account? <button onClick={() => onNavigate('register')} className="text-brand-600 font-medium hover:underline">Create one</button></>}
    >
      <form onSubmit={(e) => { e.preventDefault(); push({ variant: 'success', title: 'Signed in', message: 'Redirecting to dashboard...' }); setTimeout(() => onNavigate('dashboard'), 500); }} className="flex flex-col gap-4">
        <Input label="Email Address" type="email" placeholder="you@company.com" defaultValue="alex.morgan@raise.co" />
        <div className="relative">
          <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" defaultValue="demo1234" />
          <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-[34px] text-surface-400 hover:text-surface-600">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <Checkbox id="remember" label="Remember me" defaultChecked />
          <button type="button" onClick={() => onNavigate('forgot-password')} className="text-caption text-brand-600 font-medium hover:underline">Forgot password?</button>
        </div>
        <Button type="submit" size="lg" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>Sign In</Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-200" /></div>
          <div className="relative flex justify-center"><span className="bg-surface-50 px-3 text-caption text-surface-400">or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" type="button" onClick={() => push({ variant: 'info', title: 'SSO', message: 'Redirecting to SSO provider...' })}>
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </Button>
          <Button variant="outline" type="button" onClick={() => push({ variant: 'info', title: 'SSO', message: 'Redirecting to Microsoft...' })}>
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
            Microsoft
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

export function ForgotPassword({ onNavigate }: LoginProps) {
  const { push } = useToast();
  const [sent, setSent] = useState(false);

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<>Remember your password? <button onClick={() => onNavigate('login')} className="text-brand-600 font-medium hover:underline">Sign in</button></>}
    >
      {sent ? (
        <div className="flex flex-col items-center text-center py-6">
          <div className="h-14 w-14 rounded-full bg-success-50 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-7 w-7 text-success-600" />
          </div>
          <p className="text-title font-semibold text-surface-900">Check your email</p>
          <p className="text-body text-surface-500 mt-1.5">We've sent a password reset link to your email address.</p>
          <Button variant="outline" className="mt-6 w-full" onClick={() => onNavigate('login')}>Back to sign in</Button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); push({ variant: 'info', title: 'Reset link sent', message: 'Check your inbox' }); }} className="flex flex-col gap-4">
          <Input label="Email Address" type="email" placeholder="you@company.com" helpText="We'll send a link to this address" />
          <Button type="submit" size="lg" className="w-full">Send Reset Link</Button>
        </form>
      )}
    </AuthLayout>
  );
}

export function Register({ onNavigate }: LoginProps) {
  const { push } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your enterprise assets today."
      footer={<>Already have an account? <button onClick={() => onNavigate('login')} className="text-brand-600 font-medium hover:underline">Sign in</button></>}
    >
      <form onSubmit={(e) => { e.preventDefault(); push({ variant: 'success', title: 'Account created', message: 'Welcome to RAISE!' }); setTimeout(() => onNavigate('dashboard'), 500); }} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First Name" placeholder="Alex" />
          <Input label="Last Name" placeholder="Morgan" />
        </div>
        <Input label="Work Email" type="email" placeholder="you@company.com" />
        <Input label="Company" placeholder="Company name" />
        <div className="relative">
          <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" helpText="At least 12 characters with mixed case" />
          <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-[34px] text-surface-400 hover:text-surface-600">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Checkbox id="terms" label="I agree to the Terms of Service and Privacy Policy" />
        <Button type="submit" size="lg" className="w-full">Create Account</Button>
      </form>
    </AuthLayout>
  );
}

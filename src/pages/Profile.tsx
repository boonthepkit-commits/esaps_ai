import { Mail, Phone, Building2, MapPin, Calendar, Bell, Shield, Settings, Camera, Edit, Check } from 'lucide-react';
import { Card, CardHeader, Button, Avatar, Badge, Input, Textarea, SectionCard, useToast } from '@/components/ui';
import { cn } from '@/lib/cn';

interface ProfileProps {
  onNavigate: (id: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
  const { push } = useToast();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      {/* Profile header */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-600 to-accent-600" />
        <div className="px-5 pb-5">
          <div className="flex items-end gap-4 -mt-10">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-brand-500 flex items-center justify-center text-white text-heading font-bold border-4 border-white shadow-md">AM</div>
              <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white border border-surface-200 flex items-center justify-center text-surface-500 hover:text-surface-700 shadow-sm"><Camera className="h-3.5 w-3.5" /></button>
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-heading font-bold text-surface-900">Alex Morgan</h1>
              <p className="text-body text-surface-500">System Administrator · IT Operations</p>
            </div>
            <div className="flex gap-2 pb-2">
              <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => push({ variant: 'info', title: 'Edit mode', message: 'Profile editing enabled' })}>Edit Profile</Button>
              <Button variant="outline" size="sm" leftIcon={<Settings className="h-4 w-4" />} onClick={() => onNavigate('settings')}>Settings</Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 flex-wrap text-caption text-surface-500">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />alex.morgan@raise.co</span>
            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />+1 (555) 010-2030</span>
            <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />IT Operations</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />HQ - Floor 4</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Joined Jan 2024</span>
            <Badge variant="success" dot>Active</Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Personal info */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <SectionCard title="Personal Information" description="Update your personal details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" defaultValue="Alex" />
              <Input label="Last Name" defaultValue="Morgan" />
              <Input label="Email" type="email" defaultValue="alex.morgan@raise.co" />
              <Input label="Phone" defaultValue="+1 (555) 010-2030" />
              <Input label="Job Title" defaultValue="System Administrator" />
              <Input label="Department" defaultValue="IT Operations" disabled />
            </div>
            <div className="mt-4">
              <Textarea label="Bio" placeholder="Tell us about yourself..." defaultValue="IT professional managing enterprise asset infrastructure for RAISE Corporation." />
            </div>
          </SectionCard>

          <SectionCard title="Security" description="Password and authentication">
            <div className="flex flex-col gap-4">
              <Input label="Current Password" type="password" placeholder="••••••••" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="New Password" type="password" placeholder="••••••••" />
                <Input label="Confirm Password" type="password" placeholder="••••••••" />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-surface-100">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-surface-400" />
                  <div><p className="text-body font-medium text-surface-900">Two-Factor Authentication</p><p className="text-caption text-surface-500">Add an extra layer of security</p></div>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <SectionCard title="Activity Summary">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Assets Managed', value: '248' },
                { label: 'Approvals', value: '42' },
                { label: 'Reports', value: '18' },
                { label: 'Last Login', value: '2h ago' },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-lg bg-surface-50 border border-surface-200">
                  <p className="text-heading font-bold text-surface-900">{s.value}</p>
                  <p className="text-caption text-surface-500">{s.label}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div className="flex flex-col gap-1">
              {[
                { label: 'Notification Preferences', icon: Bell, onClick: () => onNavigate('settings') },
                { label: 'Security Settings', icon: Shield, onClick: () => onNavigate('settings') },
                { label: 'System Settings', icon: Settings, onClick: () => onNavigate('settings') },
              ].map((a) => (
                <button key={a.label} onClick={a.onClick} className="flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-surface-50 transition-colors text-left">
                  <a.icon className="h-4 w-4 text-surface-400" />
                  <span className="text-body text-surface-700">{a.label}</span>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button leftIcon={<Check className="h-4 w-4" />} onClick={() => push({ variant: 'success', title: 'Profile updated', message: 'Your changes have been saved' })}>Save Changes</Button>
      </div>
    </div>
  );
}

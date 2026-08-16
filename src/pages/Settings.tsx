import { useState } from 'react';
import { Bell, Globe, Shield, Palette, Mail, Database, Save } from 'lucide-react';
import { Card, CardHeader, Button, Input, Select, Textarea, Checkbox, Badge, useToast, SectionCard } from '@/components/ui';
import { cn } from '@/lib/cn';

interface SettingsProps {
  onNavigate: (id: string) => void;
}

export function Settings({ onNavigate }: SettingsProps) {
  const { push } = useToast();
  const [section, setSection] = useState('general');
  const [notifPrefs, setNotifPrefs] = useState({
    assignment: true, maintenance: true, license: true, approval: true, system: false,
  });

  const sections = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'data', label: 'Data & Backup', icon: Database },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Settings nav */}
      <div className="lg:col-span-1">
        <div className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                'inline-flex items-center gap-2.5 px-3 py-2 rounded-md text-body font-medium transition-colors whitespace-nowrap w-full text-left',
                section === s.id ? 'bg-brand-50 text-brand-700' : 'text-surface-600 hover:bg-surface-100',
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings content */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {section === 'general' && (
          <SectionCard title="General Settings" description="Platform-wide configuration">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Organization Name" defaultValue="RAISE Corporation" />
              <Input label="Support Email" type="email" defaultValue="support@raise.co" />
              <Select label="Timezone" options={[
                { value: 'utc', label: 'UTC' },
                { value: 'est', label: 'America/New York (EST)' },
                { value: 'pst', label: 'America/Los Angeles (PST)' },
                { value: 'gmt', label: 'Europe/London (GMT)' },
              ]} />
              <Select label="Date Format" options={[
                { value: 'iso', label: 'YYYY-MM-DD' },
                { value: 'us', label: 'MM/DD/YYYY' },
                { value: 'eu', label: 'DD/MM/YYYY' },
              ]} />
              <Select label="Currency" options={[
                { value: 'usd', label: 'USD ($)' },
                { value: 'eur', label: 'EUR (€)' },
                { value: 'gbp', label: 'GBP (£)' },
              ]} />
              <Select label="Language" options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' },
              ]} />
            </div>
          </SectionCard>
        )}

        {section === 'notifications' && (
          <SectionCard title="Notification Preferences" description="Choose what alerts you receive">
            <div className="flex flex-col gap-4">
              {Object.entries({
                assignment: 'Assignment updates',
                maintenance: 'Maintenance alerts',
                license: 'License expiration warnings',
                approval: 'Approval requests',
                system: 'System announcements',
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                  <div>
                    <p className="text-body font-medium text-surface-900">{label}</p>
                    <p className="text-caption text-surface-500">Receive notifications for {label.toLowerCase()}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifPrefs[key as keyof typeof notifPrefs]} onChange={(e) => setNotifPrefs((p) => ({ ...p, [key]: e.target.checked }))} />
                    <div className="w-10 h-6 bg-surface-200 peer-focus:ring-2 peer-focus:ring-brand-500/20 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
                  </label>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {section === 'security' && (
          <>
            <SectionCard title="Authentication" description="Password and access policies">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Session Timeout (minutes)" type="number" defaultValue="30" />
                <Select label="Password Policy" options={[
                  { value: 'basic', label: 'Basic (8+ chars)' },
                  { value: 'standard', label: 'Standard (12+ chars, mixed)' },
                  { value: 'strict', label: 'Strict (16+ chars, symbols)' },
                ]} />
                <Select label="Two-Factor Authentication" options={[
                  { value: 'off', label: 'Disabled' },
                  { value: 'optional', label: 'Optional' },
                  { value: 'required', label: 'Required for all users' },
                ]} />
                <Input label="Max Login Attempts" type="number" defaultValue="5" />
              </div>
            </SectionCard>
            <SectionCard title="IP Whitelist" description="Restrict access by IP address">
              <Textarea placeholder="Enter one IP per line, e.g. 192.168.1.0/24" />
            </SectionCard>
          </>
        )}

        {section === 'appearance' && (
          <SectionCard title="Appearance" description="Customize the look and feel">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-body font-medium text-surface-900 mb-2">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Light', bg: 'bg-white border-surface-300' },
                    { id: 'dark', label: 'Dark', bg: 'bg-surface-900 border-surface-700' },
                    { id: 'system', label: 'System', bg: 'bg-gradient-to-br from-white to-surface-900 border-surface-300' },
                  ].map((t) => (
                    <button key={t.id} className={cn('rounded-lg border-2 p-4 text-center transition-all hover:shadow-sm', t.bg, t.id === 'light' && 'ring-2 ring-brand-500')}>
                      <span className={cn('text-body font-medium', t.id === 'dark' ? 'text-white' : 'text-surface-900')}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-body font-medium text-surface-900 mb-2">Primary Color</p>
                <div className="flex gap-2">
                  {['bg-brand-600', 'bg-accent-600', 'bg-success-600', 'bg-warning-600', 'bg-error-600'].map((c) => (
                    <button key={c} className={cn('h-9 w-9 rounded-full ring-2 ring-offset-2 transition-transform hover:scale-110', c, c === 'bg-brand-600' ? 'ring-surface-400' : 'ring-transparent')} />
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {section === 'email' && (
          <SectionCard title="Email Configuration" description="SMTP settings for system emails">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="SMTP Server" defaultValue="smtp.raise.co" />
              <Input label="SMTP Port" type="number" defaultValue="587" />
              <Input label="Username" defaultValue="noreply@raise.co" />
              <Input label="Password" type="password" placeholder="••••••••" />
              <Select label="Encryption" options={[
                { value: 'tls', label: 'TLS' },
                { value: 'ssl', label: 'SSL' },
                { value: 'none', label: 'None' },
              ]} />
              <Input label="From Email" type="email" defaultValue="noreply@raise.co" />
            </div>
          </SectionCard>
        )}

        {section === 'data' && (
          <SectionCard title="Data & Backup" description="Backup and data retention policies">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between py-2 border-b border-surface-100">
                <div><p className="text-body font-medium text-surface-900">Automatic Backups</p><p className="text-caption text-surface-500">Daily backup at 2:00 AM UTC</p></div>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-surface-100">
                <div><p className="text-body font-medium text-surface-900">Data Retention (days)</p><p className="text-caption text-surface-500">How long to keep historical records</p></div>
                <Input type="number" defaultValue="365" className="w-24" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div><p className="text-body font-medium text-surface-900">Export Schedule</p><p className="text-caption text-surface-500">Weekly export to cloud storage</p></div>
                <Checkbox />
              </div>
            </div>
          </SectionCard>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline">Reset</Button>
          <Button leftIcon={<Save className="h-4 w-4" />} onClick={() => push({ variant: 'success', title: 'Settings saved', message: 'Your changes have been applied' })}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

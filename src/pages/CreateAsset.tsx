import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button, Card, Input, Select, Textarea, SectionCard, Badge, useToast } from '@/components/ui';
import { departments, locations } from '@/data/mockData';
import { cn } from '@/lib/cn';

interface CreateAssetProps {
  onNavigate: (id: string) => void;
}

const steps = [
  { id: 1, label: 'Basic Info', description: 'Name, category, and type' },
  { id: 2, label: 'Financial', description: 'Purchase and depreciation' },
  { id: 3, label: 'Assignment', description: 'Location and department' },
  { id: 4, label: 'Review', description: 'Confirm and create' },
];

export function CreateAsset({ onNavigate }: CreateAssetProps) {
  const { push } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', code: '', category: '', type: '', serial: '', vendor: '',
    purchaseCost: '', purchaseDate: '', warrantyExpiry: '',
    department: '', location: '', condition: 'Excellent',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.name) e.name = 'Asset name is required';
      if (!form.category) e.category = 'Category is required';
      if (!form.serial) e.serial = 'Serial number is required';
    }
    if (step === 2) {
      if (!form.purchaseCost) e.purchaseCost = 'Purchase cost is required';
      if (!form.purchaseDate) e.purchaseDate = 'Purchase date is required';
    }
    if (step === 3) {
      if (!form.department) e.department = 'Department is required';
      if (!form.location) e.location = 'Location is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(4, s + 1)); };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = () => {
    push({ variant: 'success', title: 'Asset created', message: `${form.name || 'New asset'} has been registered.` });
    onNavigate('assets');
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      {/* Stepper */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center text-body font-medium transition-colors shrink-0',
                  step > s.id ? 'bg-success-500 text-white' : step === s.id ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-400',
                )}>
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <div className="text-center hidden sm:block">
                  <p className={cn('text-caption font-medium', step >= s.id ? 'text-surface-900' : 'text-surface-400')}>{s.label}</p>
                  <p className="text-caption text-surface-400 hidden md:block">{s.description}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={cn('h-0.5 flex-1 mx-2 sm:mx-4 transition-colors', step > s.id ? 'bg-success-500' : 'bg-surface-200')} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step content */}
      {step === 1 && (
        <SectionCard title="Basic Information" description="Enter the core details for this asset">
          <div className="flex flex-col gap-5">
            {/* Photo upload */}
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg border-2 border-dashed border-surface-300 flex items-center justify-center text-surface-400 bg-surface-50">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />}>Upload Photo</Button>
                <p className="text-caption text-surface-500 mt-1.5">PNG or JPG, max 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Asset Name" name="name" placeholder="e.g. MacBook Pro 16" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
              <Input label="Asset Code" name="code" placeholder="Auto-generated" value={form.code} onChange={(e) => set('code', e.target.value)} helpText="Leave blank for auto-generation" />
              <Select label="Category" name="category" value={form.category} onChange={(e) => set('category', e.target.value)} error={errors.category} options={[
                { value: '', label: 'Select category' },
                { value: 'IT Hardware', label: 'IT Hardware' },
                { value: 'Mobile', label: 'Mobile' },
                { value: 'Office Equipment', label: 'Office Equipment' },
                { value: 'Infrastructure', label: 'Infrastructure' },
                { value: 'Media Equipment', label: 'Media Equipment' },
              ]} />
              <Select label="Type" name="type" value={form.type} onChange={(e) => set('type', e.target.value)} options={[
                { value: '', label: 'Select type' },
                { value: 'Laptop', label: 'Laptop' },
                { value: 'Monitor', label: 'Monitor' },
                { value: 'Smartphone', label: 'Smartphone' },
                { value: 'Tablet', label: 'Tablet' },
                { value: 'Server', label: 'Server' },
                { value: 'Printer', label: 'Printer' },
              ]} />
              <Input label="Serial Number" name="serial" placeholder="e.g. C02XK1ABJGH" value={form.serial} onChange={(e) => set('serial', e.target.value)} error={errors.serial} />
              <Input label="Vendor" name="vendor" placeholder="e.g. Apple Inc." value={form.vendor} onChange={(e) => set('vendor', e.target.value)} />
            </div>
            <Textarea label="Description" name="description" placeholder="Additional notes about this asset..." value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
        </SectionCard>
      )}

      {step === 2 && (
        <SectionCard title="Financial Information" description="Purchase details and warranty">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Purchase Cost ($)" name="purchaseCost" type="number" placeholder="0.00" value={form.purchaseCost} onChange={(e) => set('purchaseCost', e.target.value)} error={errors.purchaseCost} />
            <Input label="Purchase Date" name="purchaseDate" type="date" value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} error={errors.purchaseDate} />
            <Input label="Warranty Expiry" name="warrantyExpiry" type="date" value={form.warrantyExpiry} onChange={(e) => set('warrantyExpiry', e.target.value)} helpText="Leave blank if no warranty" />
            <Select label="Depreciation Method" options={[
              { value: 'straight', label: 'Straight Line' },
              { value: 'declining', label: 'Declining Balance' },
              { value: 'units', label: 'Units of Production' },
            ]} />
            <Input label="Useful Life (years)" name="usefulLife" type="number" placeholder="e.g. 3" helpText="Expected lifespan for depreciation" />
            <Input label="Salvage Value ($)" name="salvage" type="number" placeholder="0.00" />
          </div>
        </SectionCard>
      )}

      {step === 3 && (
        <SectionCard title="Assignment & Location" description="Where this asset will be stored or assigned">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Department" name="department" value={form.department} onChange={(e) => set('department', e.target.value)} error={errors.department} options={[
              { value: '', label: 'Select department' },
              ...departments.map((d) => ({ value: d, label: d })),
            ]} />
            <Select label="Location" name="location" value={form.location} onChange={(e) => set('location', e.target.value)} error={errors.location} options={[
              { value: '', label: 'Select location' },
              ...locations.map((l) => ({ value: l, label: l })),
            ]} />
            <Select label="Condition" name="condition" value={form.condition} onChange={(e) => set('condition', e.target.value)} options={[
              { value: 'Excellent', label: 'Excellent' },
              { value: 'Good', label: 'Good' },
              { value: 'Fair', label: 'Fair' },
              { value: 'Poor', label: 'Poor' },
            ]} />
            <Select label="Assign To" name="assignTo" options={[
              { value: '', label: 'Leave unassigned' },
              { value: 'sarah', label: 'Sarah Chen' },
              { value: 'marcus', label: 'Marcus Johnson' },
              { value: 'priya', label: 'Priya Patel' },
            ]} />
          </div>
        </SectionCard>
      )}

      {step === 4 && (
        <SectionCard title="Review & Confirm" description="Verify the details before creating the asset">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-50 border border-brand-200">
              <div className="h-12 w-12 rounded-lg bg-white border border-brand-200 flex items-center justify-center text-brand-600">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-title font-semibold text-surface-900">{form.name || 'Untitled Asset'}</p>
                <p className="text-caption text-surface-500">{form.category || 'No category'} · {form.type || 'No type'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <ReviewRow label="Serial Number" value={form.serial || '—'} />
              <ReviewRow label="Vendor" value={form.vendor || '—'} />
              <ReviewRow label="Purchase Cost" value={form.purchaseCost ? `$${form.purchaseCost}` : '—'} />
              <ReviewRow label="Purchase Date" value={form.purchaseDate || '—'} />
              <ReviewRow label="Warranty Expiry" value={form.warrantyExpiry || '—'} />
              <ReviewRow label="Department" value={form.department || '—'} />
              <ReviewRow label="Location" value={form.location || '—'} />
              <ReviewRow label="Condition" value={form.condition} />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-50 border border-surface-200">
              <Check className="h-4 w-4 text-success-600" />
              <p className="text-body text-surface-600">All required fields are complete. Click "Create Asset" to register.</p>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={step === 1 ? () => onNavigate('assets') : back}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        {step < 4 ? (
          <Button rightIcon={<ChevronRight className="h-4 w-4" />} onClick={next}>Continue</Button>
        ) : (
          <Button onClick={submit}>Create Asset</Button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption text-surface-500">{label}</p>
      <p className="text-body font-medium text-surface-900">{value}</p>
    </div>
  );
}

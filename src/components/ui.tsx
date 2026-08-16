import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { createPortal } from 'react-dom';
import { X, ChevronDown, Check, AlertTriangle, Info, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';

/* ---------------- Button ---------------- */
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
  secondary: 'bg-surface-100 text-surface-700 hover:bg-surface-200 active:bg-surface-300 border border-surface-200',
  outline: 'bg-white text-surface-700 border border-surface-300 hover:bg-surface-50 hover:border-surface-400 active:bg-surface-100',
  ghost: 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 active:bg-surface-200',
  danger: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 shadow-sm',
  success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 shadow-sm',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-caption gap-1.5',
  md: 'h-9 px-4 text-body gap-2',
  lg: 'h-11 px-6 text-body gap-2',
  icon: 'h-9 w-9 p-0',
};

export function Button({ variant = 'primary', size = 'md', leftIcon, rightIcon, loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 select-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

/* ---------------- Card ---------------- */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}
export function Card({ className, children, ...props }: CardProps) {
  return <div className={cn('card-base', className)} {...props}>{children}</div>;
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}
export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 py-4 border-b border-surface-200', className)}>
      <div className="min-w-0">
        <h3 className="text-title font-semibold text-surface-900 truncate">{title}</h3>
        {description && <p className="text-caption text-surface-500 mt-0.5">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ---------------- Badge ---------------- */
type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'error' | 'accent' | 'neutral';
interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
  dot?: boolean;
}
const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-surface-100 text-surface-600 border-surface-200',
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  success: 'bg-success-50 text-success-700 border-success-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  error: 'bg-error-50 text-error-700 border-error-200',
  accent: 'bg-accent-50 text-accent-700 border-accent-200',
  neutral: 'bg-surface-200 text-surface-700 border-surface-300',
};
const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-surface-400',
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  accent: 'bg-accent-500',
  neutral: 'bg-surface-500',
};
export function Badge({ variant = 'default', className, children, dot }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-caption font-medium', badgeVariants[variant], className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

/* status helpers */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    'Available': 'success',
    'Assigned': 'brand',
    'In Maintenance': 'warning',
    'Retired': 'neutral',
    'Active': 'success',
    'Expiring Soon': 'warning',
    'Expired': 'error',
    'In Stock': 'success',
    'Low Stock': 'warning',
    'Out of Stock': 'error',
    'Scheduled': 'accent',
    'In Progress': 'warning',
    'Completed': 'success',
    'Overdue': 'error',
    'Inactive': 'neutral',
    'Suspended': 'error',
  };
  return <Badge variant={map[status] ?? 'default'} dot>{status}</Badge>;
}

/* ---------------- Input ---------------- */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: ReactNode;
}
export function Input({ label, error, helpText, leftIcon, className, id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-caption font-medium text-surface-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">{leftIcon}</span>}
        <input
          id={inputId}
          className={cn('input-base', leftIcon ? 'pl-9' : '', error && 'error', className)}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-caption text-error-600 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      ) : helpText ? (
        <p className="text-caption text-surface-500 mt-1">{helpText}</p>
      ) : null}
    </div>
  );
}

/* ---------------- Select ---------------- */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: { value: string; label: string }[];
}
export function Select({ label, error, helpText, options, className, id, ...props }: SelectProps) {
  const selectId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-caption font-medium text-surface-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn('input-base appearance-none pr-9', error && 'error', className)}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
      </div>
      {error ? (
        <p className="text-caption text-error-600 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      ) : helpText ? (
        <p className="text-caption text-surface-500 mt-1">{helpText}</p>
      ) : null}
    </div>
  );
}

/* ---------------- Textarea ---------------- */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}
export function Textarea({ label, error, helpText, className, id, ...props }: TextareaProps) {
  const taId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={taId} className="block text-caption font-medium text-surface-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea id={taId} className={cn('input-base resize-y min-h-20', error && 'error', className)} {...props} />
      {error ? (
        <p className="text-caption text-error-600 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      ) : helpText ? (
        <p className="text-caption text-surface-500 mt-1">{helpText}</p>
      ) : null}
    </div>
  );
}

/* ---------------- Checkbox ---------------- */
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className={cn('inline-flex items-center gap-2 cursor-pointer select-none', className)}>
      <input type="checkbox" id={id} className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" {...props} />
      {label && <span className="text-body text-surface-700">{label}</span>}
    </label>
  );
}

/* indeterminate-capable checkbox for table headers */
interface Checkbox2Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked'> {
  label?: string;
  checked?: boolean | 'indeterminate';
}
export function Checkbox2({ label, className, id, checked, ...props }: Checkbox2Props) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = checked === 'indeterminate';
  }, [checked]);
  return (
    <label htmlFor={id} className={cn('inline-flex items-center gap-2 cursor-pointer select-none', className)}>
      <input ref={ref} type="checkbox" id={id} checked={checked === true} className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" {...props} />
      {label && <span className="text-body text-surface-700">{label}</span>}
    </label>
  );
}

/* ---------------- Modal ---------------- */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  width?: string;
}
const modalSizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
export function Modal({ open, onClose, title, description, children, footer, size = 'md', width }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn('relative w-full bg-white rounded-lg shadow-xl border border-surface-200 animate-scale-in', width || modalSizes[size])}>
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-surface-200">
            <div>
              {title && <h2 className="text-heading font-semibold text-surface-900">{title}</h2>}
              {description && <p className="text-body text-surface-500 mt-1">{description}</p>}
            </div>
            <button onClick={onClose} className="text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-md p-1 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children && <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>}
        {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200 bg-surface-50 rounded-b-lg">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/* ---------------- ConfirmDialog ---------------- */
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'primary' }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex gap-4">
        <div className={cn('h-10 w-10 rounded-full flex items-center justify-center shrink-0', variant === 'danger' ? 'bg-error-100' : 'bg-brand-100')}>
          <AlertTriangle className={cn('h-5 w-5', variant === 'danger' ? 'text-error-600' : 'text-brand-600')} />
        </div>
        <div className="flex-1">
          <h2 className="text-title font-semibold text-surface-900">{title}</h2>
          <p className="text-body text-surface-600 mt-1">{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose}>{cancelLabel}</Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

/* ---------------- Drawer ---------------- */
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  side?: 'right' | 'left';
  width?: string;
}
export function Drawer({ open, onClose, title, description, children, footer, side = 'right', width = 'max-w-md' }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-surface-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn('absolute top-0 bottom-0 bg-white shadow-xl border-surface-200 flex flex-col animate-slide-in-right w-full', width, side === 'right' ? 'right-0 border-l' : 'left-0 border-r')}>
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-surface-200">
          <div>
            {title && <h2 className="text-title font-semibold text-surface-900">{title}</h2>}
            {description && <p className="text-caption text-surface-500 mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-md p-1 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200 bg-surface-50">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/* ---------------- Tabs ---------------- */
interface TabItem { id: string; label: string; icon?: ReactNode; count?: number }
interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}
export function Tabs({ items, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('border-b border-surface-200 overflow-x-auto no-scrollbar', className)}>
      <div className="flex gap-1 px-1">
        {items.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2.5 text-body font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              active === tab.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-surface-500 hover:text-surface-800 hover:border-surface-300',
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn('rounded-full px-1.5 py-0.5 text-caption font-medium', active === tab.id ? 'bg-brand-100 text-brand-700' : 'bg-surface-100 text-surface-500')}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Avatar ---------------- */
interface AvatarProps {
  initials: string;
  name?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}
const avatarSizes = { xs: 'h-6 w-6 text-caption', sm: 'h-8 w-8 text-caption', md: 'h-10 w-10 text-body', lg: 'h-12 w-12 text-title' };
export function Avatar({ initials, name, color = 'bg-brand-500', size = 'sm', className }: AvatarProps) {
  return (
    <span
      title={name}
      className={cn('inline-flex items-center justify-center rounded-full text-white font-medium shrink-0', color, avatarSizes[size], className)}
    >
      {initials}
    </span>
  );
}

/* ---------------- Alert ---------------- */
type AlertVariant = 'info' | 'success' | 'warning' | 'error';
interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  className?: string;
  children?: ReactNode;
  onClose?: () => void;
}
const alertStyles: Record<AlertVariant, { container: string; icon: ReactNode }> = {
  info: { container: 'bg-brand-50 border-brand-200 text-brand-800', icon: <Info className="h-5 w-5 text-brand-600" /> },
  success: { container: 'bg-success-50 border-success-200 text-success-800', icon: <CheckCircle2 className="h-5 w-5 text-success-600" /> },
  warning: { container: 'bg-warning-50 border-warning-200 text-warning-800', icon: <AlertTriangle className="h-5 w-5 text-warning-600" /> },
  error: { container: 'bg-error-50 border-error-200 text-error-800', icon: <AlertCircle className="h-5 w-5 text-error-600" /> },
};
export function Alert({ variant = 'info', title, className, children, onClose }: AlertProps) {
  const s = alertStyles[variant];
  return (
    <div className={cn('flex gap-3 rounded-lg border p-4', s.container, className)}>
      <span className="shrink-0">{s.icon}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="text-body font-semibold">{title}</p>}
        {children && <div className="text-body mt-0.5 opacity-90">{children}</div>}
      </div>
      {onClose && <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>}
    </div>
  );
}

/* ---------------- Toast ---------------- */
interface Toast { id: number; variant: AlertVariant; title: string; message?: string }
interface ToastContextType {
  push: (t: Omit<Toast, 'id'>) => void;
  addToast: (title: string, variant?: AlertVariant, message?: string) => void;
}
const ToastContext = createContext<ToastContextType>({
  push: () => {},
  addToast: () => {},
});
export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { ...t, id }]);
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 4000);
  };
  const addToast = (title: string, variant: AlertVariant = 'info', message?: string) => {
    push({ title, variant, message });
  };
  return (
    <ToastContext.Provider value={{ push, addToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80">
          {toasts.map((t) => {
            const s = alertStyles[t.variant];
            return (
              <div key={t.id} className={cn('flex gap-3 rounded-lg border p-4 shadow-lg bg-white animate-slide-in-right', s.container)}>
                <span className="shrink-0">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-semibold">{t.title}</p>
                  {t.message && <p className="text-caption mt-0.5 opacity-90">{t.message}</p>}
                </div>
                <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} className="shrink-0 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

/* ---------------- Dropdown ---------------- */
export interface DropdownItem { label: string; icon?: ReactNode; onClick?: () => void; danger?: boolean; divider?: boolean }
interface DropdownProps { trigger: ReactNode; items: DropdownItem[]; align?: 'left' | 'right' }
export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="inline-flex">{trigger}</button>
      {open && (
        <div className={cn('absolute mt-1 w-48 bg-white rounded-lg border border-surface-200 shadow-lg py-1 z-50 animate-fade-in-up', align === 'right' ? 'right-0' : 'left-0')}>
          {items.map((item, i) => item.divider ? (
            <div key={i} className="h-px bg-surface-200 my-1" />
          ) : (
            <button
              key={i}
              onClick={() => { item.onClick?.(); setOpen(false); }}
              className={cn('w-full flex items-center gap-2.5 px-3 py-2 text-body transition-colors', item.danger ? 'text-error-600 hover:bg-error-50' : 'text-surface-700 hover:bg-surface-100')}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Breadcrumb ---------------- */
interface BreadcrumbItem { label: string; href?: string }
interface BreadcrumbProps { items: BreadcrumbItem[] }
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-caption">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-surface-400" />}
          {item.href && i < items.length - 1 ? (
            <span className="text-surface-500 hover:text-surface-800 cursor-pointer transition-colors">{item.label}</span>
          ) : (
            <span className={cn('font-medium', i === items.length - 1 ? 'text-surface-900' : 'text-surface-500')}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ---------------- Pagination ---------------- */
interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}
export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-surface-200">
      <p className="text-caption text-surface-500">
        Showing <span className="font-medium text-surface-700">{start}-{end}</span> of <span className="font-medium text-surface-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn('h-8 min-w-8 px-2 rounded-md text-caption font-medium transition-colors', page === p ? 'bg-brand-600 text-white' : 'text-surface-600 hover:bg-surface-100')}
            >
              {p}
            </button>
          );
        })}
        <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

/* ---------------- EmptyState ---------------- */
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}>
      {icon && <div className="h-14 w-14 rounded-full bg-surface-100 flex items-center justify-center text-surface-400 mb-4">{icon}</div>}
      <h3 className="text-title font-semibold text-surface-900">{title}</h3>
      {description && <p className="text-body text-surface-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------------- Progress ---------------- */
export function Progress({ value, max = 100, className, barClass }: { value: number; max?: number; className?: string; barClass?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={cn('h-2 w-full rounded-full bg-surface-200 overflow-hidden', className)}>
      <div className={cn('h-full rounded-full transition-all duration-300', barClass ?? 'bg-brand-500')} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------------- SectionCard (form sections) ---------------- */
interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}
export function SectionCard({ title, description, action, children, className }: SectionCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-surface-200">
        <div className="min-w-0">
          <h3 className="text-title font-semibold text-surface-900 truncate">{title}</h3>
          {description && <p className="text-caption text-surface-500 mt-0.5">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

/* ---------------- MenuButton (row action trigger) ---------------- */
export function MenuButton({ items, align = 'right' }: { items: DropdownItem[]; align?: 'left' | 'right' }) {
  return (
    <Dropdown
      align={align}
      trigger={<span className="flex h-8 w-8 items-center justify-center rounded-md text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"><MoreHorizontal className="h-4 w-4" /></span>}
      items={items}
    />
  );
}

export { Check };

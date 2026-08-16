import { useState } from 'react';
import { Plus, Warehouse, Package, ArrowRightLeft, ClipboardCheck, TrendingDown, Boxes, MapPin } from 'lucide-react';
import { Card, CardHeader, Button, Badge, StatusBadge, Progress, useToast } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { inventoryItems, type InventoryItem } from '@/data/mockData';
import { cn } from '@/lib/cn';

interface InventoryProps {
  onNavigate: (id: string) => void;
}

export function Inventory({ onNavigate }: InventoryProps) {
  const { push } = useToast();
  const [tab, setTab] = useState<'stock' | 'transfers' | 'receiving'>('stock');

  const stats = [
    { label: 'Total Items', value: inventoryItems.length, icon: Boxes, color: 'brand' },
    { label: 'In Stock', value: inventoryItems.filter((i) => i.status === 'In Stock').length, icon: Package, color: 'success' },
    { label: 'Low Stock', value: inventoryItems.filter((i) => i.status === 'Low Stock').length, icon: TrendingDown, color: 'warning' },
    { label: 'Out of Stock', value: inventoryItems.filter((i) => i.status === 'Out of Stock').length, icon: TrendingDown, color: 'error' },
  ];

  const columns: Column<InventoryItem>[] = [
    { key: 'name', header: 'Item', sortable: true, sortValue: (r) => r.name, render: (r) => (
      <div><p className="font-medium text-surface-900">{r.name}</p><p className="text-caption text-surface-500">{r.sku}</p></div>
    ) },
    { key: 'category', header: 'Category', sortable: true, sortValue: (r) => r.category, render: (r) => <Badge variant="neutral">{r.category}</Badge> },
    { key: 'warehouse', header: 'Warehouse', sortable: true, sortValue: (r) => r.warehouse, render: (r) => (
      <span className="flex items-center gap-1.5 text-surface-600"><Warehouse className="h-3.5 w-3.5 text-surface-400" />{r.warehouse}</span>
    ) },
    { key: 'quantity', header: 'Quantity', sortable: true, sortValue: (r) => r.quantity, align: 'right', render: (r) => (
      <div className="flex items-center justify-end gap-2">
        <span className="font-medium text-surface-900">{r.quantity}</span>
        <span className="text-caption text-surface-400">/ min {r.minStock}</span>
      </div>
    ) },
    { key: 'unitCost', header: 'Unit Cost', sortable: true, sortValue: (r) => r.unitCost, align: 'right', render: (r) => <span className="text-surface-700">${r.unitCost}</span> },
    { key: 'totalValue', header: 'Total Value', sortable: true, sortValue: (r) => r.quantity * r.unitCost, align: 'right', render: (r) => <span className="font-medium text-surface-900">${(r.quantity * r.unitCost).toLocaleString()}</span> },
    { key: 'status', header: 'Status', sortable: true, sortValue: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', `bg-${s.color}-50`, `text-${s.color}-600`)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-heading font-bold text-surface-900">{s.value}</p>
                <p className="text-caption text-surface-500">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
          {[
            { id: 'stock', label: 'Stock', icon: Package },
            { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
            { id: 'receiving', label: 'Receiving', icon: ClipboardCheck },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as 'stock' | 'transfers' | 'receiving')} className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-body font-medium transition-colors', tab === t.id ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-600')}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<ArrowRightLeft className="h-4 w-4" />} onClick={() => push({ variant: 'info', title: 'Transfer', message: 'Open transfer form' })}>Transfer</Button>
          <Button variant="outline" size="sm" leftIcon={<ClipboardCheck className="h-4 w-4" />} onClick={() => push({ variant: 'info', title: 'Check In', message: 'Open check-in form' })}>Check In</Button>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => push({ variant: 'info', title: 'Add item', message: 'Open item form' })}>Add Item</Button>
        </div>
      </div>

      {tab === 'stock' && (
        <DataTable
          columns={columns}
          data={inventoryItems}
          searchable
          searchPlaceholder="Search inventory..."
          rowActions={(row) => [
            { label: 'View Details', onClick: () => push({ variant: 'info', title: row.name, message: row.sku }) },
            { label: 'Reorder', onClick: () => push({ variant: 'success', title: 'Reorder placed', message: row.name }) },
            { label: 'Transfer', onClick: () => push({ variant: 'info', title: 'Transfer', message: row.name }) },
          ]}
        />
      )}

      {tab === 'transfers' && (
        <Card>
          <CardHeader title="Stock Transfers" description="Movement between warehouses" />
          <div className="p-5">
            <div className="space-y-3">
              {[
                { id: 't1', item: 'Dell USB-C Dock', from: 'HQ Storage', to: 'Boston Branch', qty: 5, date: '2025-07-28', status: 'In Transit' },
                { id: 't2', item: 'Webcam 1080p', from: 'Boston Branch', to: 'HQ Storage', qty: 10, date: '2025-07-25', status: 'Completed' },
                { id: 't3', item: 'UPS Battery Backup', from: 'Data Center East', to: 'HQ Storage', qty: 2, date: '2025-07-22', status: 'Completed' },
              ].map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-3 border-b border-surface-100 last:border-0">
                  <div className="h-9 w-9 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center"><ArrowRightLeft className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-surface-900">{t.item} ×{t.qty}</p>
                    <p className="text-caption text-surface-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{t.from} → {t.to}</p>
                  </div>
                  <span className="text-caption text-surface-400">{t.date}</span>
                  <Badge variant={t.status === 'Completed' ? 'success' : 'warning'} dot>{t.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {tab === 'receiving' && (
        <Card>
          <CardHeader title="Receiving Log" description="Recently received stock" />
          <div className="p-5">
            <div className="space-y-3">
              {[
                { id: 'r1', item: 'Logitech MX Master 3S', qty: 30, warehouse: 'HQ Storage', po: 'PO-2025-0152', date: '2025-07-27' },
                { id: 'r2', item: '27" 4K Monitor', qty: 5, warehouse: 'Boston Branch', po: 'PO-2025-0151', date: '2025-07-24' },
                { id: 'r3', item: 'Cat6 Ethernet Cable 3m', qty: 100, warehouse: 'Austin Branch', po: 'PO-2025-0148', date: '2025-07-20' },
              ].map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-3 border-b border-surface-100 last:border-0">
                  <div className="h-9 w-9 rounded-lg bg-success-50 text-success-600 flex items-center justify-center"><ClipboardCheck className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-surface-900">{r.item} ×{r.qty}</p>
                    <p className="text-caption text-surface-500">{r.po} · {r.warehouse}</p>
                  </div>
                  <span className="text-caption text-surface-400">{r.date}</span>
                  <Badge variant="success" dot>Received</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

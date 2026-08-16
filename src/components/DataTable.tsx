import { useState, type ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, SlidersHorizontal, Download, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button, Checkbox, Checkbox2, Dropdown, EmptyState, Pagination, Skeleton } from '@/components/ui';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  rowActions?: (row: T) => { label: string; icon?: ReactNode; onClick?: () => void; danger?: boolean; divider?: boolean }[];
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  totalCount?: number;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  searchable,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  pageSize = 8,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or search query.',
  emptyAction,
  rowActions,
  onRowClick,
  toolbar,
  totalCount,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sorted = [...data];
  if (sortKey) {
    const col = columns.find((c) => c.key === sortKey);
    if (col?.sortValue) {
      sorted.sort((a, b) => {
        const av = col.sortValue!(a);
        const bv = col.sortValue!(b);
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
  }

  const total = totalCount ?? sorted.length;
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);
  const allSelected = paged.length > 0 && paged.every((r) => selected.has(r.id));
  const someSelected = paged.some((r) => selected.has(r.id));

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) paged.forEach((r) => next.delete(r.id));
    else paged.forEach((r) => next.add(r.id));
    setSelected(next);
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="card-base overflow-hidden">
      {/* Toolbar */}
      {(searchable || toolbar) && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200 flex-wrap">
          {searchable && (
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="input-base pl-9 h-9"
              />
            </div>
          )}
          {toolbar}
          <Button variant="outline" size="sm" leftIcon={<SlidersHorizontal className="h-4 w-4" />}>Filter</Button>
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export</Button>
        </div>
      )}

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-brand-50 border-b border-brand-200 animate-fade-in">
          <span className="text-body font-medium text-brand-700">{selected.size} selected</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm">Bulk Edit</Button>
          <Button variant="ghost" size="sm">Export Selected</Button>
          <Button variant="ghost" size="sm" className="text-error-600 hover:bg-error-50">Delete</Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-50 sticky top-0">
            <tr>
              <th className="w-10 px-4 py-2.5">
                <Checkbox2 checked={allSelected ? true : someSelected ? 'indeterminate' : false} onChange={toggleAll} />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn('px-4 py-2.5 text-caption font-semibold text-surface-600 uppercase tracking-wider', col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left')}
                >
                  {col.sortable ? (
                    <button onClick={() => toggleSort(col.key)} className="inline-flex items-center gap-1 hover:text-surface-900 transition-colors">
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 text-surface-300" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {rowActions && <th className="w-10 px-4 py-2.5" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
                  {columns.map((c) => <td key={c.key} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                  <td className="px-4 py-3" />
                </tr>
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2}>
                  <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn('transition-colors', selected.has(row.id) ? 'bg-brand-50/50' : 'hover:bg-surface-50', onRowClick && 'cursor-pointer')}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 text-body text-surface-700', col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left')}>
                      {col.render(row)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Dropdown
                        align="right"
                        trigger={<span className="flex h-7 w-7 items-center justify-center rounded-md text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors"><MoreHorizontal className="h-4 w-4" /></span>}
                        items={rowActions(row).map((a) => ({ label: a.label, icon: a.icon, onClick: a.onClick, danger: a.danger }))}
                      />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && paged.length > 0 && (
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      )}
    </div>
  );
}

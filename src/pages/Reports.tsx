import { useState } from 'react';
import { FileText, Download, FileSpreadsheet, Calendar, Filter, TrendingUp, TrendingDown, DollarSign, Boxes, Wrench, Sparkles, ArrowUpRight, ArrowDownRight, Lightbulb, ChevronRight } from 'lucide-react';
import { Card, CardHeader, Button, Badge, Select, Input } from '@/components/ui';
import { BarChart, DonutChart, LineChart, ProgressBarChart } from '@/components/Charts';
import { assetLifecycleData, departmentDistribution, assetTypeDistribution, kpis } from '@/data/mockData';
import { aiExecutiveSummary } from '@/data/aiData';
import { cn } from '@/lib/cn';

interface ReportsProps {
  onNavigate: (id: string) => void;
}

export function Reports({ onNavigate }: ReportsProps) {
  const [reportType, setReportType] = useState('asset-summary');

  const reports = [
    { id: 'asset-summary', title: 'Asset Summary Report', description: 'Complete overview of all assets', icon: Boxes, format: 'PDF' },
    { id: 'depreciation', title: 'Depreciation Report', description: 'Asset value over time', icon: TrendingUp, format: 'Excel' },
    { id: 'maintenance', title: 'Maintenance Report', description: 'Maintenance history and costs', icon: Wrench, format: 'PDF' },
    { id: 'financial', title: 'Financial Report', description: 'Purchase costs and current values', icon: DollarSign, format: 'Excel' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Report type selector + filters */}
      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select label="Report Type" value={reportType} onChange={(e) => setReportType(e.target.value)} options={reports.map((r) => ({ value: r.id, label: r.title }))} />
          <Input label="From Date" type="date" />
          <Input label="To Date" type="date" />
          <div className="flex items-end gap-2">
            <Button variant="outline" size="md" leftIcon={<Filter className="h-4 w-4" />} className="flex-1">Apply</Button>
          </div>
        </div>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: kpis.totalAssets, icon: Boxes, color: 'brand' },
          { label: 'Total Value', value: '$2.4M', icon: DollarSign, color: 'success' },
          { label: 'Maintenance Cost', value: '$8.4K', icon: Wrench, color: 'warning' },
          { label: 'Depreciation', value: '$42.8K', icon: TrendingDown, color: 'accent' },
        ].map((s) => (
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Asset Acquisition Trend" description="Monthly acquisitions and retirements" />
          <div className="p-5 h-64">
            <BarChart data={assetLifecycleData.map((d) => ({ label: d.month, value: d.acquired, value2: d.retired }))} height={220} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Value Trend" description="Total portfolio value over time" />
          <div className="p-5 h-64">
            <LineChart data={[
              { label: 'Jan', value: 2100000 }, { label: 'Feb', value: 2150000 }, { label: 'Mar', value: 2280000 },
              { label: 'Apr', value: 2320000 }, { label: 'May', value: 2410000 }, { label: 'Jun', value: 2400000 },
              { label: 'Jul', value: 2430000 },
            ]} height={220} color="#059669" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="By Department" />
          <div className="p-5">
            <DonutChart data={departmentDistribution.map((d) => ({ label: d.department, value: d.count, color: d.color }))} centerValue="1,248" centerLabel="Assets" />
          </div>
        </Card>
        <Card>
          <CardHeader title="By Type" />
          <div className="p-5">
            <ProgressBarChart data={assetTypeDistribution.map((t) => ({ label: t.type, value: t.count, max: 412, color: t.color }))} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Available Reports" />
          <div className="p-3">
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-surface-50 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><r.icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-surface-900 truncate">{r.title}</p>
                  <p className="text-caption text-surface-500">{r.description}</p>
                </div>
                <Button variant="ghost" size="icon" title={`Export ${r.format}`}><Download className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Export bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-surface-400" />
            <p className="text-body text-surface-600">Report generated for <span className="font-medium text-surface-900">{reports.find((r) => r.id === reportType)?.title}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<FileText className="h-4 w-4" />}>Export PDF</Button>
            <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet className="h-4 w-4" />}>Export Excel</Button>
            <Button size="sm" leftIcon={<Download className="h-4 w-4" />}>Download</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

import { cn } from '@/lib/cn';

/* Lightweight SVG charts — no external deps */

interface BarChartProps {
  data: { label: string; value: number; value2?: number }[];
  height?: number;
  color?: string;
  color2?: string;
}

export function BarChart({ data, height = 200, color = 'bg-brand-500', color2 = 'bg-accent-400' }: BarChartProps) {
  const max = Math.max(...data.flatMap((d) => [d.value, d.value2 ?? 0]));
  return (
    <div className="flex items-end gap-3 h-full" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 group">
          <div className="w-full flex items-end justify-center gap-1 flex-1">
            <div className={cn('w-3 rounded-t transition-all duration-300 group-hover:opacity-80', color)} style={{ height: `${(d.value / max) * 100}%` }} title={`${d.value}`} />
            {d.value2 !== undefined && (
              <div className={cn('w-3 rounded-t transition-all duration-300 group-hover:opacity-80', color2)} style={{ height: `${(d.value2 / max) * 100}%` }} title={`${d.value2}`} />
            )}
          </div>
          <span className="text-caption text-surface-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ data, size = 160, thickness = 24, centerLabel, centerValue }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={thickness} className="text-surface-200" />
          {data.map((d, i) => {
            const len = (d.value / total) * circumference;
            const dash = `${len} ${circumference - len}`;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={thickness}
                className={d.color.replace('bg-', 'text-')}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && <span className="text-heading font-bold text-surface-900">{centerValue}</span>}
            {centerLabel && <span className="text-caption text-surface-500">{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 min-w-0">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2.5">
            <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', d.color)} />
            <span className="text-body text-surface-600 truncate">{d.label}</span>
            <span className="text-body font-semibold text-surface-900 ml-auto">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

export function LineChart({ data, height = 200, color = '#2563eb' }: LineChartProps) {
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const w = 100;
  const h = 100;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d.value - min) / range) * h;
    return { x, y, ...d };
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#lineGrad)" />
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="white" stroke={color} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((d) => (
          <span key={d.label} className="text-caption text-surface-500">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

interface ProgressBarChartProps {
  data: { label: string; value: number; max: number; color: string }[];
}

export function ProgressBarChart({ data }: ProgressBarChartProps) {
  return (
    <div className="flex flex-col gap-4">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-body text-surface-600">{d.label}</span>
            <span className="text-body font-semibold text-surface-900">{d.value}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-200 overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-500', d.color)} style={{ width: `${(d.value / d.max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

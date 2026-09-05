import React from 'react';
import { cn, formatINR } from '@/lib/utils';
import { TrendingDown, TrendingUp, AlertTriangle, Package, Users, Truck, IndianRupee, CalendarClock } from 'lucide-react';
import { Badge } from './Badge';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  alert: AlertTriangle, package: Package, users: Users, truck: Truck, revenue: IndianRupee, calendar: CalendarClock,
};

export function KpiCard({
  label, value, icon, trend, variant = 'neutral', hint,
}: {
  label: string; value: string | number; icon: keyof typeof iconMap;
  trend?: { dir: 'up' | 'down'; text: string }; variant?: 'neutral' | 'danger' | 'warning' | 'success' | 'primary'; hint?: string;
}) {
  const Icon = iconMap[icon] ?? AlertTriangle;
  const accent = {
    neutral: 'text-slate-300 bg-ink-700/60',
    danger: 'text-danger-400 bg-danger-500/15',
    warning: 'text-warn-400 bg-warn-500/15',
    success: 'text-mint-400 bg-mint-500/15',
    primary: 'text-brand-300 bg-brand-500/15',
  }[variant];
  return (
    <div className="card p-4 group hover:border-ink-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="kpi-label">{label}</div>
        <div className={cn('rounded-lg p-1.5', accent)}><Icon className="w-4 h-4" /></div>
      </div>
      <div className="mt-2 text-2xl font-bold text-white tracking-tight">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {trend && (
          <span className={cn('inline-flex items-center gap-1', trend.dir === 'up' ? 'text-mint-400' : 'text-danger-400')}>
            {trend.dir === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.text}
          </span>
        )}
        {hint && <span className="muted">{hint}</span>}
      </div>
    </div>
  );
}

export function KpiRow({ items }: { items: { label: string; value: string | number; icon: keyof typeof iconMap; variant?: 'neutral' | 'danger' | 'warning' | 'success' | 'primary'; trend?: { dir: 'up' | 'down'; text: string }; hint?: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it, i) => <KpiCard key={i} {...it} />)}
    </div>
  );
}

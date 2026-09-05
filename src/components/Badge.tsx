import React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
  success: 'bg-mint-500/15 text-mint-400 border-mint-500/30',
  warning: 'bg-warn-500/15 text-warn-400 border-warn-500/30',
  danger:  'bg-danger-500/15 text-danger-400 border-danger-500/30',
  neutral: 'bg-ink-700/60 text-slate-300 border-ink-600',
  info:    'bg-sky-500/15 text-sky-300 border-sky-500/30',
};

export function Badge({ variant = 'neutral', children, className }: { variant?: Variant; children: React.ReactNode; className?: string }) {
  return <span className={cn('chip border', variants[variant], className)}>{children}</span>;
}

const sevMap: Record<string, Variant> = {
  CRITICAL: 'danger', HIGH: 'danger', MEDIUM: 'warning', LOW: 'info', NONE: 'success',
};
export function SeverityBadge({ severity }: { severity: string }) {
  return <Badge variant={sevMap[severity] ?? 'neutral'}>{severity}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const v: Variant = /delay|halt|stop|critical/i.test(status) ? 'danger'
    : /in transit|scheduled|active|open|picking/i.test(status) ? 'info'
    : /delivered|safe|on time|platinum|gold/i.test(status) ? 'success'
    : /at risk|medium|silver/i.test(status) ? 'warning' : 'neutral';
  return <Badge variant={v}>{status}</Badge>;
}

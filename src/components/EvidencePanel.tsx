import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Finding } from '@/data/engine';
import { Badge } from './Badge';

export function EvidencePanel({ findings }: { findings: Finding[] }) {
  const [open, setOpen] = useState<string | null>(findings[0]?.id ?? null);

  if (findings.length === 0) {
    return <div className="card p-8 text-center muted">No findings yet. Analyze a disruption to generate evidence-backed conclusions.</div>;
  }

  const sevVariant = (s: Finding['severity']) => s === 'CRITICAL' ? 'danger' : s === 'HIGH' ? 'danger' : s === 'MEDIUM' ? 'warning' : s === 'LOW' ? 'info' : 'neutral';

  return (
    <div className="space-y-2.5">
      {findings.map(f => {
        const isOpen = open === f.id;
        return (
          <div key={f.id} className="card overflow-hidden">
            <button onClick={() => setOpen(isOpen ? null : f.id)} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-ink-700/30 transition">
              <span className="mt-0.5 text-slate-500">{isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={sevVariant(f.severity)}>{f.severity}</Badge>
                  <span className="text-[11px] muted mono">{f.id}</span>
                </div>
                <p className="text-sm text-slate-200">{f.statement}</p>
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pl-11 animate-fade-in">
                <div className="kpi-label mb-2">Evidence trail</div>
                <ol className="space-y-1.5">
                  {f.evidence.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-brand-400 mono whitespace-nowrap">{e.ref}</span>
                      <span className="muted">→ {e.detail}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

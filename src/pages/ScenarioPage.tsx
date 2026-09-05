import React from 'react';
import { scenarios } from '@/data/engine';
import type { ImpactAnalysis } from '@/data/engine';
import { Badge } from '@/components/Badge';
import { SeverityBadge } from '@/components/Badge';
import { FlaskConical, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { PageKey } from '@/components/Layout';

const catVariant: Record<string, 'danger' | 'warning' | 'primary' | 'success' | 'neutral'> = {
  'Supplier Failure': 'danger',
  'Carrier Delay': 'warning',
  'Warehouse Incident': 'warning',
  'No Impact': 'success',
  'Ambiguous': 'neutral',
};

export function ScenarioPage({ impact, runScenario, setPage }: { impact: ImpactAnalysis | null; runScenario: (text: string) => void; setPage: (p: PageKey) => void }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-1"><FlaskConical className="w-4 h-4 text-mint-400" /><h3 className="section-title">Scenario Center</h3></div>
        <p className="text-xs muted">Pick a scenario to load its disruption notice and run the full analysis pipeline. Each scenario tests a different edge case.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map(s => {
          const isCurrent = impact && impact.disruptionType && s.inputText.includes(impact.disruptionType.slice(0, 8));
          return (
            <div key={s.id} className="card p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs muted mono">Scenario {s.id.replace('sc', '')}</span>
                <Badge variant={catVariant[s.category]}>{s.category}</Badge>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">{s.title}</h3>
              <p className="text-xs muted mb-3">{s.description}</p>
              <div className="card-soft p-3 text-xs mono text-slate-300 mb-3 max-h-28 overflow-y-auto">{s.inputText}</div>
              <div className="text-xs muted mb-3"><b>Expected:</b> {s.expected}</div>
              <div className="mt-auto flex gap-2">
                <button className="btn-primary flex-1" onClick={() => { runScenario(s.inputText); setPage('analyzer'); }}>
                  Run Analysis <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {impact && (
        <div className="card p-4 flex items-center gap-3 flex-wrap">
          <span className="kpi-label">Last analysis:</span>
          <SeverityBadge severity={impact.severity} />
          <Badge variant="neutral">{impact.disruptionType}</Badge>
          {impact.noImpact && <Badge variant="success"><CheckCircle2 className="w-3 h-3" /> No impact</Badge>}
          {impact.needsReview && <Badge variant="warning">Needs review</Badge>}
          <button className="btn-ghost ml-auto" onClick={() => setPage('analyzer')}>View <ArrowRight className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
}

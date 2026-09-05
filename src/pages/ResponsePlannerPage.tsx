import React, { useState } from 'react';
import type { ImpactAnalysis, ResponseOption } from '@/data/engine';
import { generateResponseOptions, recommendationRationale } from '@/data/engine';
import { Badge, SeverityBadge } from '@/components/Badge';
import { Modal } from '@/components/Modal';
import { Check, X, AlertTriangle, ShieldAlert, Lightbulb, CheckCircle2, ThumbsUp } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';

export function ResponsePlannerPage({ impact }: { impact: ImpactAnalysis | null }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | 'approve' | 'modify' | 'escalate'>(null);

  if (!impact || impact.needsReview) {
    return <div className="card p-10 text-center muted">Run a disruption analysis to generate response options.</div>;
  }
  if (impact.noImpact) {
    return <div className="card p-10 text-center"><p className="text-mint-400 font-semibold">No response action needed.</p><p className="muted text-sm mt-1">The disruption has no current business impact.</p></div>;
  }

  const opts = generateResponseOptions(impact);
  const rationale = recommendationRationale(impact, opts);
  const recommended = opts.find(o => o.recommended) ?? opts[0];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3 flex-wrap">
        <SeverityBadge severity={impact.severity} />
        <Badge variant="warning">{impact.delayDays}d delay</Badge>
        <Badge variant="danger">{formatINR(impact.kpis.revenueAtRisk)} at risk</Badge>
      </div>

      {/* What-if comparison */}
      <div className="card p-5">
        <h3 className="section-title mb-1">What-if Analysis</h3>
        <p className="text-xs muted mb-4">Compare response strategies side by side. Costs and delays are derived from the current impact data.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {opts.map(o => (
            <button
              key={o.id}
              onClick={() => setChosen(chosen === o.id ? null : o.id)}
              className={cn(
                'card-soft p-4 text-left transition relative hover:border-brand-500/40 hover:bg-ink-700/30',
                chosen === o.id && 'border-brand-500/60 bg-brand-500/10 ring-1 ring-brand-500/30'
              )}
            >
              {o.recommended && <span className="absolute -top-2 left-3 chip bg-mint-500 text-white text-[10px]"><ThumbsUp className="w-3 h-3" /> Recommended</span>}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs muted mono">Option {o.id}</span>
                <Badge variant={o.risk === 'Low' ? 'success' : o.risk === 'Medium' ? 'warning' : 'danger'}>{o.risk} risk</Badge>
              </div>
              <div className="text-sm font-semibold text-white mb-2">{o.label}</div>
              <div className="space-y-1 text-xs">
                <Row k="Cost" v={o.costLabel} />
                <Row k="Delay" v={`${o.expectedDelayDays}d`} />
                <Row k="Customer impact" v={o.customerImpact} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Option detail */}
      {chosen && (() => {
        const o = opts.find(x => x.id === chosen)!;
        return (
          <div className="card p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">Option {o.id} — {o.label}</h3>
              <Badge variant="neutral">{o.costLabel}</Badge>
            </div>
            <p className="text-sm muted mb-4">{o.description}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="kpi-label mb-2 text-mint-400">Advantages</div>
                <ul className="space-y-1.5">{o.advantages.map((a, i) => <li key={i} className="text-sm text-slate-200 flex gap-2"><Check className="w-4 h-4 text-mint-400 shrink-0 mt-0.5" /> {a}</li>)}</ul>
              </div>
              <div>
                <div className="kpi-label mb-2 text-danger-400">Disadvantages</div>
                <ul className="space-y-1.5">{o.disadvantages.map((a, i) => <li key={i} className="text-sm text-slate-200 flex gap-2"><X className="w-4 h-4 text-danger-400 shrink-0 mt-0.5" /> {a}</li>)}</ul>
              </div>
              <div>
                <div className="kpi-label mb-2 text-warn-400">Assumptions</div>
                <ul className="space-y-1.5">{o.assumptions.map((a, i) => <li key={i} className="text-sm muted flex gap-2"><AlertTriangle className="w-4 h-4 text-warn-400 shrink-0 mt-0.5" /> {a}</li>)}</ul>
              </div>
              <div>
                <div className="kpi-label mb-2 text-brand-300">Evidence</div>
                <div className="flex flex-wrap gap-1.5">{o.evidence.map((e, i) => <span key={i} className="chip bg-brand-500/10 text-brand-300 mono text-[10px] border border-brand-500/20">{e}</span>)}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* AI Recommendation */}
      <div className="card p-5 border-brand-500/30 bg-gradient-to-br from-brand-500/5 to-transparent">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center"><Lightbulb className="w-4 h-4 text-brand-300" /></div>
          <h3 className="section-title">AI Recommendation</h3>
        </div>
        <div className="text-base font-semibold text-white mb-2">Recommended Action: {recommended?.label}</div>
        <p className="text-sm text-slate-300 leading-relaxed">{rationale}</p>
      </div>

      {/* Human in the loop */}
      <div className="card p-5">
        <h3 className="section-title mb-1">Human-in-the-loop decision</h3>
        <p className="text-xs muted mb-4">SupplyGuard recommends. A human operations manager approves.</p>
        <div className="flex flex-wrap gap-2.5">
          <button className="btn-primary" onClick={() => setConfirm('approve')}><CheckCircle2 className="w-4 h-4" /> Approve Recommendation</button>
          <button className="btn-outline" onClick={() => setConfirm('modify')}>Modify Response</button>
          <button className="btn-ghost text-warn-400 hover:bg-warn-500/10" onClick={() => setConfirm('escalate')}><ShieldAlert className="w-4 h-4" /> Escalate to Operations Team</button>
        </div>
      </div>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm === 'approve' ? 'Approve recommendation' : confirm === 'modify' ? 'Modify response' : 'Escalate to operations'}>
        {confirm === 'approve' && <p className="text-sm text-slate-300">Recommendation <b className="text-white">{recommended?.label}</b> will be recorded as approved. No automated business action will be executed — the operations team will carry it out manually.</p>}
        {confirm === 'modify' && <p className="text-sm text-slate-300">You can adjust the response plan. The modified plan will be logged with the original recommendation for audit purposes.</p>}
        {confirm === 'escalate' && <p className="text-sm text-slate-300">The case will be escalated to the operations team with the full evidence trail and recommendation attached.</p>}
        <div className="mt-5 flex gap-2 justify-end">
          <button className="btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
          <button className="btn-primary" onClick={() => setConfirm(null)}>Confirm</button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between"><span className="muted">{k}</span><span className="text-slate-200 font-medium">{v}</span></div>;
}

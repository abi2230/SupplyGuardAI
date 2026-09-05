import React, { useState } from 'react';
import { scenarios, analyzeDisruption } from '@/data/engine';
import type { ImpactAnalysis } from '@/data/engine';
import { ProcessingTimeline } from '@/components/ProcessingTimeline';
import { Badge, SeverityBadge, StatusBadge } from '@/components/Badge';
import { KpiRow } from '@/components/KpiCard';
import { ImpactGraph } from '@/components/ImpactGraph';
import { formatINR } from '@/lib/utils';
import { formatDate, byId } from '@/data/db';
import { Search, FileText, FlaskConical, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Lightbulb } from 'lucide-react';
import type { PageKey } from '@/components/Layout';

export function AnalyzerPage({ impact, setImpact, setPage }: { impact: ImpactAnalysis | null; setImpact: (i: ImpactAnalysis) => void; setPage: (p: PageKey) => void }) {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'idle' | 'processing' | 'done'>('idle');

  const analyze = () => {
    if (!text.trim()) return;
    setPhase('processing');
  };

  const onComplete = () => {
    setImpact(analyzeDisruption(text));
    setPhase('done');
  };

  const loadScenario = (s: typeof scenarios[number]) => {
    setText(s.inputText);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-brand-400" />
              <h3 className="section-title">Disruption Intake</h3>
            </div>
            <textarea
              className="input min-h-[160px] resize-y font-mono text-[13px] leading-relaxed"
              placeholder="Paste a supplier or carrier disruption email here…"
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs muted">{text.trim().split(/\s+/).filter(Boolean).length} words</div>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={() => setText('')} disabled={!text}>Clear</button>
                <button className="btn-primary" onClick={analyze} disabled={!text.trim() || phase === 'processing'}>
                  <Search className="w-4 h-4" /> Analyze Disruption
                </button>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-4 h-4 text-mint-400" />
              <h3 className="section-title">Sample scenarios</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {scenarios.map(s => (
                <button key={s.id} onClick={() => loadScenario(s)} className="card-soft p-3 text-left hover:border-brand-500/40 hover:bg-ink-700/30 transition group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white group-hover:text-brand-300 transition">{s.title}</span>
                    <Badge variant="neutral">{s.category}</Badge>
                  </div>
                  <p className="text-xs muted line-clamp-2">{s.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-brand-400" /><h3 className="section-title text-sm">How it works</h3></div>
            <ol className="space-y-2 text-xs muted">
              <li>1. AI extracts entities (supplier, product, shipment) from unstructured text.</li>
              <li>2. Deterministic engine maps entities to your structured data.</li>
              <li>3. Impact is calculated — never invented — from real records.</li>
              <li>4. Response options are generated with evidence citations.</li>
            </ol>
          </div>
          <div className="card p-4 bg-ink-800/40">
            <div className="flex items-center gap-2 mb-2"><ShieldAlert className="w-4 h-4 text-warn-400" /><h3 className="section-title text-sm">Guardrails</h3></div>
            <ul className="space-y-1.5 text-xs muted">
              <li>• AI never invents facts — every finding cites a record.</li>
              <li>• Calculations run deterministically from the database.</li>
              <li>• Ambiguous cases escalate to human review.</li>
              <li>• No business action executes automatically.</li>
            </ul>
          </div>
        </div>
      </div>

      {phase === 'processing' && <ProcessingTimeline onComplete={onComplete} />}

      {phase === 'done' && impact && <AnalysisResult impact={impact} setPage={setPage} />}
    </div>
  );
}

function AnalysisResult({ impact, setPage }: { impact: ImpactAnalysis; setPage: (p: PageKey) => void }) {
  if (impact.needsReview) {
    return (
      <div className="card p-8 text-center animate-slide-up border-warn-500/30">
        <ShieldAlert className="w-12 h-12 text-warn-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">Human Review Required</h3>
        <p className="muted text-sm mt-1 max-w-md mx-auto">{impact.reviewReason}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button className="btn-outline" onClick={() => setPage('scenarios')}>Try another scenario</button>
          <button className="btn-primary" onClick={() => setPage('analyzer')}>Re-analyze</button>
        </div>
      </div>
    );
  }

  if (impact.noImpact) {
    return (
      <div className="card p-8 text-center animate-slide-up border-mint-500/30">
        <CheckCircle2 className="w-12 h-12 text-mint-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">No Current Business Impact</h3>
        <p className="muted text-sm mt-1 max-w-md mx-auto">Although the disruption appears significant, no active shipment, inventory shortage, or customer order is currently affected.</p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg mx-auto">
          {[['Shipments', 0], ['Orders', 0], ['Units at risk', 0], ['Revenue', '₹0']].map(([l, v]) => (
            <div key={l as string} className="card-soft p-3"><div className="kpi-label">{l}</div><div className="text-lg font-bold text-white mt-0.5">{v}</div></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Extracted entities */}
      <div className="card p-5">
        <h3 className="section-title mb-3">AI Understanding</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Field label="Disruption type" value={impact.disruptionType} />
          <Field label="Supplier" value={impact.affectedShipments[0] ? byId.supplier(impact.affectedShipments[0].supplierId)?.name ?? '—' : '—'} />
          <Field label="Products" value={impact.affectedProducts.map(p => p.id).join(', ') || '—'} />
          <Field label="Shipments" value={impact.affectedShipments.map(s => s.id).join(', ') || '—'} />
          <Field label="Expected delay" value={impact.delayDays ? `${impact.delayDays} days` : 'Unknown'} />
          <Field label="Confidence" value={impact.confidence} highlight={impact.confidence === 'NEEDS_VERIFICATION' ? 'warn' : 'primary'} />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SeverityBadge severity={impact.severity} />
        <Badge variant="warning">{impact.delayDays}d expected delay</Badge>
        <Badge variant="neutral">Earliest affected: {impact.kpis.earliestAffectedDate ? formatDate(impact.kpis.earliestAffectedDate) : '—'}</Badge>
      </div>

      <KpiRow items={[
        { label: 'Products affected', value: impact.kpis.productsAffected, icon: 'package', variant: 'warning' },
        { label: 'Units at risk', value: impact.kpis.unitsAtRisk, icon: 'package', variant: 'danger' },
        { label: 'Shipments delayed', value: impact.kpis.shipmentsDelayed, icon: 'truck', variant: 'danger' },
        { label: 'Revenue at risk', value: formatINR(impact.kpis.revenueAtRisk), icon: 'revenue', variant: 'danger' },
      ]} />

      <KpiRow items={[
        { label: 'Orders affected', value: impact.kpis.ordersAffected, icon: 'users', variant: 'warning' },
        { label: 'Customers affected', value: impact.kpis.customersAffected, icon: 'users', variant: 'warning' },
        { label: 'Stock-out risks', value: impact.inventoryRisks.filter(r => r.stockOutRisk !== 'SAFE').length, icon: 'alert', variant: 'danger' },
        { label: 'Findings', value: impact.findings.length, icon: 'alert', variant: 'primary' },
      ]} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="section-title">Impact Graph</h3>
          <button className="btn-ghost text-xs" onClick={() => setPage('impact')}>Open full map</button>
        </div>
        <ImpactGraph data={impact.graph} />
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button className="btn-primary" onClick={() => setPage('response')}><Lightbulb className="w-4 h-4" /> View Response Options</button>
        <button className="btn-outline" onClick={() => setPage('orders')}>Affected Orders</button>
        <button className="btn-outline" onClick={() => setPage('evidence')}>Evidence Center</button>
      </div>
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: 'warn' | 'primary' }) {
  return (
    <div className="card-soft p-3">
      <div className="kpi-label">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${highlight === 'warn' ? 'text-warn-400' : highlight === 'primary' ? 'text-brand-300' : 'text-white'} truncate`}>{value}</div>
    </div>
  );
}

import React from 'react';
import type { ImpactAnalysis } from '@/data/engine';
import { KpiRow } from '@/components/KpiCard';
import { Badge, SeverityBadge, StatusBadge } from '@/components/Badge';
import { ImpactGraph } from '@/components/ImpactGraph';
import { Copilot } from '@/components/Copilot';
import { formatINR } from '@/lib/utils';
import { formatDate } from '@/data/db';
import { Search, ArrowRight, AlertTriangle, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';
import type { PageKey } from '@/components/Layout';

export function DashboardPage({ impact, setPage }: { impact: ImpactAnalysis | null; setPage: (p: PageKey) => void }) {
  const hasAnalysis = impact && !impact.needsReview;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hero */}
      <div className="relative card overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative p-6 lg:p-8">
          <Badge variant="primary"><ShieldAlert className="w-3 h-3" /> Evidence-first AI</Badge>
          <h2 className="mt-3 text-2xl lg:text-3xl font-bold text-white tracking-tight max-w-2xl">
            Turn supply chain disruptions into evidence-based decisions.
          </h2>
          <p className="mt-2 text-sm muted max-w-xl">
            Paste a disruption notice, and SupplyGuard AI traces the full impact across suppliers, shipments, inventory, orders and customers — then recommends a response grounded in your real data.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button className="btn-primary" onClick={() => setPage('analyzer')}>
              <Search className="w-4 h-4" /> Analyze New Disruption
            </button>
            <button className="btn-outline" onClick={() => setPage('scenarios')}>
              Browse Scenarios <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Live summary KPIs */}
      {hasAnalysis ? (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <SeverityBadge severity={impact!.severity} />
            <Badge variant="neutral">{impact!.disruptionType}</Badge>
            {impact!.delayDays != null && <Badge variant="warning">~{impact!.delayDays}d delay</Badge>}
            {impact!.noImpact && <Badge variant="success"><CheckCircle2 className="w-3 h-3" /> No current impact</Badge>}
          </div>
          <KpiRow items={[
            { label: 'Active Disruptions', value: impact!.affectedShipments.length, icon: 'alert', variant: impact!.affectedShipments.length ? 'danger' : 'neutral', hint: 'shipments delayed' },
            { label: 'Orders at Risk', value: impact!.kpis.ordersAffected, icon: 'users', variant: impact!.kpis.ordersAffected ? 'warning' : 'neutral' },
            { label: 'Inventory Risks', value: impact!.inventoryRisks.filter(r => r.stockOutRisk !== 'SAFE').length, icon: 'package', variant: 'warning' },
            { label: 'Revenue at Risk', value: formatINR(impact!.kpis.revenueAtRisk), icon: 'revenue', variant: impact!.kpis.revenueAtRisk > 100000 ? 'danger' : 'warning' },
          ]} />
        </>
      ) : (
        <KpiRow items={[
          { label: 'Active Disruptions', value: 0, icon: 'alert', hint: 'analyze a notice' },
          { label: 'Orders at Risk', value: 0, icon: 'users', hint: 'no analysis yet' },
          { label: 'Inventory Risks', value: 0, icon: 'package', hint: 'no analysis yet' },
          { label: 'Revenue at Risk', value: '₹0', icon: 'revenue', hint: 'no analysis yet' },
        ]} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          {hasAnalysis && !impact!.noImpact && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="section-title">Impact Graph</h3>
                <button className="btn-ghost text-xs" onClick={() => setPage('impact')}>Full map <ArrowRight className="w-3.5 h-3.5" /></button>
              </div>
              <ImpactGraph data={impact!.graph} />
            </div>
          )}
          {hasAnalysis && impact!.noImpact && (
            <div className="card p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-mint-400 mx-auto mb-3" />
              <h3 className="section-title">No current business impact</h3>
              <p className="muted text-sm mt-1">Although the disruption was detected, no active shipment, inventory shortage, or customer order is currently affected.</p>
            </div>
          )}
          {!hasAnalysis && (
            <div className="card p-8 text-center">
              <Activity className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="section-title">No active analysis</h3>
              <p className="muted text-sm mt-1">Run a disruption analysis to see the live impact graph and KPIs here.</p>
              <button className="btn-primary mt-4" onClick={() => setPage('analyzer')}><Search className="w-4 h-4" /> Analyze Disruption</button>
            </div>
          )}

          {hasAnalysis && impact!.affectedOrders.length > 0 && (
            <div className="card p-4">
              <h3 className="section-title mb-3">Top affected orders</h3>
              <div className="space-y-2">
                {impact!.affectedOrders.slice(0, 4).map(o => (
                  <div key={o.order.id} className="flex items-center gap-3 card-soft p-3">
                    <StatusBadge status={o.priority} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">{o.order.id} · {o.customerName}</div>
                      <div className="text-xs muted">{o.productName} · {o.order.quantity} units</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-danger-400">{formatINR(o.revenueImpact)}</div>
                      <div className="text-xs muted">+{o.daysDelayed}d delay</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-[520px]">
          <Copilot impact={impact} />
        </div>
      </div>

      {hasAnalysis && (
        <div className="card p-4">
          <h3 className="section-title mb-3">Decision timeline</h3>
          <ol className="flex flex-wrap gap-2 text-xs">
            {['Disruption', 'Detection', 'Impact Analysis', 'Options', 'Recommendation', 'Human Approval'].map((s, i, arr) => (
              <li key={s} className="flex items-center gap-2">
                <span className={`chip ${i < 4 ? 'bg-mint-500/15 text-mint-400 border border-mint-500/30' : 'bg-ink-700/50 text-slate-400 border border-ink-600'}`}>{s}</span>
                {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600" />}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

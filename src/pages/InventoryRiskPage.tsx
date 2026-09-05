import React, { useState } from 'react';
import type { ImpactAnalysis, InventoryRisk } from '@/data/engine';
import { Badge } from '@/components/Badge';
import { EvidencePanel } from '@/components/EvidencePanel';
import { ImpactGraph } from '@/components/ImpactGraph';
import { formatDate } from '@/data/db';
import { Boxes, AlertTriangle, TrendingDown, Package } from 'lucide-react';
import { Modal } from '@/components/Modal';

export function InventoryRiskPage({ impact }: { impact: ImpactAnalysis | null }) {
  const [sel, setSel] = useState<InventoryRisk | null>(null);

  if (!impact || impact.needsReview) {
    return <div className="card p-10 text-center muted">Run a disruption analysis to view inventory intelligence.</div>;
  }
  if (impact.noImpact) {
    return <div className="card p-10 text-center"><p className="text-mint-400 font-semibold">No inventory risk detected.</p></div>;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SummaryCard icon={Boxes} label="Products monitored" value={String(impact.inventoryRisks.length)} />
        <SummaryCard icon={AlertTriangle} label="Stock-out likely" value={String(impact.inventoryRisks.filter(r => r.stockOutRisk === 'STOCK-OUT LIKELY').length)} danger />
        <SummaryCard icon={TrendingDown} label="At risk" value={String(impact.inventoryRisks.filter(r => r.stockOutRisk === 'AT RISK').length)} warning />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {impact.inventoryRisks.map(r => (
          <div key={r.productId} className="card p-4 hover:border-ink-600 transition cursor-pointer" onClick={() => setSel(r)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-white">{r.productName}</div>
                <div className="text-xs muted mono">{r.productId}</div>
              </div>
              <Badge variant={r.stockOutRisk === 'STOCK-OUT LIKELY' ? 'danger' : r.stockOutRisk === 'AT RISK' ? 'warning' : 'success'}>{r.stockOutRisk}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Metric label="Available" value={r.available} />
              <Metric label="Reserved" value={r.reserved} />
              <Metric label="Daily demand" value={r.dailyDemand} />
              <Metric label="Days remaining" value={r.daysRemaining} danger={r.daysRemaining < 5} />
              <Metric label="Reorder level" value={r.reorderLevel} />
              <Metric label="Incoming" value={r.incomingDelayed ? 'Delayed' : 'On time'} danger={r.incomingDelayed} />
            </div>
            {r.incomingShipmentId && (
              <div className="mt-3 text-xs muted flex items-center justify-between">
                <span>Incoming: <span className="mono text-slate-300">{r.incomingShipmentId}</span></span>
                <span>ETA: {r.incomingEta ? formatDate(r.incomingEta) : '—'}</span>
              </div>
            )}
            <div className="mt-3 text-xs text-slate-400 bg-ink-800/40 rounded-lg p-2.5">
              <b className="text-slate-200">Calculation:</b> Days of Inventory = {r.available} / {r.dailyDemand} = <b className={r.daysRemaining < 5 ? 'text-danger-400' : 'text-mint-400'}>{r.daysRemaining} days</b>. Incoming shipment is {r.incomingDelayed ? 'delayed beyond this window' : 'within the window'}.
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.productName ?? ''} subtitle={sel?.productId} wide>
        {sel && <InventoryDetails risk={sel} />}
      </Modal>
    </div>
  );
}

function InventoryDetails({ risk }: { risk: InventoryRisk }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="kpi-label mb-2">Warehouse breakdown</h4>
        <div className="space-y-2">
          {risk.warehouses.map(w => (
            <div key={w.id} className="card-soft p-3 flex items-center justify-between">
              <div><div className="text-sm text-white">{w.name}</div><div className="text-xs muted mono">{w.id}</div></div>
              <div className="text-right text-sm"><div className="text-white">{w.available} available</div><div className="text-xs muted">{w.reserved} reserved</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="card-soft p-3 text-xs text-slate-300">
        <b>Daily demand:</b> {risk.dailyDemand} units · <b>Days remaining:</b> {risk.daysRemaining} · <b>Reorder level:</b> {risk.reorderLevel}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, danger, warning }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; danger?: boolean; warning?: boolean }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`rounded-lg p-2.5 ${danger ? 'bg-danger-500/15 text-danger-400' : warning ? 'bg-warn-500/15 text-warn-400' : 'bg-brand-500/15 text-brand-300'}`}><Icon className="w-5 h-5" /></div>
      <div><div className="kpi-label">{label}</div><div className="text-xl font-bold text-white">{value}</div></div>
    </div>
  );
}

function Metric({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="card-soft p-2">
      <div className="text-[10px] muted uppercase tracking-wide">{label}</div>
      <div className={`text-sm font-bold mt-0.5 ${danger ? 'text-danger-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}

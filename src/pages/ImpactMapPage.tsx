import React, { useState } from 'react';
import type { ImpactAnalysis } from '@/data/engine';
import { ImpactGraph } from '@/components/ImpactGraph';
import { Badge, SeverityBadge } from '@/components/Badge';
import { byId, formatDate } from '@/data/db';
import { Boxes, Truck, Package, Users } from 'lucide-react';

export function ImpactMapPage({ impact }: { impact: ImpactAnalysis | null }) {
  if (!impact || impact.needsReview) {
    return <div className="card p-10 text-center muted">Run a disruption analysis to view the impact graph.</div>;
  }
  if (impact.noImpact) {
    return <div className="card p-10 text-center"><p className="text-mint-400 font-semibold">No current business impact.</p><p className="muted text-sm mt-1">Nothing to trace in the dependency graph.</p></div>;
  }

  const layers = [
    { icon: Truck, title: 'Suppliers', items: impact.affectedShipments.map(s => byId.supplier(s.supplierId)).filter((v, i, a) => v && a.findIndex(x => x?.id === v?.id) === i) as ReturnType<typeof byId.supplier>[] },
    { icon: Package, title: 'Shipments', items: impact.affectedShipments },
    { icon: Boxes, title: 'Inventory', items: impact.inventoryRisks },
    { icon: Users, title: 'Customers', items: impact.affectedCustomers },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3 flex-wrap">
        <SeverityBadge severity={impact.severity} />
        <Badge variant="primary">{impact.disruptionType}</Badge>
        <span className="muted text-sm">Supplier → Shipment → Warehouse → Product → Order → Customer</span>
      </div>

      <ImpactGraph data={impact.graph} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="section-title mb-3">Shipments</h3>
          <div className="space-y-2">
            {impact.affectedShipments.map(s => {
              const p = byId.product(s.productId); const sup = byId.supplier(s.supplierId);
              return (
                <div key={s.id} className="card-soft p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white mono">{s.id}</span>
                    <Badge variant="danger">{s.status}</Badge>
                  </div>
                  <div className="mt-1.5 text-xs muted grid grid-cols-2 gap-x-3 gap-y-1">
                    <span>Product: {p?.name}</span>
                    <span>Qty: {s.quantity}</span>
                    <span>Supplier: {sup?.name}</span>
                    <span>Carrier: {s.carrier}</span>
                    <span>ETA: {formatDate(s.expectedDate)}</span>
                    <span className="text-danger-400">New ETA: {s.updatedDate ? formatDate(s.updatedDate) : '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="section-title mb-3">Inventory at risk</h3>
          <div className="space-y-2">
            {impact.inventoryRisks.map(r => (
              <div key={r.productId} className="card-soft p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{r.productName}</span>
                  <Badge variant={r.stockOutRisk === 'STOCK-OUT LIKELY' ? 'danger' : r.stockOutRisk === 'AT RISK' ? 'warning' : 'success'}>{r.stockOutRisk}</Badge>
                </div>
                <div className="mt-1.5 text-xs muted grid grid-cols-3 gap-1">
                  <span>Available: <b className="text-slate-200">{r.available}</b></span>
                  <span>Daily demand: <b className="text-slate-200">{r.dailyDemand}</b></span>
                  <span>Days left: <b className={r.daysRemaining < 5 ? 'text-danger-400' : 'text-slate-200'}>{r.daysRemaining}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

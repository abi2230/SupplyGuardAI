import React from 'react';
import type { ImpactAnalysis } from '@/data/engine';
import { EvidencePanel } from '@/components/EvidencePanel';
import { Badge, SeverityBadge } from '@/components/Badge';
import { ScrollText, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function EvidencePage({ impact }: { impact: ImpactAnalysis | null }) {
  if (!impact || impact.needsReview) {
    return <div className="card p-10 text-center muted flex flex-col items-center gap-2"><ScrollText className="w-8 h-8 opacity-50" /> Run a disruption analysis to view evidence.</div>;
  }
  if (impact.noImpact) {
    return <div className="card p-10 text-center"><CheckCircle2 className="w-10 h-10 text-mint-400 mx-auto mb-2" /><p className="text-mint-400 font-semibold">No findings — no business impact detected.</p></div>;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-1"><ShieldAlert className="w-4 h-4 text-brand-400" /><h3 className="section-title">Evidence-first AI</h3></div>
        <p className="text-xs muted">Every finding below cites the exact records the engine used. Tap any finding to expand its evidence trail.</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SeverityBadge severity={impact.severity} />
        <Badge variant="primary">{impact.findings.length} findings</Badge>
        <Badge variant="neutral">{impact.affectedShipments.length + impact.affectedOrders.length + impact.inventoryRisks.length} records traced</Badge>
      </div>

      <EvidencePanel findings={impact.findings} />

      <div className="card p-4">
        <h4 className="kpi-label mb-2">Citation legend</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          {['[Shipment S-xxx]', '[Inventory P-xxx]', '[Order ORD-xxxx]', '[Customer C-xxx]', '[Supplier SUP-xxx]'].map(c => (
            <span key={c} className="chip bg-brand-500/10 text-brand-300 mono border border-brand-500/20">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

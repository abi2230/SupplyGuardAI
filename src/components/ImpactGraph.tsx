import React, { useMemo, useState } from 'react';
import type { ImpactGraph as GraphData } from '@/data/engine';
import { Modal } from './Modal';
import { StatusBadge } from './Badge';
import { byId } from '@/data/db';

const typeStyles: Record<string, { fill: string; stroke: string; text: string; icon: string }> = {
  Supplier:  { fill: '#1a1230', stroke: '#a78bfa', text: '#c4b5fd', icon: 'S' },
  Shipment:  { fill: '#0b2236', stroke: '#38bdf8', text: '#7dd3fc', icon: '➟' },
  Warehouse: { fill: '#0d2818', stroke: '#34d399', text: '#6ee7b7', icon: '□' },
  Product:   { fill: '#2a1a08', stroke: '#fbbf24', text: '#fcd34d', icon: 'P' },
  Order:     { fill: '#2a0814', stroke: '#fb7185', text: '#fda4af', icon: 'O' },
  Customer:  { fill: '#0c1a2e', stroke: '#60a5fa', text: '#93c5fd', icon: 'C' },
};

export function ImpactGraph({ data, onNodeClick }: { data: GraphData; onNodeClick?: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  if (data.nodes.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-slate-400">No impact graph available. Analyze a disruption to build the dependency chain.</div>
      </div>
    );
  }

  // Layered layout by type
  const order = ['Supplier', 'Shipment', 'Warehouse', 'Product', 'Order', 'Customer'];
  const layers: Record<string, typeof data.nodes> = {};
  data.nodes.forEach(n => { (layers[n.type] ??= []).push(n); });

  const W = 880, H = 460;
  const positions: Record<string, { x: number; y: number }> = {};
  order.forEach((type, li) => {
    const nodes = layers[type] ?? [];
    const x = 80 + li * 140;
    nodes.forEach((n, i) => {
      const y = nodes.length === 1 ? H / 2 : 60 + (i * (H - 120)) / (nodes.length - 1);
      positions[n.id] = { x, y };
    });
  });

  const selNode = selected ? data.nodes.find(n => n.id === selected) : null;

  return (
    <div className="relative">
      <div className="card p-4 overflow-x-auto bg-grid">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 680 }}>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill="#3d4f76" />
            </marker>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {data.edges.map((e, i) => {
            const from = positions[e.from], to = positions[e.to];
            if (!from || !to) return null;
            const active = hover === e.from || hover === e.to || selected === e.from || selected === e.to;
            const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
            return (
              <g key={i}>
                <path d={`M ${from.x + 32} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x - 32} ${to.y}`}
                  fill="none" stroke={active ? '#1f7bff' : '#2a3a5e'} strokeWidth={active ? 2.5 : 1.5}
                  markerEnd="url(#arrow)" opacity={active ? 1 : 0.7} />
                {e.label && <text x={mx} y={my - 6} fontSize="9" fill="#64748b" textAnchor="middle">{e.label}</text>}
              </g>
            );
          })}
          {data.nodes.map(n => {
            const p = positions[n.id]; if (!p) return null;
            const s = typeStyles[n.type];
            const isSel = selected === n.id;
            const isHover = hover === n.id;
            return (
              <g key={n.id} transform={`translate(${p.x} ${p.y})`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)}
                onClick={() => { setSelected(n.id); onNodeClick?.(n.id); }}
                filter={isSel ? 'url(#glow)' : undefined}>
                <circle r="30" fill={s.fill} stroke={s.stroke} strokeWidth={isSel || isHover ? 2.5 : 1.5} />
                <text textAnchor="middle" y="-3" fontSize="11" fontWeight="700" fill={s.text}>{n.label.slice(0, 14)}</text>
                {n.sublabel && <text textAnchor="middle" y="10" fontSize="8" fill="#94a3b8">{n.sublabel.slice(0, 18)}</text>}
                {n.status && <text textAnchor="middle" y="22" fontSize="7" fill={s.text} opacity="0.8">{n.status}</text>}
              </g>
            );
          })}
        </svg>
      </div>

      <Modal open={!!selNode} onClose={() => setSelected(null)} title={selNode ? `${selNode.type} · ${selNode.label}` : ''} subtitle={selNode?.sublabel}>
        {selNode && <NodeDetails node={selNode} />}
      </Modal>
    </div>
  );
}

function NodeDetails({ node }: { node: { id: string; type: string; label: string; sublabel?: string; status?: string } }) {
  let details: React.ReactNode = null;
  if (node.type === 'Supplier') { const s = byId.supplier(node.id); if (s) details = <DetailGrid rows={[['ID', s.id], ['Location', s.location], ['Products', s.products.join(', ')], ['Reliability', `${s.reliabilityScore}%`], ['Lead time', `${s.leadTimeDays}d`], ['Tier', `Tier ${s.tier}`]]} />; }
  if (node.type === 'Shipment') { const s = byId.shipment(node.id); if (s) details = <DetailGrid rows={[['ID', s.id], ['Product', s.productId], ['Quantity', String(s.quantity)], ['Origin', s.origin], ['Destination', s.destination], ['Carrier', s.carrier], ['Status', s.status], ['Expected', s.expectedDate], ['Updated ETA', s.updatedDate ?? '—']]} />; }
  if (node.type === 'Warehouse') { const w = byId.warehouse(node.id); if (w) details = <DetailGrid rows={[['ID', w.id], ['Location', w.location], ['Capacity', String(w.capacity)]]} />; }
  if (node.type === 'Product') { const p = byId.product(node.id); if (p) details = <DetailGrid rows={[['ID', p.id], ['Category', p.category], ['Unit price', `₹${p.unitPrice.toLocaleString('en-IN')}`], ['Daily demand', String(p.dailyDemand)], ['Reorder level', String(p.reorderLevel)]]} />; }
  if (node.type === 'Order') { const o = byId.order(node.id); if (o) { const c = byId.customer(o.customerId); details = <DetailGrid rows={[['ID', o.id], ['Customer', c?.name ?? o.customerId], ['Product', o.productId], ['Quantity', String(o.quantity)], ['Required', o.requiredDate], ['Status', o.status], ['Revenue', `₹${o.revenue.toLocaleString('en-IN')}`], ['Priority', o.priority]]} />; } }
  if (node.type === 'Customer') { const c = byId.customer(node.id); if (c) details = <DetailGrid rows={[['ID', c.id], ['Location', c.location], ['Priority', c.priority]]} />; }
  return <div>{node.status && <div className="mb-3"><StatusBadge status={node.status} /></div>}{details}</div>;
}

function DetailGrid({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col">
          <dt className="kpi-label">{k}</dt>
          <dd className="text-slate-100 mono">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

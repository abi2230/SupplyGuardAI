import React, { useMemo, useState } from 'react';
import type { ImpactAnalysis, AffectedOrder } from '@/data/engine';
import { Badge, StatusBadge } from '@/components/Badge';
import { formatINR } from '@/lib/utils';
import { formatDate } from '@/data/db';
import { Search, ArrowUpDown, Inbox } from 'lucide-react';

type SortKey = 'order' | 'customer' | 'quantity' | 'daysDelayed' | 'revenueImpact' | 'priority' | 'newEta';

export function AffectedOrdersPage({ impact }: { impact: ImpactAnalysis | null }) {
  const [q, setQ] = useState('');
  const [priority, setPriority] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'revenueImpact', dir: 'desc' });

  const orders = useMemo(() => {
    if (!impact) return [];
    let list = [...impact.affectedOrders];
    if (q.trim()) {
      const nq = q.toLowerCase();
      list = list.filter(o => o.order.id.toLowerCase().includes(nq) || o.customerName.toLowerCase().includes(nq) || o.productName.toLowerCase().includes(nq));
    }
    if (priority !== 'all') list = list.filter(o => o.priority === priority);
    list.sort((a, b) => {
      let av: string | number = a[sort.key as keyof AffectedOrder] as never;
      let bv: string | number = b[sort.key as keyof AffectedOrder] as never;
      if (sort.key === 'order') { av = a.order.id; bv = b.order.id; }
      if (sort.key === 'customer') { av = a.customerName; bv = b.customerName; }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [impact, q, priority, sort]);

  if (!impact || impact.needsReview) {
    return <div className="card p-10 text-center muted">Run a disruption analysis to see affected orders.</div>;
  }
  if (impact.noImpact) {
    return <div className="card p-10 text-center"><p className="text-mint-400 font-semibold">No orders affected.</p></div>;
  }

  const toggleSort = (key: SortKey) => setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th className="px-3 py-2.5 text-left">
      <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-white transition">
        {label} <ArrowUpDown className="w-3 h-3 opacity-50" />
      </button>
    </th>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input className="input pl-9" placeholder="Search order, customer, product…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'High', 'Medium', 'Low'] as const).map(p => (
            <button key={p} onClick={() => setPriority(p)} className={`chip border transition ${priority === p ? 'bg-brand-500/20 text-brand-300 border-brand-500/40' : 'bg-ink-700/40 text-slate-400 border-ink-600 hover:text-white'}`}>{p}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-800/60 text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <Th k="order" label="Order" />
                <Th k="customer" label="Customer" />
                <th className="px-3 py-2.5 text-left">Product</th>
                <Th k="quantity" label="Qty" />
                <th className="px-3 py-2.5 text-left">Current ETA</th>
                <Th k="newEta" label="New ETA" />
                <Th k="daysDelayed" label="Delay" />
                <Th k="priority" label="Priority" />
                <Th k="revenueImpact" label="Revenue" />
                <th className="px-3 py-2.5 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700/50">
              {orders.map(o => (
                <tr key={o.order.id} className="hover:bg-ink-700/20 transition">
                  <td className="px-3 py-3 mono text-brand-300 font-medium">{o.order.id}</td>
                  <td className="px-3 py-3"><div className="text-white">{o.customerName}</div><div className="text-[10px] muted">{o.customerPriority}</div></td>
                  <td className="px-3 py-3 muted">{o.productName}</td>
                  <td className="px-3 py-3">{o.order.quantity}</td>
                  <td className="px-3 py-3 muted">{formatDate(o.currentEta)}</td>
                  <td className="px-3 py-3 text-warn-400 font-medium">{formatDate(o.newEta)}</td>
                  <td className="px-3 py-3"><Badge variant={o.daysDelayed > 5 ? 'danger' : 'warning'}>+{o.daysDelayed}d</Badge></td>
                  <td className="px-3 py-3"><StatusBadge status={o.priority} /></td>
                  <td className="px-3 py-3 font-semibold text-danger-400">{formatINR(o.revenueImpact)}</td>
                  <td className="px-3 py-3 text-xs muted max-w-[180px]">{o.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="p-10 text-center muted flex flex-col items-center gap-2"><Inbox className="w-8 h-8 opacity-50" /> No orders match your filters.</div>
        )}
      </div>
    </div>
  );
}

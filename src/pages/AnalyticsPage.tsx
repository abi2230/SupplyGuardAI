import React from 'react';
import { computeAnalytics } from '@/data/engine';
import { BarChart, DonutChart, HBarChart, LineChart, ScatterPlot } from '@/components/Charts';
import { formatINR } from '@/lib/utils';
import { Badge } from '@/components/Badge';
import { TrendingUp, BarChart3, Activity, Boxes } from 'lucide-react';

export function AnalyticsPage() {
  const a = computeAnalytics();

  const typeColors = ['#f43f5e', '#f59e0b', '#1f7bff', '#10b981'];
  const donutData = a.disruptionsByType.map((d, i) => ({ label: d.type, value: d.count, color: typeColors[i % typeColors.length] }));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="Disruptions (6mo)" value="21" trend="+18%" />
        <StatCard icon={TrendingUp} label="Avg delay" value="4.2d" trend="-0.6d" />
        <StatCard icon={Boxes} label="Stock-out events" value="7" trend="+2" />
        <StatCard icon={BarChart3} label="Recovery rate" value="86%" trend="+4%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="section-title mb-4">Disruptions by type</h3>
          <DonutChart data={donutData} />
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-4">Orders affected over time</h3>
          <LineChart data={a.ordersAffectedTrend.map(d => ({ label: d.week, value: d.count }))} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="section-title mb-4">Inventory risk by product</h3>
          <HBarChart data={a.inventoryRisk.map(r => ({ label: r.productId, value: r.daysRemaining, color: r.risk === 'High' ? '#f43f5e' : r.risk === 'Medium' ? '#f59e0b' : '#10b981' }))} formatVal={v => `${v}d`} />
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-4">Supplier reliability</h3>
          <HBarChart data={a.supplierReliability.map(s => ({ label: s.supplier, value: s.score }))} formatVal={v => `${v}%`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="section-title mb-4">Revenue at risk by category</h3>
          <BarChart data={a.revenueAtRisk.map(r => ({ label: r.category, value: r.revenue }))} formatVal={formatINR} color="#f43f5e" />
        </div>
        <div className="card p-5">
          <h3 className="section-title mb-4">Response strategy comparison</h3>
          <ScatterPlot data={a.responseComparison.map(r => ({ label: r.option, x: r.cost, y: r.delayDays, color: r.option === 'Reallocate' ? '#10b981' : '#1f7bff' }))} />
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {a.responseComparison.map(r => <span key={r.option} className="chip bg-ink-700/50 text-slate-300 border border-ink-600">{r.option}: {formatINR(r.cost)} · {r.delayDays}d</span>)}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="section-title mb-4">Shipment delays</h3>
        {a.shipmentDelays.length > 0 ? (
          <div className="space-y-2">
            {a.shipmentDelays.map(s => (
              <div key={s.shipmentId} className="flex items-center gap-3">
                <span className="mono text-sm text-brand-300 w-24">{s.shipmentId}</span>
                <div className="flex-1 h-2 rounded-full bg-ink-700/60 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-warn-500 to-danger-500 rounded-full" style={{ width: `${Math.min(s.daysDelayed * 12, 100)}%` }} />
                </div>
                <Badge variant="danger">{s.daysDelayed}d</Badge>
              </div>
            ))}
          </div>
        ) : <p className="muted text-sm">No shipment delays recorded.</p>}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; trend: string }) {
  const up = trend.startsWith('+');
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between"><div className="kpi-label">{label}</div><Icon className="w-4 h-4 text-slate-500" /></div>
      <div className="mt-1.5 text-2xl font-bold text-white">{value}</div>
      <div className={`text-xs mt-0.5 ${up ? 'text-danger-400' : 'text-mint-400'}`}>{trend} vs last period</div>
    </div>
  );
}

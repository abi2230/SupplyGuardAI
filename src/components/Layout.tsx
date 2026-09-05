import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Search, GitBranch, Table, Boxes, Lightbulb, ScrollText, BarChart3, FlaskConical, ShieldCheck, Menu, X, Sparkles,
} from 'lucide-react';

export type PageKey =
  | 'dashboard' | 'analyzer' | 'impact' | 'orders' | 'inventory'
  | 'response' | 'evidence' | 'analytics' | 'scenarios';

const NAV: { key: PageKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'dashboard',  label: 'Dashboard',          icon: LayoutDashboard },
  { key: 'analyzer',   label: 'Disruption Analyzer',icon: Search },
  { key: 'impact',     label: 'Impact Map',         icon: GitBranch },
  { key: 'orders',     label: 'Affected Orders',    icon: Table },
  { key: 'inventory',  label: 'Inventory Risk',     icon: Boxes },
  { key: 'response',   label: 'Response Planner',   icon: Lightbulb },
  { key: 'evidence',   label: 'Evidence Center',    icon: ScrollText },
  { key: 'analytics',  label: 'Analytics',          icon: BarChart3 },
  { key: 'scenarios',  label: 'Scenario Center',    icon: FlaskConical },
];

export function Layout({ page, setPage, children }: { page: PageKey; setPage: (p: PageKey) => void; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const current = NAV.find(n => n.key === page)!;

  return (
    <div className="min-h-screen flex bg-ink-950 text-slate-200">
      {/* Sidebar */}
      <aside className={cn('fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-ink-700/60 bg-ink-900/80 backdrop-blur transition-transform', mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-ink-700/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">SupplyGuard AI</div>
            <div className="text-[10px] muted -mt-0.5">Disruption Response</div>
          </div>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {NAV.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => { setPage(item.key); setMobileOpen(false); }}
                className={cn('nav-item w-full', page === item.key && 'nav-item-active')}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-4 mt-4 border-t border-ink-700/60">
            <div className="px-3 py-2 rounded-lg bg-ink-800/50 border border-ink-700/40">
              <div className="flex items-center gap-1.5 text-[11px] text-mint-400 font-semibold mb-1"><Sparkles className="w-3 h-3" /> AI + Deterministic</div>
              <p className="text-[10px] muted leading-relaxed">Every conclusion is backed by real records. AI reasons; the engine calculates.</p>
            </div>
          </div>
        </nav>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-ink-950/60 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 border-b border-ink-700/60 bg-ink-900/70 backdrop-blur px-4 lg:px-6 flex items-center gap-3">
          <button className="btn-ghost lg:hidden p-2" onClick={() => setMobileOpen(true)}><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <current.icon className="w-4 h-4 text-brand-400" />
            <h1 className="text-base font-semibold text-white">{current.label}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline-flex chip bg-ink-700/50 text-slate-400 border border-ink-600">
              <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse-soft" /> Live demo data
            </span>
            <span className="hidden md:inline text-xs muted">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white">OM</div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

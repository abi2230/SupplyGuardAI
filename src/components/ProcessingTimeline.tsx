import React, { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

const STEPS = [
  'Disruption detected',
  'Entities extracted',
  'Supplier identified',
  'Shipments matched',
  'Inventory checked',
  'Customer orders traced',
  'Business impact calculated',
  'Response options generated',
];

export function ProcessingTimeline({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length) { const t = setTimeout(onComplete, 350); return () => clearTimeout(t); }
    const t = setTimeout(() => setStep(s => s + 1), 320 + Math.random() * 220);
    return () => clearTimeout(t);
  }, [step, onComplete]);

  return (
    <div className="card p-6 max-w-md mx-auto animate-slide-up">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500/15 text-brand-300 mb-3">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-base font-semibold text-white">Analyzing disruption</h3>
        <p className="text-xs muted mt-1">Tracing the supply chain dependency chain</p>
      </div>
      <ol className="space-y-2">
        {STEPS.map((label, i) => {
          const done = i < step, active = i === step;
          return (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition ${done ? 'bg-mint-500 text-white' : active ? 'bg-brand-500/20 text-brand-300 ring-2 ring-brand-500/40' : 'bg-ink-700 text-slate-500'}`}>
                {done ? <Check className="w-3 h-3" /> : active ? <Loader2 className="w-3 h-3 animate-spin" /> : i + 1}
              </span>
              <span className={done ? 'text-slate-200' : active ? 'text-white font-medium' : 'text-slate-500'}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

import React, { useRef, useState } from 'react';
import { Send, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { copilotAnswer, type CopilotMessage, type ImpactAnalysis } from '@/data/engine';

const SUGGESTED = [
  'What orders are most urgent?',
  'Which products will stock out first?',
  'Which warehouse can provide replacement stock?',
  'Why did you recommend reallocation?',
  'What happens if we do not expedite?',
  'Show me the evidence.',
];

export function Copilot({ impact }: { impact: ImpactAnalysis | null }) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    { role: 'assistant', content: 'Hi, I am your supply chain copilot. I answer only from the current analysis data. Ask me about urgent orders, stock-out risk, or the recommendation rationale.' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    setBusy(true);
    const userMsg: CopilotMessage = { role: 'user', content: text };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTimeout(() => {
      const ans = copilotAnswer(text, impact);
      setMessages(m => [...m, ans]);
      setBusy(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, 380);
  };

  return (
    <div className="card flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-700/60">
        <Sparkles className="w-4 h-4 text-brand-400" />
        <span className="text-sm font-semibold text-white">AI Copilot</span>
        <span className="ml-auto chip bg-mint-500/15 text-mint-400 border border-mint-500/30">Data-grounded</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-[200px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-line ${m.role === 'user' ? 'bg-brand-500/20 text-slate-100 border border-brand-500/30' : 'bg-ink-800/70 text-slate-200 border border-ink-700'}`}>
              {m.content}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.citations.map((c, j) => <span key={j} className="chip bg-brand-500/10 text-brand-300 mono text-[10px]">{c}</span>)}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="flex items-center gap-2 text-xs muted"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Querying supply chain data…</div>}
        <div ref={endRef} />
      </div>
      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {SUGGESTED.slice(0, 3).map(s => (
          <button key={s} onClick={() => send(s)} className="chip bg-ink-700/50 text-slate-300 hover:bg-ink-700 hover:text-white border border-ink-600 transition">{s}</button>
        ))}
      </div>
      <div className="px-3 pb-3 flex items-center gap-2 border-t border-ink-700/60 pt-2">
        <MessageSquare className="w-4 h-4 text-slate-500" />
        <input
          className="input flex-1"
          placeholder="Ask about orders, stock-out, warehouses…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
        />
        <button className="btn-primary p-2.5" onClick={() => send(input)} disabled={busy}><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

import React from 'react';

// Lightweight SVG chart primitives — no external deps.

export function BarChart({ data, height = 180, color = '#1f7bff', formatVal }: { data: { label: string; value: number }[]; height?: number; color?: string; formatVal?: (n: number) => string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 group">
          <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition">{formatVal ? formatVal(d.value) : d.value}</div>
          <div
            className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-125"
            style={{ height: `${(d.value / max) * (height - 28)}px`, background: `linear-gradient(180deg, ${color}, ${color}55)` }}
          />
          <div className="text-[10px] muted truncate w-full text-center">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data, height = 180, color = '#1f7bff' }: { data: { label: string; value: number }[]; height?: number; color?: string }) {
  const w = 520, h = height, pad = 28;
  const max = Math.max(...data.map(d => d.value), 1);
  const stepX = (w - pad * 2) / Math.max(data.length - 1, 1);
  const pts = data.map((d, i) => [pad + i * stepX, h - pad - (d.value / max) * (h - pad * 2)]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const area = `${path} L ${pad + (data.length - 1) * stepX} ${h - pad} L ${pad} ${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((f, i) => (
        <line key={i} x1={pad} x2={w - pad} y1={h - pad - f * (h - pad * 2)} y2={h - pad - f * (h - pad * 2)} stroke="#1b2742" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#lineFill)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#0b1120" stroke={color} strokeWidth="2" />)}
      {data.map((d, i) => <text key={i} x={pad + i * stepX} y={h - 8} fontSize="10" fill="#64748b" textAnchor="middle">{d.label}</text>)}
    </svg>
  );
}

export function DonutChart({ data, size = 160 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = size / 2 - 14;
  const cx = size / 2, cy = size / 2;
  let acc = 0;
  const segments = data.map(d => {
    const frac = d.value / total;
    const start = acc * 2 * Math.PI - Math.PI / 2;
    acc += frac;
    const end = acc * 2 * Math.PI - Math.PI / 2;
    const large = frac > 0.5 ? 1 : 0;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
    return { d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, color: d.color, label: d.label, value: d.value, frac };
  });
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size}>
        {segments.map((s, i) => <path key={i} d={s.d} fill="none" stroke={s.color} strokeWidth="14" strokeLinecap="round" />)}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="20" fontWeight="700" fill="#fff">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#64748b">Total</text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-slate-300">{s.label}</span>
            <span className="muted ml-auto">{s.value} · {Math.round(s.frac * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HBarChart({ data, formatVal }: { data: { label: string; value: number; color?: string }[]; formatVal?: (n: number) => string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300">{d.label}</span>
            <span className="muted">{formatVal ? formatVal(d.value) : d.value}</span>
          </div>
          <div className="h-2 rounded-full bg-ink-700/60 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(d.value / max) * 100}%`, background: d.color ?? '#1f7bff' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScatterPlot({ data, height = 200 }: { data: { label: string; x: number; y: number; color?: string }[]; height?: number }) {
  const w = 520, h = height, pad = 34;
  const maxX = Math.max(...data.map(d => d.x), 1);
  const maxY = Math.max(...data.map(d => d.y), 1);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      {[0, 0.5, 1].map((f, i) => (
        <line key={i} x1={pad} x2={w - pad} y1={h - pad - f * (h - pad * 2)} y2={h - pad - f * (h - pad * 2)} stroke="#1b2742" />
      ))}
      {data.map((d, i) => {
        const x = pad + (d.x / maxX) * (w - pad * 2);
        const y = h - pad - (d.y / maxY) * (h - pad * 2);
        return <g key={i}><circle cx={x} cy={y} r="6" fill={d.color ?? '#1f7bff'} opacity="0.85" /><text x={x + 9} y={y + 3} fontSize="9" fill="#94a3b8">{d.label}</text></g>;
      })}
      <text x={pad} y={h - 8} fontSize="10" fill="#64748b">Cost →</text>
      <text x={6} y={pad + 4} fontSize="10" fill="#64748b" transform={`rotate(-90 10 ${pad})`}>Delay →</text>
    </svg>
  );
}

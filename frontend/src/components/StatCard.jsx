import React, { useEffect, useState } from 'react';

function useCountUp(target, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (target === 0) { setV(0); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setV(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return v;
}

export default function StatCard({ label, value, icon, accentColor }) {
  const animated = useCountUp(value);
  return (
    <div className="stat-card" style={{ borderTop: `2px solid ${accentColor}` }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-[0.12em] text-white/30">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-6xl font-black text-white leading-none mt-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {animated}
      </div>
      <div className="h-0.5 rounded-full mt-2" style={{ background: `${accentColor}30` }}>
        <div className="h-full rounded-full w-full" style={{ background: accentColor, opacity: 0.6 }} />
      </div>
    </div>
  );
}

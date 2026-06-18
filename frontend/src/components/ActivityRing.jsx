import React, { useEffect, useState } from 'react';

export default function ActivityRing({ label, pct, color, total, done, unit, size = 160, strokeWidth = 14 }) {
  const [animated, setAnimated] = useState(0);
  const r = (size / 2) - (strokeWidth / 2);
  const circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimated(Math.min(pct, 100));
    }, 200);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Track */}
        <svg width={size} height={size} className="-rotate-90" style={{ position: 'absolute' }}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={`${color}18`}
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)',
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-black text-white leading-none" style={{ fontSize: size * 0.2 }}>
            {Math.round(pct)}%
          </span>
          <span className="font-black uppercase tracking-wider mt-0.5" style={{ color, fontSize: size * 0.085 }}>
            {label}
          </span>
        </div>
      </div>

      {/* Sub label */}
      <div className="text-center">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
          {done} / {total} {unit}
        </p>
      </div>
    </div>
  );
}

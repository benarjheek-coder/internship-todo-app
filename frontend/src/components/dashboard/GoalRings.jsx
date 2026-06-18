import React, { useEffect, useRef } from 'react';

// Animated circular progress ring using SVG
export default function GoalRings({ tasks = [], goals = [] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCompleted = tasks.filter(t => {
    return t.status === 'Completed' && t.completedAt && new Date(t.completedAt) >= today;
  }).length;
  const todayTotal = Math.max(tasks.filter(t => t.status !== 'Completed').length + todayCompleted, 1);

  const weekGoals = goals.filter(g => g.type === 'weekly');
  const monthGoals = goals.filter(g => g.type === 'monthly');

  const weekProgress = weekGoals.length > 0
    ? Math.round((weekGoals.filter(g => g.completed).length / weekGoals.length) * 100)
    : Math.min(Math.round((todayCompleted / Math.max(todayTotal, 5)) * 100 * 3), 100);

  const monthProgress = monthGoals.length > 0
    ? Math.round((monthGoals.filter(g => g.completed).length / monthGoals.length) * 100)
    : Math.min(Math.round((todayCompleted / Math.max(todayTotal, 20)) * 100 * 7), 100);

  const dailyPct = Math.min(Math.round((todayCompleted / todayTotal) * 100), 100);

  const rings = [
    { label: 'Daily Tasks', pct: dailyPct, color: 'var(--accent-green)', sub: `${todayCompleted}/${todayTotal}` },
    { label: 'Weekly Goals', pct: weekProgress, color: 'var(--accent-cyan)', sub: `${weekProgress}%` },
    { label: 'Monthly Goals', pct: monthProgress, color: 'var(--accent-orange)', sub: `${monthProgress}%` },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="font-bold text-sm uppercase tracking-widest mb-6" style={{ color: 'var(--text-secondary)' }}>
        Goal Overview
      </h3>
      <div className="flex items-center justify-around gap-4 flex-wrap">
        {rings.map((ring, i) => (
          <RingItem key={ring.label} {...ring} delay={i * 0.1} />
        ))}
      </div>
    </div>
  );
}

function RingItem({ label, pct, color, sub, delay }) {
  const size = 110;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.strokeDashoffset = circ;
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)';
          ref.current.style.strokeDashoffset = offset;
        }
      }, 100 + delay * 1000);
    }
  }, [pct]);

  return (
    <div className="flex flex-col items-center gap-3 animate-fade-up">
      <div className="relative">
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          {/* Progress */}
          <circle
            ref={ref}
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ}
            filter={`drop-shadow(0 0 6px ${color}80)`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'none' }}>
          <span className="font-black text-xl" style={{ color }}>{pct}%</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-center" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}

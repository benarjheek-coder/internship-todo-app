import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function AnalyticsChart({ tasks }) {
  const completed  = tasks.filter(t => t.status === 'Completed').length;
  const inProgress = tasks.filter(t => t.status === 'In-Progress').length;
  const pending    = tasks.filter(t => t.status === 'Pending').length;

  const data = [
    { name: 'Done',        value: completed,  color: '#CAFF00' },
    { name: 'In Progress', value: inProgress, color: '#FF5500' },
    { name: 'Pending',     value: pending,    color: 'rgba(255,255,255,0.12)' },
  ].filter(d => d.value > 0);

  const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-white/20 text-sm font-bold uppercase tracking-widest">
        <div className="w-24 h-24 rounded-full border-4 border-white/10 flex items-center justify-center mb-3">
          <span className="text-2xl font-black text-white/20">0%</span>
        </div>
        No tasks yet
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: 200 }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <span className="text-5xl font-black" style={{ color: '#CAFF00' }}>{pct}%</span>
        <span className="text-xs font-black uppercase tracking-[0.15em] text-white/30 mt-1">Complete</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={68} outerRadius={88}
            paddingAngle={3} dataKey="value" stroke="none" animationBegin={0} animationDuration={800}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={{ background:'rgba(0,0,0,0.85)', borderRadius:'12px', border:'1px solid rgba(202,255,0,0.2)', color:'#fff', fontSize:12, fontWeight:700 }} itemStyle={{ color: '#CAFF00' }} />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-1">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            <span className="text-xs font-bold text-white/40">{d.name} <span className="text-white/60">{d.value}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

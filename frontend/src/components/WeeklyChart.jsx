import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: '#1e1e1e', border: '1px solid rgba(202,255,0,0.3)', borderRadius: 12, padding: '8px 14px' }}>
      <p className="text-white font-black text-sm">{label}</p>
      <p className="font-bold text-sm" style={{ color: '#CAFF00' }}>{payload[0].value} done</p>
    </div>
  );
  return null;
};

export default function WeeklyChart({ tasks }) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const data = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const count = tasks.filter(t =>
      t.status === 'Completed' && t.updatedAt && isSameDay(new Date(t.updatedAt), day)
    ).length;
    return { day: format(day, 'EEE').toUpperCase(), count, isToday: isSameDay(day, today) };
  });

  const maxVal = Math.max(...data.map(d => d.count), 4);
  const target = Math.max(1, Math.round(maxVal * 0.8));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barSize={32} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
        <XAxis dataKey="day" axisLine={false} tickLine={false}
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 800 }} />
        <YAxis axisLine={false} tickLine={false}
          tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} allowDecimals={false} />
        <ReferenceLine y={target} stroke="rgba(202,255,0,0.3)" strokeDasharray="4 4"
          label={{ value: 'TARGET', position: 'right', fontSize: 9, fill: 'rgba(202,255,0,0.5)', fontWeight: 800 }} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} />
        <Bar dataKey="count" radius={[6, 6, 2, 2]}>
          {data.map((entry, i) => (
            <Cell key={i}
              fill={entry.isToday ? '#CAFF00' : entry.count > 0 ? 'rgba(202,255,0,0.45)' : 'rgba(255,255,255,0.07)'}
              style={entry.isToday ? { filter: 'drop-shadow(0 0 8px rgba(202,255,0,0.6))' } : {}}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BarChart2, TrendingUp, Target, Zap, Brain, Clock } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['var(--accent-green)', 'var(--accent-cyan)', 'var(--accent-orange)', 'var(--accent-purple)', '#f59e0b', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
      <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsDashboard() {
  const { weeklyData, categoryData, analytics } = useApp();
  const { user } = useAuth();

  const insights = [
    analytics?.productivityScore >= 70 ? "🔥 You're in the top performance zone! Keep the momentum." : "📈 Consistency is key — small daily wins compound over time.",
    (weeklyData?.[0]?.completed || 0) < (weeklyData?.[6]?.completed || 0) ? "⚡ Your productivity is accelerating this week!" : "💡 Try tackling high-priority tasks first thing in the morning.",
    user?.streak >= 3 ? `🏆 ${user.streak}-day streak! You're building a powerful habit.` : "🎯 Build a streak by completing at least 1 task daily.",
    analytics?.overdueTasks > 0 ? `⚠️ ${analytics.overdueTasks} overdue tasks need attention.` : "✅ No overdue tasks — excellent time management!",
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {[
          { label: 'Productivity Score', value: `${analytics?.productivityScore ?? 0}`, unit: '/100', icon: TrendingUp, color: 'var(--accent-green)' },
          { label: 'Total Completed', value: analytics?.completedTasks ?? 0, icon: Target, color: 'var(--accent-cyan)' },
          { label: 'XP Earned', value: user?.xp ?? 0, icon: Zap, color: 'var(--accent-purple)' },
          { label: 'Focus Hours', value: analytics?.focusHoursTotal?.toFixed(1) ?? '0.0', unit: 'hrs', icon: Clock, color: 'var(--accent-orange)' },
        ].map(({ label, value, unit, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p className="font-black text-xl leading-none" style={{ color }}>{value}{unit && <span className="text-sm ml-0.5" style={{ color: 'var(--text-muted)' }}>{unit}</span>}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Weekly Tasks */}
        <div className="glass-card p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>📈 Tasks Completed — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData || []} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" name="Completed" fill="var(--accent-green)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Focus Hours */}
        <div className="glass-card p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>⏱️ Focus Hours — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData || []} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="focusHours" name="Focus Hrs" stroke="var(--accent-cyan)" strokeWidth={2.5} dot={{ fill: 'var(--accent-cyan)', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* XP Earned */}
        <div className="glass-card p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>⚡ XP Earned — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData || []} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="xp" name="XP" fill="var(--accent-purple)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="glass-card p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>🎯 Category Performance</h3>
          {categoryData?.length > 0 ? (
            <div className="flex gap-4 items-center">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={categoryData} dataKey="total" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n, p) => [v, p.payload.name]} contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 flex-1">
                {categoryData.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                    <span className="text-xs font-bold" style={{ color: COLORS[i % COLORS.length] }}>{c.total}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-center">
              <div>
                <p className="text-3xl mb-2">📊</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Complete tasks to see category breakdown</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={16} color="var(--accent-cyan)" />
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>AI Productivity Insights</h3>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {insights.map((insight, i) => (
            <div key={i} className="px-4 py-3 rounded-xl text-sm animate-fade-up" style={{
              background: 'rgba(0,212,255,0.05)',
              border: '1px solid rgba(0,212,255,0.12)',
              color: 'var(--text-secondary)',
              animationDelay: `${i * 0.08}s`,
            }}>
              {insight}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

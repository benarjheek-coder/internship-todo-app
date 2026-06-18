import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Flame, CheckCircle, Clock, Zap, Star } from 'lucide-react';

export default function StatsRow() {
  const { user } = useAuth();
  const { completedTodayCount, analytics } = useApp();

  const stats = [
    {
      label: 'Day Streak',
      value: user?.streak || 0,
      icon: Flame,
      color: 'var(--accent-orange)',
      suffix: user?.streak === 1 ? 'day' : 'days',
    },
    {
      label: 'Done Today',
      value: completedTodayCount,
      icon: CheckCircle,
      color: 'var(--accent-green)',
    },
    {
      label: 'Focus Hours',
      value: analytics?.focusHoursTotal?.toFixed(1) ?? '0.0',
      icon: Clock,
      color: 'var(--accent-cyan)',
      suffix: 'hrs',
    },
    {
      label: 'Total XP',
      value: user?.xp || 0,
      icon: Zap,
      color: 'var(--accent-purple)',
    },
    {
      label: 'Completed',
      value: user?.tasksCompletedTotal || 0,
      icon: Star,
      color: '#f59e0b',
      suffix: 'tasks',
    },
  ];

  return (
    <div className="flex gap-3 flex-wrap">
      {stats.map(({ label, value, icon: Icon, color, suffix }, i) => (
        <div
          key={label}
          className="stat-chip animate-fade-up"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <Icon size={18} color={color} />
          <div className="stat-chip-value" style={{ color }}>
            {value}{suffix && <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-secondary)' }}>{suffix}</span>}
          </div>
          <div className="stat-chip-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

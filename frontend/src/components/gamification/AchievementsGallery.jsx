import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ACHIEVEMENTS = [
  { id: 'First Task', icon: '⚡', title: 'First Task', desc: 'Complete your first task', xp: 10, color: 'var(--accent-green)' },
  { id: '7 Day Streak', icon: '🔥', title: '7 Day Streak', desc: 'Stay consistent for 7 days', xp: 50, color: 'var(--accent-orange)' },
  { id: '30 Day Streak', icon: '💎', title: '30 Day Streak', desc: 'Elite 30-day consistency', xp: 200, color: 'var(--accent-cyan)' },
  { id: 'Goal Crusher', icon: '🎯', title: 'Goal Crusher', desc: 'Complete 50 tasks total', xp: 100, color: 'var(--accent-purple)' },
  { id: 'Productivity Master', icon: '🏆', title: 'Productivity Master', desc: 'Earn 500 XP total', xp: 75, color: '#f59e0b' },
  { id: 'Consistency King', icon: '👑', title: 'Consistency King', desc: 'Maintain 14-day streak', xp: 100, color: '#ec4899' },
];

const LEVELS = [
  { name: 'Rookie', xp: '0–99', icon: '🌱', desc: 'Just getting started' },
  { name: 'Explorer', xp: '100–299', icon: '🧭', desc: 'Finding your rhythm' },
  { name: 'Warrior', xp: '300–599', icon: '⚔️', desc: 'Battle-tested' },
  { name: 'Master', xp: '600–899', icon: '🎓', desc: 'Highly skilled' },
  { name: 'Legend', xp: '900+', icon: '👑', desc: 'Peak performer' },
];

export default function AchievementsGallery() {
  const { user } = useAuth();
  const earned = user?.achievements || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Achievement Badges</h3>
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--accent-green)', border: '1px solid rgba(0,255,136,0.2)' }}>
            {earned.length}/{ACHIEVEMENTS.length} Unlocked
          </span>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {ACHIEVEMENTS.map((ach, i) => {
            const unlocked = earned.includes(ach.id);
            return (
              <div
                key={ach.id}
                className="glass-card p-4 flex items-center gap-4 animate-fade-up"
                style={{
                  border: unlocked ? `1px solid ${ach.color}30` : '1px solid var(--glass-border)',
                  background: unlocked ? `${ach.color}08` : 'rgba(255,255,255,0.02)',
                  animationDelay: `${i * 0.06}s`,
                  filter: unlocked ? 'none' : 'grayscale(0.7)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{
                    background: unlocked ? `${ach.color}15` : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${unlocked ? ach.color + '40' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: unlocked ? `0 0 20px ${ach.color}30` : 'none',
                  }}
                >
                  {unlocked ? ach.icon : '🔒'}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>{ach.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{ach.desc}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-xs font-bold" style={{ color: unlocked ? ach.color : 'var(--text-muted)' }}>+{ach.xp} XP</span>
                    {unlocked && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${ach.color}20`, color: ach.color }}>Earned</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level Progression */}
      <div>
        <h3 className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: 'var(--text-secondary)' }}>Level Progression</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {LEVELS.map((lvl, i) => {
            const isCurrent = user?.level === lvl.name;
            const isPast = ['Rookie','Explorer','Warrior','Master','Legend'].indexOf(user?.level) > i;
            return (
              <div
                key={lvl.name}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl flex-1 min-w-[120px] text-center animate-fade-up"
                style={{
                  background: isCurrent ? 'rgba(0,255,136,0.08)' : isPast ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
                  border: isCurrent ? '1px solid rgba(0,255,136,0.25)' : '1px solid rgba(255,255,255,0.06)',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <span className="text-3xl">{lvl.icon}</span>
                <p className="font-black text-sm" style={{ color: isCurrent ? 'var(--accent-green)' : isPast ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{lvl.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{lvl.xp} XP</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{lvl.desc}</p>
                {isCurrent && <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-green)', color: '#000' }}>CURRENT</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

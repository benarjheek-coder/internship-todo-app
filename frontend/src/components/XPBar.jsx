import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

const LEVELS = [
  { name: 'Rookie',    xpNeeded: 100,  color: '#60a5fa' },
  { name: 'Athlete',   xpNeeded: 300,  color: '#CAFF00' },
  { name: 'Pro',       xpNeeded: 600,  color: '#FF5500' },
  { name: 'Elite',     xpNeeded: 1000, color: '#f59e0b' },
  { name: 'Champion',  xpNeeded: 1500, color: '#a855f7' },
  { name: 'Legend',    xpNeeded: 9999, color: '#ec4899' },
];

export function calcXP(tasks) {
  return tasks.reduce((total, t) => {
    if (t.status !== 'Completed') return total;
    let xp = 10;
    if (t.priority === 'High')   xp = 30;
    if (t.priority === 'Medium') xp = 15;
    // Subtask bonus
    const doneSubs = (t.subtasks || []).filter(s => s.done).length;
    xp += doneSubs * 5;
    return total + xp;
  }, 0);
}

export function getLevelInfo(xp) {
  let cumulative = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    const levelXP = LEVELS[i].xpNeeded;
    if (xp < cumulative + levelXP) {
      return {
        level: i + 1,
        name: LEVELS[i].name,
        color: LEVELS[i].color,
        xpInLevel: xp - cumulative,
        xpForNext: levelXP,
        pct: Math.min(100, ((xp - cumulative) / levelXP) * 100),
      };
    }
    cumulative += levelXP;
  }
  return { level: LEVELS.length, name: 'Legend', color: '#ec4899', xpInLevel: 9999, xpForNext: 9999, pct: 100 };
}

export default function XPBar({ tasks }) {
  const xp = calcXP(tasks);
  const info = getLevelInfo(xp);
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDisplayPct(info.pct), 300);
    return () => clearTimeout(t);
  }, [info.pct]);

  return (
    <div className="flex items-center gap-3">
      {/* Level badge */}
      <div
        className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl shrink-0"
        style={{ background: `${info.color}20`, border: `1px solid ${info.color}40` }}
      >
        <Trophy className="w-4 h-4 mb-0.5" style={{ color: info.color }} />
        <span className="text-xs font-black" style={{ color: info.color }}>LV{info.level}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-sm font-black text-white uppercase tracking-wider">{info.name}</span>
          <span className="text-xs font-bold text-white/40">{info.xpInLevel} / {info.xpForNext} XP</span>
        </div>
        {/* XP Bar */}
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${displayPct}%`, background: `linear-gradient(90deg, ${info.color}, white)`, boxShadow: `0 0 10px ${info.color}80` }}
          />
        </div>
        <div className="text-xs text-white/30 font-semibold mt-1">Total XP: {xp}</div>
      </div>
    </div>
  );
}

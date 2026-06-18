import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Timer, Play, Pause, RotateCcw, Coffee, Zap, CheckCircle } from 'lucide-react';

const MODES = [
  { id: 'focus', label: 'Focus', duration: 25, color: '#00e57a' },
  { id: 'short', label: 'Short Break', duration: 5, color: '#00c2ff' },
  { id: 'long', label: 'Long Break', duration: 15, color: '#9d6dff' },
];

export default function PomodoroTimer() {
  const { user } = useAuth();
  const { saveFocusSession, tasks, showNotification } = useApp();
  const [mode, setMode] = useState(MODES[0]);
  const [seconds, setSeconds] = useState(MODES[0].duration * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selectedTask, setSelectedTask] = useState('');
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    setSeconds(mode.duration * 60);
    setRunning(false);
  }, [mode]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(interval);
          setRunning(false);
          handleComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const handleComplete = async () => {
    const data = await saveFocusSession({
      duration: mode.duration,
      type: mode.id === 'focus' ? 'focus' : 'break',
      taskId: selectedTask || undefined,
    });
    if (data?.xpEarned) {
      setXpEarned(prev => prev + data.xpEarned);
    }
    if (mode.id === 'focus') {
      setSessions(s => s + 1);
      showNotification(`🍅 Focus session complete! +${data?.xpEarned || 0} XP`, 'success');
    }
    // Play sound if available
    try { new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play(); } catch {}
  };

  const reset = () => { setSeconds(mode.duration * 60); setRunning(false); };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = ((mode.duration * 60 - seconds) / (mode.duration * 60)) * 100;
  const circ = 2 * Math.PI * 110;
  const offset = circ - (progress / 100) * circ;

  const pendingTasks = tasks.filter(t => t.status !== 'Completed');

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Mode Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: mode.id === m.id ? m.color : 'transparent',
              color: mode.id === m.id ? '#000' : 'var(--text-secondary)',
              boxShadow: mode.id === m.id ? `0 0 20px ${m.color}50` : 'none',
            }}
          >
            {m.id === 'focus' ? '🍅' : m.id === 'short' ? '☕' : '💤'} {m.label}
          </button>
        ))}
      </div>

      {/* Timer Ring */}
      <div className="relative flex items-center justify-center">
        <svg width={260} height={260} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={130} cy={130} r={110} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
          <circle
            cx={130} cy={130} r={110}
            fill="none"
            stroke={mode.color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 12px ${mode.color}80)` }}
          />
        </svg>
        <div className="absolute flex flex-col items-center gap-1">
          <span className="font-black text-6xl tabular-nums" style={{ color: mode.color, textShadow: `0 0 30px ${mode.color}60` }}>
            {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{mode.label}</span>
          {sessions > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full" style={{ background: mode.color }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button onClick={reset} className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={() => setRunning(r => !r)}
          className="w-20 h-20 rounded-3xl flex items-center justify-center transition-all"
          style={{
            background: `linear-gradient(135deg, ${mode.color}, ${mode.color}bb)`,
            boxShadow: `0 0 30px ${mode.color}60, 0 8px 24px rgba(0,0,0,0.5)`,
            color: '#000',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {running ? <Pause size={30} strokeWidth={3} /> : <Play size={30} strokeWidth={3} />}
        </button>

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-col"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}
        >
          <Zap size={14} color="var(--accent-purple)" />
          <span className="text-[10px] font-bold" style={{ color: 'var(--accent-purple)' }}>+{xpEarned}</span>
        </div>
      </div>

      {/* Task Link */}
      <div className="w-full max-w-sm">
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>Focus on task (optional)</label>
        <select value={selectedTask} onChange={e => setSelectedTask(e.target.value)} className="input text-sm" style={{ background: 'var(--glass-2)', color: 'var(--text-0)', border: '1px solid var(--glass-border)' }}>
          <option value="" style={{ background: '#0d0d1f', color: 'var(--text-0)' }}>— Free focus session —</option>
          {pendingTasks.map(t => <option key={t._id} value={t._id} style={{ background: '#0d0d1f', color: 'var(--text-0)' }}>{t.title}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-center">
        <div>
          <p className="text-2xl font-black" style={{ color: mode.color }}>{sessions}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sessions Today</p>
        </div>
        <div>
          <p className="text-2xl font-black" style={{ color: 'var(--accent-purple)' }}>{xpEarned}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>XP Earned</p>
        </div>
        <div>
          <p className="text-2xl font-black" style={{ color: 'var(--accent-cyan)' }}>{Math.floor(sessions * mode.duration / 60)}h {(sessions * mode.duration) % 60}m</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Focus Time</p>
        </div>
      </div>
    </div>
  );
}

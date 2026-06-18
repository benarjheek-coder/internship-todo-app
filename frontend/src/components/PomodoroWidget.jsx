import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Zap } from 'lucide-react';

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

export default function PomodoroWidget({ task, onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(WORK_SEC);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pomosCompleted, setPomosCompleted] = useState(0);
  const intervalRef = useRef(null);
  // Dragging
  const [pos, setPos] = useState({ x: window.innerWidth - 360, y: 80 });
  const dragRef = useRef(null);

  const total = isBreak ? BREAK_SEC : WORK_SEC;
  const pct = ((total - secondsLeft) / total) * 100;
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const circumference = 2 * Math.PI * 54;
  const strokeDash = circumference - (pct / 100) * circumference;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            // Play completion tone
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain); gain.connect(ctx.destination);
              osc.frequency.value = 880;
              osc.type = 'sine';
              gain.gain.setValueAtTime(0.4, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
              osc.start(); osc.stop(ctx.currentTime + 1);
            } catch(e) {}
            if (!isBreak) setPomosCompleted(p => p + 1);
            setIsBreak(b => !b);
            setSecondsLeft(!isBreak ? BREAK_SEC : WORK_SEC);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, isBreak]);

  const reset = () => {
    setRunning(false);
    setIsBreak(false);
    setSecondsLeft(WORK_SEC);
  };

  // Drag logic
  const onMouseDown = (e) => {
    if (e.target.closest('button')) return;
    dragRef.current = { startX: e.clientX - pos.x, startY: e.clientY - pos.y };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    setPos({ x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY });
  };
  const onMouseUp = () => {
    dragRef.current = null;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      className="fixed z-[999] select-none animate-bounce-in"
      style={{ left: pos.x, top: pos.y, cursor: 'grab' }}
      onMouseDown={onMouseDown}
    >
      <div className="glass-panel p-6 w-72 border border-[#CAFF00]/20 shadow-[0_0_40px_rgba(202,255,0,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#CAFF00]" />
              <span className="text-xs font-black uppercase tracking-widest text-[#CAFF00]">
                {isBreak ? 'Break Time' : 'Focus Mode'}
              </span>
            </div>
            <p className="text-white/50 text-xs mt-0.5 truncate max-w-[180px]">{task.title}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ring */}
        <div className="flex justify-center my-4">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={isBreak ? '#FF5500' : '#CAFF00'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white tabular-nums">{mins}:{secs}</span>
              <span className="text-xs text-white/40 font-semibold mt-0.5">
                {isBreak ? 'rest' : 'focus'}
              </span>
            </div>
          </div>
        </div>

        {/* Pomodoro dots */}
        <div className="flex justify-center gap-1.5 mb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{
              background: i < pomosCompleted % 4 ? '#CAFF00' : 'rgba(255,255,255,0.12)'
            }} />
          ))}
          <span className="text-xs text-white/30 font-bold ml-1">×{Math.floor(pomosCompleted / 4) + 1}</span>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setRunning(r => !r)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all"
            style={{ background: running ? 'rgba(255,85,0,0.2)' : '#CAFF00', color: running ? '#FF5500' : '#000', border: running ? '1px solid rgba(255,85,0,0.4)' : 'none' }}
          >
            {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
          </button>
          <button onClick={reset} className="p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/10">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

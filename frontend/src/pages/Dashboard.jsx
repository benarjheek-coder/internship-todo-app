import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import TaskBoard from '../components/tasks/TaskBoard';
import TaskModal from '../components/tasks/TaskModal';
import AIAssistant from '../components/ai/AIAssistant';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import PomodoroTimer from '../components/focus/PomodoroTimer';
import CalendarPlanner from '../components/calendar/CalendarPlanner';
import AchievementsGallery from '../components/gamification/AchievementsGallery';
import GoalsView from '../components/goals/GoalsView';
import ChatBot from '../components/ChatBot';

// ── Toast ─────────────────────────────────────────────────────────────────
function Toast({ notification }) {
  if (!notification) return null;
  const colors = {
    success: { bg: 'rgba(0,229,122,0.12)', border: 'rgba(0,229,122,0.25)', color: 'var(--green)' },
    error:   { bg: 'rgba(255,77,77,0.12)',  border: 'rgba(255,77,77,0.3)',   color: '#ff6b6b' },
    ai:      { bg: 'rgba(157,109,255,0.12)',border: 'rgba(157,109,255,0.3)', color: 'var(--purple)' },
    achievement: { bg: 'rgba(255,204,0,0.12)', border: 'rgba(255,204,0,0.3)', color: 'var(--yellow)' },
  };
  const c = colors[notification.type] || colors.success;
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9000,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.color, borderRadius: 12, padding: '13px 20px',
      fontSize: 13, fontWeight: 600,
      backdropFilter: 'blur(20px)',
      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      animation: 'fadeInUp 0.3s ease',
      maxWidth: 340,
    }}>
      {notification.msg}
    </div>
  );
}

// ── XP Float popup ────────────────────────────────────────────────────────
function XPPopup({ amount }) {
  return (
    <div style={{
      position: 'fixed', bottom: 80, right: 28, zIndex: 9001,
      background: 'linear-gradient(135deg, var(--purple-dim), rgba(157,109,255,0.08))',
      border: '1px solid rgba(157,109,255,0.3)',
      borderRadius: 12, padding: '10px 18px',
      color: 'var(--purple)', fontSize: 16, fontWeight: 900,
      animation: 'float-up 2s ease forwards',
      backdropFilter: 'blur(20px)',
    }}>
      +{amount} XP ⚡
    </div>
  );
}

// ── Level definitions ─────────────────────────────────────────────────────
const LEVEL_META = {
  Rookie:   { color: '#6b7280', icon: '🌱', label: 'Rookie'   },
  Explorer: { color: 'var(--cyan)',   icon: '🧭', label: 'Explorer' },
  Warrior:  { color: 'var(--orange)', icon: '⚔️', label: 'Warrior'  },
  Master:   { color: 'var(--purple)', icon: '🔮', label: 'Master'   },
  Legend:   { color: 'var(--green)',  icon: '👑', label: 'Legend'   },
};

// ── Circular progress ring ────────────────────────────────────────────────
function Ring({ pct, color, size = 100, stroke = 8, label, value, sub }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * Math.min(pct / 100, 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={`${filled} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s var(--ease)', filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 18, fontWeight: 900, color }}>{pct}%</span>
          {sub && <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{sub}</span>}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
        {value && <p style={{ fontSize: 12, color, fontWeight: 800, marginTop: 2 }}>{value}</p>}
      </div>
    </div>
  );
}

// ── Mini stat card ────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, trend, delay }) {
  return (
    <div className={`stat-card anim-fade-up ${delay}`} style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: `${color}18`,
          border: `1px solid ${color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>
          {icon}
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
            background: trend > 0 ? 'rgba(0,229,122,0.12)' : 'rgba(255,77,77,0.1)',
            color: trend > 0 ? 'var(--green)' : '#ff6b6b',
            border: `1px solid ${trend > 0 ? 'rgba(0,229,122,0.2)' : 'rgba(255,77,77,0.2)'}`,
          }}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 4, color }}>{value}</p>
      <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{label}</p>
    </div>
  );
}

// ── Dashboard Home view ───────────────────────────────────────────────────
function HomeView({ user, tasks }) {
  const { setActiveView } = useApp();
  const { completedTodayCount, xpProgress, currentXP, currentLevel } = useApp();
  const lm = LEVEL_META[currentLevel] || LEVEL_META.Rookie;

  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  const pending   = tasks.filter(t => t.status === 'Pending').length;
  const inProg    = tasks.filter(t => t.status === 'In-Progress').length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const total     = tasks.length;
  const dailyPct  = total > 0 ? Math.round((completedTodayCount / Math.max(total, 1)) * 100) : 0;
  const weeklyPct = total > 0 ? Math.round(((completed) / Math.max(total, 1)) * 100) : 0;

  // Recent pending tasks
  const urgent = tasks.filter(t => t.status !== 'Completed' && (t.priority === 'Critical' || t.priority === 'High')).slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Welcome banner */}
      <div className="anim-fade-up" style={{
        background: 'linear-gradient(135deg, rgba(0,229,122,0.07) 0%, rgba(0,194,255,0.04) 100%)',
        border: '1px solid rgba(0,229,122,0.12)',
        borderRadius: 20, padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,122,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500, marginBottom: 4 }}>
            {greeting} ✨
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 8 }}>
            {firstName}<span style={{ color: lm.color }}> {lm.icon}</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: `${lm.color}18`, border: `1px solid ${lm.color}28`, color: lm.color,
            }}>
              {lm.label}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
              {pending} tasks waiting · {inProg} in progress
            </span>
          </div>
        </div>

        {/* XP Progress */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
          flexShrink: 0, marginLeft: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: lm.color }}>{currentXP}</span>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>XP</span>
          </div>
          <div style={{ width: 160, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${xpProgress}%`, borderRadius: 4,
              background: `linear-gradient(90deg, ${lm.color}, ${lm.color}bb)`,
              transition: 'width 0.8s var(--ease)',
              boxShadow: `0 0 8px ${lm.color}60`,
            }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{xpProgress}% to next level</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16 }}>
        <StatCard icon="✅" label="Completed today" value={completedTodayCount} color="var(--green)"  trend={completedTodayCount > 0 ? 12 : undefined} delay="d1" />
        <StatCard icon="🔥" label="Day streak"      value={`${user?.streak || 0}d`} color="var(--orange)" delay="d2" />
        <StatCard icon="⚡" label="Total XP earned" value={currentXP}              color="var(--purple)" delay="d3" />
        <StatCard icon="📋" label="Total tasks"     value={total}                  color="var(--cyan)"   delay="d4" />
      </div>

      {/* Goal rings + Urgent tasks */}
      <div style={{ display: 'flex', gap: 20 }}>
        {/* Rings card */}
        <div className="card anim-fade-up d2" style={{ flex: '0 0 auto', padding: '24px 28px' }}>
          <h3 className="t-h3" style={{ marginBottom: 24, color: 'var(--text-1)' }}>Progress Overview</h3>
          <div style={{ display: 'flex', gap: 28 }}>
            <Ring pct={dailyPct}  color="var(--green)"  size={108} stroke={9} label="Daily"  sub={`${completedTodayCount}/${total}`} />
            <Ring pct={weeklyPct} color="var(--cyan)"   size={108} stroke={9} label="Total"  sub={`${completed}/${total}`} />
            <Ring pct={Math.min(xpProgress,100)} color="var(--purple)" size={108} stroke={9} label="Level XP" sub={`${xpProgress}%`} />
          </div>
        </div>

        {/* Urgent tasks */}
        <div className="card anim-fade-up d3" style={{ flex: 1, padding: '24px 24px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 className="t-h3" style={{ color: 'var(--text-1)' }}>Priority Queue</h3>
            <button
              onClick={() => setActiveView('tasks')}
              style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View all →
            </button>
          </div>
          {urgent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-3)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <p style={{ fontSize: 13 }}>No urgent tasks! Great work.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {urgent.map((t, i) => (
                <div key={t._id} className={`anim-fade-up d${i+1}`} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--glass-1)', border: '1px solid var(--glass-border)',
                  transition: 'background 0.15s',
                  cursor: 'default',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: t.priority === 'Critical' ? '#ff4d4d' : 'var(--orange)',
                    boxShadow: `0 0 6px ${t.priority === 'Critical' ? '#ff4d4d' : 'var(--orange)'}80`,
                  }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, minWidth: 0 }}
                        className="truncate">
                    {t.title}
                  </span>
                  <span className={`badge ${t.priority === 'Critical' ? 'p-critical' : 'p-high'}`} style={{ fontSize: 9 }}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="anim-fade-up d4" style={{ display: 'flex', gap: 12 }}>
        {[
          { label: '+ New Task',     action: () => setActiveView('tasks'),        color: 'var(--green)',  bg: 'rgba(0,229,122,0.08)',  border: 'rgba(0,229,122,0.18)', icon: '📝' },
          { label: '🤖 Ask BENNY AI', action: () => setActiveView('ai'),          color: 'var(--purple)', bg: 'rgba(157,109,255,0.08)', border: 'rgba(157,109,255,0.18)', icon: '' },
          { label: '⏱ Start Focus',  action: () => setActiveView('focus'),        color: 'var(--cyan)',   bg: 'rgba(0,194,255,0.08)',   border: 'rgba(0,194,255,0.18)',  icon: '' },
          { label: '📊 Analytics',   action: () => setActiveView('analytics'),    color: 'var(--orange)', bg: 'rgba(255,107,43,0.08)',  border: 'rgba(255,107,43,0.18)', icon: '' },
        ].map(({ label, action, color, bg, border }) => (
          <button
            key={label}
            onClick={action}
            style={{
              flex: 1, padding: '14px 12px', borderRadius: 14,
              background: bg, border: `1px solid ${border}`,
              color, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.18s var(--ease)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}20`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────
function Section({ title, subtitle, children, action }) {
  return (
    <div>
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            {title && <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 2 }}>{title}</h1>}
            {subtitle && <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { activeView, tasks, notification, xpAnimation } = useApp();
  const [newTaskModal, setNewTaskModal] = useState(false);

  const VIEW_META = {
    home:         { title: null },
    tasks:        { title: 'Task Board', subtitle: 'Manage and track all your tasks' },
    ai:           { title: 'BENNY AI', subtitle: 'Your general-purpose AI — ask anything' },
    analytics:    { title: 'Analytics', subtitle: 'Deep dive into your productivity data' },
    focus:        { title: 'Focus Mode', subtitle: 'Pomodoro timer with XP rewards' },
    calendar:     { title: 'Calendar', subtitle: 'Plan your schedule' },
    achievements: { title: 'Achievements', subtitle: 'Your milestones and progression' },
    goals:        { title: 'Goals', subtitle: 'Track daily, weekly, and monthly objectives' },
  };
  const meta = VIEW_META[activeView] || {};

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', zIndex: 1 }}>
      <Sidebar />

      <div style={{
        marginLeft: 'var(--sidebar-w)',
        paddingTop: 'var(--topbar-h)',
        minHeight: '100vh', flex: 1,
        display: 'flex', flexDirection: 'column', minWidth: 0,
        transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <TopBar />

        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          <Section
            title={meta.title}
            subtitle={meta.subtitle}
            action={activeView === 'tasks' ? (
              <button className="btn btn-primary" onClick={() => setNewTaskModal(true)} style={{ gap: 6 }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Task
              </button>
            ) : null}
          >
            {activeView === 'home' && <HomeView user={user} tasks={tasks} />}
            {activeView === 'tasks' && <TaskBoard onNewTask={() => setNewTaskModal(true)} />}
            {activeView === 'ai' && <AIAssistant />}
            {activeView === 'analytics' && <AnalyticsDashboard />}
            {activeView === 'focus' && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16 }}>
                <PomodoroTimer />
              </div>
            )}
            {activeView === 'calendar' && <CalendarPlanner />}
            {activeView === 'achievements' && <AchievementsGallery />}
            {activeView === 'goals' && <GoalsView />}
          </Section>
        </main>
      </div>

      {newTaskModal && <TaskModal onClose={() => setNewTaskModal(false)} />}
      <ChatBot />
      <Toast notification={notification} />
      {xpAnimation && <XPPopup amount={xpAnimation} />}
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Bell, Search, Menu } from 'lucide-react';

const VIEW_LABELS = {
  home: 'Dashboard', tasks: 'Tasks', ai: 'AI Assistant',
  analytics: 'Analytics', focus: 'Focus Mode', calendar: 'Calendar',
  achievements: 'Achievements', goals: 'Goals',
};

const LEVEL_COLORS = {
  Rookie: '#6b7280', Explorer: 'var(--cyan)', Warrior: 'var(--orange)',
  Master: 'var(--purple)', Legend: 'var(--green)',
};

export default function TopBar() {
  const { user } = useAuth();
  const { activeView, xpProgress, currentLevel, currentXP, mobileSidebarOpen, setMobileSidebarOpen } = useApp();
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const levelColor = LEVEL_COLORS[currentLevel] || 'var(--green)';
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 'var(--sidebar-w)', right: 0,
      height: 'var(--topbar-h)', zIndex: 99,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', gap: 16,
      background: 'rgba(8,8,15,0.88)',
      borderBottom: '1px solid var(--glass-border)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* Breadcrumb / Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            style={{
              padding: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--glass-1)', border: '1px solid var(--glass-border)',
              borderRadius: 8, color: 'var(--text-1)', cursor: 'pointer',
              outline: 'none', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--glass-1)'}
          >
            <Menu size={16} />
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>BENNY</span>
          <span style={{ color: 'var(--text-3)', fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
            {VIEW_LABELS[activeView] || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
        <Search size={13} style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-3)', pointerEvents: 'none',
        }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tasks, goals…"
          style={{
            width: '100%',
            background: 'var(--glass-1)',
            border: '1px solid var(--glass-border)',
            borderRadius: 10, padding: '7px 14px 7px 34px',
            color: 'var(--text-0)', fontSize: 13,
            fontFamily: 'Inter, sans-serif', outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--green)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,229,122,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Bell */}
        <button className="btn-icon btn" title="Notifications" style={{ padding: 7 }}>
          <Bell size={15} />
        </button>

        {/* XP pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 10,
          background: 'var(--glass-1)', border: '1px solid var(--glass-border)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: levelColor }}>
            {currentLevel}
          </span>
          <div style={{ width: 50, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${Math.max(0, Math.min(xpProgress, 100))}%`,
              background: levelColor, borderRadius: 3,
              transition: 'width 0.7s var(--ease)',
              boxShadow: `0 0 6px ${levelColor}80`,
            }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
            {currentXP} XP
          </span>
        </div>

        {/* Avatar */}
        <div title={user?.name} style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 12, letterSpacing: '0.02em',
          background: `${levelColor}18`,
          border: `1.5px solid ${levelColor}35`,
          color: levelColor,
          transition: 'all 0.18s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, CheckSquare, Sparkles, BarChart2,
  Timer, CalendarDays, Trophy, Target, LogOut, Zap
} from 'lucide-react';

const NAV = [
  { id: 'home',         icon: LayoutDashboard, label: 'Dashboard',    section: 'MAIN' },
  { id: 'tasks',        icon: CheckSquare,     label: 'Tasks',         section: 'MAIN' },
  { id: 'ai',          icon: Sparkles,        label: 'AI Assistant',  section: 'MAIN' },
  { id: 'analytics',   icon: BarChart2,       label: 'Analytics',     section: 'TOOLS' },
  { id: 'focus',       icon: Timer,           label: 'Focus Mode',    section: 'TOOLS' },
  { id: 'calendar',    icon: CalendarDays,    label: 'Calendar',      section: 'TOOLS' },
  { id: 'goals',       icon: Target,          label: 'Goals',         section: 'TOOLS' },
  { id: 'achievements',icon: Trophy,          label: 'Achievements',  section: 'TOOLS' },
];

const SECTIONS = ['MAIN', 'TOOLS'];

const W_COLLAPSED = 64;
const W_EXPANDED  = 224;

export default function Sidebar() {
  const { activeView, setActiveView, mobileSidebarOpen, setMobileSidebarOpen } = useApp();
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        document.documentElement.style.setProperty(
          '--sidebar-w',
          `${expanded ? W_EXPANDED : W_COLLAPSED}px`
        );
      } else {
        document.documentElement.style.setProperty('--sidebar-w', '0px');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [expanded]);

  React.useEffect(() => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [activeView, isMobile]);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const showLabels = expanded || isMobile;

  return (
    <>
      {isMobile && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}
      <div
        onMouseEnter={() => !isMobile && setExpanded(true)}
        onMouseLeave={() => !isMobile && setExpanded(false)}
        style={{
          position: 'fixed',
          left: isMobile ? (mobileSidebarOpen ? 0 : -W_EXPANDED) : 0,
          top: 0, bottom: 0,
          width: isMobile ? W_EXPANDED : (expanded ? W_EXPANDED : W_COLLAPSED),
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), left 0.22s cubic-bezier(0.4,0,0.2,1)',
          background: '#0e0e1c',
          borderRight: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          zIndex: 1000, display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Logo area */}
        <div style={{
          height: 'var(--topbar-h)', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px',
          borderBottom: '1px solid var(--glass-border)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--green), rgba(0,194,255,0.7))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px rgba(0,229,122,0.35)',
          }}>
            <Zap size={17} color="#000" strokeWidth={3} />
          </div>
          <div style={{ opacity: showLabels ? 1 : 0, transition: 'opacity 0.15s ease', minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-0)', whiteSpace: 'nowrap' }}>
              BENNY
            </p>
            <p style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Productivity OS
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SECTIONS.map(section => {
            const items = NAV.filter(n => n.section === section);
            return (
              <div key={section}>
                {/* Section label */}
                {showLabels && (
                  <p style={{
                    fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '8px 10px 4px', whiteSpace: 'nowrap',
                    opacity: showLabels ? 1 : 0, transition: 'opacity 0.1s ease',
                  }}>
                    {section}
                  </p>
                )}
                {!showLabels && section !== 'MAIN' && (
                  <div style={{ height: 1, background: 'var(--glass-border)', margin: '8px 10px' }} />
                )}
                {items.map(({ id, icon: Icon, label }) => {
                  const active = activeView === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveView(id)}
                      data-tip={(!expanded && !isMobile) ? label : undefined}
                      className={`sidebar-item${active ? ' active' : ''}`}
                      style={{ minWidth: 0 }}
                    >
                      <Icon size={17} strokeWidth={active ? 2.5 : 1.8} style={{ flexShrink: 0 }} />
                      <span style={{
                        opacity: showLabels ? 1 : 0,
                        transition: 'opacity 0.12s ease',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                      }}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom user + logout */}
        <div style={{ padding: '8px 8px 12px', flexShrink: 0, borderTop: '1px solid var(--glass-border)' }}>
          {/* User chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 10, marginBottom: 4,
            overflow: 'hidden',
            background: 'var(--glass-1)', border: '1px solid var(--glass-border)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: 'rgba(0,229,122,0.15)',
              border: '1px solid rgba(0,229,122,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--green)', fontSize: 11, fontWeight: 900,
            }}>
              {initials}
            </div>
            <div style={{ opacity: showLabels ? 1 : 0, transition: 'opacity 0.12s ease', minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-0)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                {user?.level || 'Rookie'}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="sidebar-item"
            style={{ color: 'rgba(255,107,43,0.5)', width: '100%' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--orange)'; e.currentTarget.style.background = 'rgba(255,107,43,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,107,43,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,107,43,0.5)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <LogOut size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            <span style={{ opacity: showLabels ? 1 : 0, transition: 'opacity 0.12s ease', whiteSpace: 'nowrap' }}>
              Sign out
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

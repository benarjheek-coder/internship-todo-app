import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2, User } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    const res = await register(form.name, form.email, form.password);
    setLoading(false);
    if (res.success) navigate('/');
    else setError(res.message);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-0)', padding: 20, position: 'relative',
    }}>
      {/* Ambient blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(157,109,255,0.08) 0%, transparent 70%)',
          top: -100, right: -80,
        }} />
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,194,255,0.05) 0%, transparent 70%)',
          bottom: -150, left: -100,
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--green), rgba(0,194,255,0.8))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(0,229,122,0.35), 0 8px 24px rgba(0,0,0,0.4)',
            marginBottom: 18,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#000" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Start your productivity journey with BENNY</p>
        </div>

        {/* Benefit pills */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
          {['🎯 Goal tracking', '🤖 AI assistant', '⚡ XP & levels'].map(b => (
            <span key={b} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: 'var(--glass-1)', border: '1px solid var(--glass-border)',
              color: 'var(--text-2)',
            }}>{b}</span>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--glass-1)',
          border: '1px solid var(--glass-border)',
          borderRadius: 20, padding: 32,
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          animation: 'fadeInScale 0.35s var(--ease-spring) both',
        }}>
          {error && (
            <div style={{
              background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.25)',
              borderRadius: 10, padding: '11px 15px',
              color: '#ff6b6b', fontSize: 13, fontWeight: 500, marginBottom: 20,
            }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Full Name</label>
              <input
                type="text" required autoFocus
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Alex Johnson"
                className="input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="input"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button" onClick={() => setShow(!show)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-2)', display: 'flex', alignItems: 'center',
                  }}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: form.password.length >= i * 2
                        ? i <= 2 ? 'var(--orange)' : i === 3 ? 'var(--cyan)' : 'var(--green)'
                        : 'var(--glass-border)',
                      transition: 'background 0.3s ease',
                    }} />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit" disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 15, fontWeight: 700, marginTop: 4, borderRadius: 12 }}
            >
              {loading
                ? <Loader2 size={18} className="anim-spin" />
                : <><span>Create Account</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>already have one?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>
            <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in instead →
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', marginTop: 24 }}>
          Free forever · No credit card required
        </p>
      </div>
    </div>
  );
}

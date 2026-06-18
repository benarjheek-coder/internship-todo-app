import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Target, Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

const TYPE_COLORS = { daily: 'var(--accent-green)', weekly: 'var(--accent-cyan)', monthly: 'var(--accent-orange)' };

export default function GoalsView() {
  const { goals, createGoal, updateGoal } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'daily', targetCount: 5 });

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    await createGoal(form);
    setForm({ title: '', type: 'daily', targetCount: 5 });
    setShowForm(false);
  };

  const grouped = { daily: [], weekly: [], monthly: [] };
  goals.forEach(g => { if (grouped[g.type]) grouped[g.type].push(g); });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={20} color="var(--accent-cyan)" />
          <h2 className="font-black text-xl">Goals</h2>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-neon flex items-center gap-2 text-xs py-2">
          <Plus size={14} /> New Goal
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-5 animate-fade-up flex flex-col gap-3" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
          <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Goal title…" className="input" />
          <div className="flex gap-3">
            <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="input text-sm flex-1" style={{ background: 'var(--glass-2)', color: 'var(--text-0)', border: '1px solid var(--glass-border)' }}>
              <option value="daily" style={{ background: '#0d0d1f', color: 'var(--text-0)' }}>Daily</option>
              <option value="weekly" style={{ background: '#0d0d1f', color: 'var(--text-0)' }}>Weekly</option>
              <option value="monthly" style={{ background: '#0d0d1f', color: 'var(--text-0)' }}>Monthly</option>
            </select>
            <input type="number" min={1} value={form.targetCount} onChange={e => setForm(f => ({...f, targetCount: +e.target.value}))} placeholder="Target" className="input text-sm" style={{ width: 100 }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="btn-ghost flex-1 text-sm">Cancel</button>
            <button onClick={handleCreate} className="btn-neon flex-1 text-sm">Create Goal</button>
          </div>
        </div>
      )}

      {['daily','weekly','monthly'].map(type => {
        const typeGoals = grouped[type];
        const color = TYPE_COLORS[type];
        return (
          <div key={type}>
            <h3 className="font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              {type} Goals ({typeGoals.length})
            </h3>
            {typeGoals.length === 0 ? (
              <div className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>No {type} goals yet</div>
            ) : (
              <div className="flex flex-col gap-3">
                {typeGoals.map((g, i) => {
                  const pct = Math.min(Math.round((g.currentCount / g.targetCount) * 100), 100);
                  return (
                    <div key={g._id} className="glass-card p-4 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm" style={{ textDecoration: g.completed ? 'line-through' : 'none', color: g.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          {g.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold" style={{ color }}>{g.currentCount}/{g.targetCount}</span>
                        </div>
                      </div>
                      <div className="rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,0.06)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease', boxShadow: `0 0 8px ${color}60` }} />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pct}% complete</span>
                        {g.completed && <span className="text-xs font-bold" style={{ color }}>✓ Completed</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

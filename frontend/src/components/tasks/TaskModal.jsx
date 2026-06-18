import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Clock, Zap, Tag, AlignLeft } from 'lucide-react';

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const CATEGORIES = ['General', 'Development', 'Learning', 'Health', 'Work', 'Personal', 'Finance', 'Creative'];

const PRIORITY_COLORS = {
  Critical: { color: '#ff3333', bg: 'rgba(255,51,51,0.15)', border: 'rgba(255,51,51,0.4)' },
  High:     { color: 'var(--accent-orange)', bg: 'rgba(255,107,53,0.15)', border: 'rgba(255,107,53,0.4)' },
  Medium:   { color: 'var(--accent-cyan)',   bg: 'rgba(0,212,255,0.15)',  border: 'rgba(0,212,255,0.4)' },
  Low:      { color: 'var(--accent-green)',  bg: 'rgba(0,255,136,0.15)', border: 'rgba(0,255,136,0.4)' },
};

// Reusable input with an icon on the left — uses ONLY inline styles
function IconInput({ icon: Icon, iconColor, type = 'text', value, onChange, placeholder, min, max, style = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        position: 'absolute',
        left: 12, top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', alignItems: 'center',
        pointerEvents: 'none', zIndex: 1,
        color: iconColor || 'rgba(255,255,255,0.3)',
      }}>
        <Icon size={14} />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        min={min}
        max={max}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${focused ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 10,
          color: 'var(--text-primary)',
          padding: '10px 12px 10px 36px',
          fontSize: 13,
          fontFamily: 'Inter, sans-serif',
          outline: 'none',
          boxShadow: focused ? '0 0 0 3px rgba(0,255,136,0.1)' : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          ...style,
        }}
      />
    </div>
  );
}

// Plain input (no icon)
function PlainInput({ value, onChange, placeholder, type = 'text', required, autoFocus, style = {}, rows }) {
  const [focused, setFocused] = useState(false);
  const commonStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 10,
    color: 'var(--text-primary)',
    padding: '10px 14px',
    fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxShadow: focused ? '0 0 0 3px rgba(0,255,136,0.1)' : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    ...style,
  };
  if (rows) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        rows={rows}
        style={{ ...commonStyle, resize: 'none', lineHeight: 1.5 }}
      />
    );
  }
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
      style={commonStyle}
    />
  );
}

// Select dropdown
function StyledSelect({ value, onChange, children, style = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        background: '#0d0d1f',
        border: `1px solid ${focused ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 10,
        color: 'var(--text-primary)',
        padding: '10px 14px',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        outline: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
        ...style,
      }}
    >
      {children}
    </select>
  );
}

// Field label
function Label({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.07em', color: 'rgba(255,255,255,0.45)',
      marginBottom: 6,
    }}>
      {children}
    </div>
  );
}

export default function TaskModal({ task, onClose }) {
  const { createTask, updateTask } = useApp();
  const isEdit = !!task;

  const [form, setForm] = useState({
    title:         task?.title || '',
    description:   task?.description || '',
    priority:      task?.priority || 'Medium',
    category:      task?.category || 'General',
    status:        task?.status || 'Pending',
    dueDate:       task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    estimatedTime: task?.estimatedTime || 30,
    xpReward:      task?.xpReward || 10,
    tags:          task?.tags?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const data = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    if (isEdit) await updateTask(task._id, data);
    else await createTask(data);
    setSaving(false);
    onClose();
  };

  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 540,
          background: '#0c0c1e',
          border: '1px solid rgba(0,255,136,0.12)',
          borderRadius: 20,
          padding: 28,
          boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,255,136,0.06)',
          animation: 'fadeInUp 0.25s cubic-bezier(0.34,1.2,0.64,1)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900 }}>
            {isEdit ? '✏️ Edit Task' : '⚡ New Task'}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Title */}
          <div>
            <Label>Task Title *</Label>
            <PlainInput
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="What do you need to do?"
              required
              autoFocus
              style={{ fontSize: 15, fontWeight: 600 }}
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <PlainInput
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Add details (optional)…"
              rows={3}
            />
          </div>

          {/* Priority */}
          <div>
            <Label>Priority</Label>
            <div style={{ display: 'flex', gap: 8 }}>
              {PRIORITIES.map(p => {
                const c = PRIORITY_COLORS[p];
                const active = form.priority === p;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => set('priority', p)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: 10,
                      border: `1px solid ${active ? c.border : 'rgba(255,255,255,0.08)'}`,
                      background: active ? c.bg : 'rgba(255,255,255,0.02)',
                      color: active ? c.color : 'rgba(255,255,255,0.35)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <Label>Category</Label>
            <StyledSelect value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0d0d1f' }}>{c}</option>)}
            </StyledSelect>
          </div>

          {/* Due Date */}
          <div>
            <Label>Due Date</Label>
            <IconInput
              icon={Calendar}
              type="date"
              value={form.dueDate}
              onChange={e => set('dueDate', e.target.value)}
            />
          </div>

          {/* Time + XP — side by side */}
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <Label>Est. Time (min)</Label>
              <IconInput
                icon={Clock}
                type="number"
                value={form.estimatedTime}
                onChange={e => set('estimatedTime', +e.target.value)}
                min={5}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Label>XP Reward</Label>
              <IconInput
                icon={Zap}
                iconColor="var(--accent-purple)"
                type="number"
                value={form.xpReward}
                onChange={e => set('xpReward', +e.target.value)}
                min={5}
                max={200}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags (comma separated)</Label>
            <IconInput
              icon={Tag}
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="react, learning, project…"
            />
          </div>

          {/* Status (edit mode only) */}
          {isEdit && (
            <div>
              <Label>Status</Label>
              <StyledSelect value={form.status} onChange={e => set('status', e.target.value)}>
                {['Pending', 'In-Progress', 'Completed'].map(s =>
                  <option key={s} value={s} style={{ background: '#0d0d1f' }}>{s}</option>
                )}
              </StyledSelect>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '12px', borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)', fontSize: 14,
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              style={{
                flex: 1, padding: '12px', borderRadius: 12,
                background: saving || !form.title.trim() ? 'rgba(0,255,136,0.3)' : 'var(--accent-green)',
                border: 'none',
                color: '#000', fontSize: 14, fontWeight: 800,
                cursor: saving || !form.title.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: saving || !form.title.trim() ? 'none' : '0 0 20px rgba(0,255,136,0.35)',
              }}
              onMouseEnter={e => { if (!saving && form.title.trim()) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {saving ? 'Saving…' : isEdit ? 'Update Task' : '+ Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

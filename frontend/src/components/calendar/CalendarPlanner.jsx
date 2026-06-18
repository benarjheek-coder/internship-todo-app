import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

export default function CalendarPlanner() {
  const { tasks, setActiveView } = useApp();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(null);

  const year = current.getFullYear();
  const month = current.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const tasksByDay = {};
  tasks.forEach(t => {
    if (!t.dueDate) return;
    const d = new Date(t.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate();
      if (!tasksByDay[key]) tasksByDay[key] = [];
      tasksByDay[key].push(t);
    }
  });

  const selectedTasks = selected ? (tasksByDay[selected] || []) : [];

  return (
    <div className="flex gap-6 h-full">
      {/* Calendar */}
      <div className="glass-card p-6 flex-1">
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrent(new Date(year, month - 1))} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors" style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-black text-lg">
            {current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => setCurrent(new Date(year, month + 1))} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors" style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center text-xs font-bold uppercase py-2" style={{ color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSelected = day === selected;
            const dayTasks = tasksByDay[day] || [];
            const hasOverdue = dayTasks.some(t => t.status !== 'Completed');

            return (
              <button
                key={day}
                onClick={() => setSelected(day === selected ? null : day)}
                className="relative flex flex-col items-center justify-start p-2 rounded-xl transition-all min-h-[52px]"
                style={{
                  background: isSelected ? 'rgba(0,255,136,0.15)' : isToday ? 'rgba(0,255,136,0.06)' : 'transparent',
                  border: isSelected ? '1px solid rgba(0,255,136,0.4)' : isToday ? '1px solid rgba(0,255,136,0.2)' : '1px solid transparent',
                }}
              >
                <span className="text-sm font-semibold" style={{
                  color: isToday ? 'var(--accent-green)' : isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isToday ? 800 : 600,
                }}>
                  {day}
                </span>
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {dayTasks.slice(0,3).map((t, ti) => (
                      <div key={ti} className="w-1.5 h-1.5 rounded-full" style={{
                        background: t.status === 'Completed' ? 'var(--accent-green)' :
                          t.priority === 'Critical' ? '#ff3333' :
                          t.priority === 'High' ? 'var(--accent-orange)' : 'var(--accent-cyan)',
                      }} />
                    ))}
                    {dayTasks.length > 3 && <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>+{dayTasks.length-3}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Tasks */}
      <div className="glass-card p-5 flex flex-col" style={{ width: 280, minWidth: 280 }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>
            {selected
              ? `${current.toLocaleDateString('en-US', { month: 'short' })} ${selected}`
              : 'Select a day'}
          </h3>
          {selected && <button onClick={() => setSelected(null)}><X size={14} color="var(--text-muted)" /></button>}
        </div>

        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click on a day to see tasks</p>
          </div>
        ) : selectedTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <p className="text-2xl mb-2">✨</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No tasks due this day</p>
            <button onClick={() => setActiveView('tasks')} className="btn-neon text-xs mt-3 px-3 py-1.5">
              <Plus size={11} className="inline mr-1" /> Add Task
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto flex-1">
            {selectedTasks.map(t => (
              <div key={t._id} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                <p className="text-sm font-semibold" style={{ textDecoration: t.status === 'Completed' ? 'line-through' : 'none', color: t.status === 'Completed' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {t.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`priority-badge priority-${t.priority.toLowerCase()}`}>{t.priority}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

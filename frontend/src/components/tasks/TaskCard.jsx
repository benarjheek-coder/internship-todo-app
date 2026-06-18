import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, Zap, Tag, Pencil, Trash2, CheckCircle, Circle, ChevronRight } from 'lucide-react';

const PRIORITY_STYLES = {
  Critical: 'priority-critical',
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};
const STATUS_STYLES = {
  'Pending': 'status-pending',
  'In-Progress': 'status-in-progress',
  'Completed': 'status-completed',
};

export default function TaskCard({ task, onEdit }) {
  const { updateTask, deleteTask } = useApp();
  const [hovering, setHovering] = useState(false);

  const toggleComplete = async () => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await updateTask(task._id, { status: newStatus });
  };

  const formatDue = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diff = Math.ceil((d - now) / 86400000);
    if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: '#ff3333' };
    if (diff === 0) return { text: 'Due today', color: 'var(--accent-orange)' };
    if (diff === 1) return { text: 'Due tomorrow', color: 'var(--accent-cyan)' };
    return { text: `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, color: 'var(--text-secondary)' };
  };

  const dueInfo = formatDue(task.dueDate);
  const isCompleted = task.status === 'Completed';

  return (
    <div
      className="glass-card p-4 cursor-pointer"
      style={{
        opacity: isCompleted ? 0.65 : 1,
        border: isCompleted ? '1px solid rgba(0,255,136,0.1)' : '1px solid var(--glass-border)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { setHovering(true); }}
      onMouseLeave={e => { setHovering(false); }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button onClick={toggleComplete} className="mt-0.5 shrink-0 transition-transform hover:scale-110">
          {isCompleted
            ? <CheckCircle size={18} color="var(--accent-green)" />
            : <Circle size={18} color="rgba(255,255,255,0.2)" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm leading-tight" style={{
              color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: isCompleted ? 'line-through' : 'none',
            }}>
              {task.title}
            </p>
            {/* Actions */}
            {hovering && (
              <div className="flex gap-1 shrink-0 animate-fade-in">
                <button onClick={() => onEdit(task)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Pencil size={12} />
                </button>
                <button onClick={() => deleteTask(task._id)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ff4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>

          {task.description && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className={`priority-badge ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</span>
            <span className={`priority-badge ${STATUS_STYLES[task.status]}`}>{task.status}</span>
            {task.category && task.category !== 'General' && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.1)', color: 'var(--accent-purple)', border: '1px solid rgba(168,85,247,0.2)' }}>
                {task.category}
              </span>
            )}
            {dueInfo && (
              <div className="flex items-center gap-1">
                <Calendar size={10} color={dueInfo.color} />
                <span className="text-[10px] font-semibold" style={{ color: dueInfo.color }}>{dueInfo.text}</span>
              </div>
            )}
            {task.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock size={10} color="var(--text-muted)" />
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{task.estimatedTime}m</span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Zap size={10} color="var(--accent-purple)" />
              <span className="text-[10px] font-bold" style={{ color: 'var(--accent-purple)' }}>+{task.xpReward || 10}</span>
            </div>
          </div>

          {/* Subtasks progress */}
          {task.subtasks?.length > 0 && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtasks
                </span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{
                  height: '100%',
                  width: `${(task.subtasks.filter(s => s.done).length / task.subtasks.length) * 100}%`,
                  background: 'var(--accent-green)',
                  borderRadius: 2,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )}

          {/* AI tag */}
          {task.aiGenerated && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,212,255,0.2)' }}>
              🤖 AI Generated
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

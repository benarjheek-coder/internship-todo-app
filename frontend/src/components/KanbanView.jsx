import React, { useRef } from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { format, isPast } from 'date-fns';

const COLUMNS = [
  { key: 'Pending',     label: '📋 To Do',      accent: 'rgba(255,255,255,0.15)' },
  { key: 'In-Progress', label: '⚡ In Progress',  accent: '#CAFF00' },
  { key: 'Completed',   label: '✅ Done',         accent: '#10b981' },
];

const PRIORITY_DOT = {
  High:   'bg-[#FF5500] shadow-[0_0_8px_rgba(255,85,0,0.7)]',
  Medium: 'bg-[#CAFF00] shadow-[0_0_8px_rgba(202,255,0,0.7)]',
  Low:    'bg-blue-400  shadow-[0_0_8px_rgba(96,165,250,0.7)]',
};

export default function KanbanView({ tasks, onToggleStatus, onDelete, onFocus }) {
  const draggedRef = useRef(null);

  const handleDragStart = (e, task) => { draggedRef.current = task; e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver  = (e) => e.preventDefault();
  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const task = draggedRef.current;
    if (task && task.status !== targetStatus) {
      // Cycle to target status directly by calling onToggleStatus multiple times logically
      // We pass the target status directly
      onToggleStatus(task, targetStatus);
    }
    draggedRef.current = null;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 animate-fade-up">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        return (
          <div
            key={col.key}
            className="kanban-col flex-1"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: `2px solid ${col.accent}` }}>
              <span className="font-black text-sm uppercase tracking-wider">{col.label}</span>
              <span className="text-xs font-black px-2 py-1 rounded-full"
                style={{ background: `${col.accent}20`, color: col.accent, border: `1px solid ${col.accent}40` }}>
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            {colTasks.map(task => {
              const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Completed';
              const subsDone = (task.subtasks || []).filter(s => s.done).length;
              const subsTotal = (task.subtasks || []).length;
              return (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="p-4 rounded-xl mb-2 cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 hover:shadow-lg group animate-fade-up"
                  style={{
                    background: task.status === 'Completed' ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.05)',
                    border: overdue ? '1px solid rgba(255,85,0,0.4)' : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={`text-sm font-bold leading-snug ${task.status === 'Completed' ? 'line-through text-white/30' : 'text-white'}`}>
                      {task.title}
                    </p>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${PRIORITY_DOT[task.priority]}`} />
                  </div>
                  {task.description && (
                    <p className="text-xs text-white/40 line-clamp-2 mb-2">{task.description}</p>
                  )}
                  {/* Subtask progress */}
                  {subsTotal > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-white/30 font-bold mb-1">
                        <span>Subtasks</span><span>{subsDone}/{subsTotal}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${(subsDone/subsTotal)*100}%`, background: '#CAFF00' }} />
                      </div>
                    </div>
                  )}
                  {/* Footer */}
                  <div className="flex items-center justify-between gap-2 mt-3">
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-[10px] font-bold"
                        style={{ color: overdue ? '#FF5500' : 'rgba(255,255,255,0.4)' }}>
                        {overdue && <AlertTriangle className="w-3 h-3" />}
                        <Calendar className="w-3 h-3" />
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                    <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onFocus(task)}
                        className="text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wide transition-all"
                        style={{ background: '#CAFF0015', color: '#CAFF00', border: '1px solid #CAFF0030' }}>
                        Focus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {colTasks.length === 0 && (
              <div className="flex items-center justify-center h-24 text-white/15 text-sm font-bold border-2 border-dashed border-white/10 rounded-xl">
                Drop here
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

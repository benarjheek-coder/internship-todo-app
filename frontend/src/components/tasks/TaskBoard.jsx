import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import { Plus, Filter, SortAsc, Wand2 } from 'lucide-react';

const COLUMNS = [
  { id: 'Pending', label: 'To Do', color: 'rgba(255,255,255,0.3)', dot: 'rgba(255,255,255,0.3)' },
  { id: 'In-Progress', label: 'In Progress', color: 'var(--accent-cyan)', dot: 'var(--accent-cyan)' },
  { id: 'Completed', label: 'Done', color: 'var(--accent-green)', dot: 'var(--accent-green)' },
];

const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export default function TaskBoard() {
  const { tasks, loadingTasks, aiCreateTasks } = useApp();
  const [modal, setModal] = useState(null); // null | 'new' | taskObj
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('priority');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  const filtered = tasks.filter(t => filter === 'all' || t.category === filter || t.priority === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'priority') return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
    if (sort === 'due') return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999');
    if (sort === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const handleAiCreate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    await aiCreateTasks(aiPrompt);
    setAiPrompt('');
    setShowAiInput(false);
    setAiLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)} className="input text-xs py-1.5 px-3" style={{ width: 'auto', background: 'var(--glass-2)', color: 'var(--text-0)', border: '1px solid var(--glass-border)', borderRadius: 10 }}>
            <option value="priority" style={{ background: '#0d0d1f', color: 'var(--text-0)' }}>Sort: Priority</option>
            <option value="due" style={{ background: '#0d0d1f', color: 'var(--text-0)' }}>Sort: Due Date</option>
            <option value="created" style={{ background: '#0d0d1f', color: 'var(--text-0)' }}>Sort: Newest</option>
          </select>
        </div>

        <div className="flex gap-2">
          {/* AI Create */}
          <button onClick={() => setShowAiInput(v => !v)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,212,255,0.2)' }}
          >
            <Wand2 size={13} /> AI Create
          </button>
          <button onClick={() => setModal('new')} className="btn-neon flex items-center gap-2 text-xs py-2">
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      {/* AI Prompt Input */}
      {showAiInput && (
        <div className="glass-card p-4 animate-fade-up flex gap-2" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
          <input
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAiCreate()}
            placeholder="Describe your goal… e.g. 'Create a roadmap to learn Full Stack Development'"
            className="input flex-1 text-sm py-2"
          />
          <button onClick={handleAiCreate} disabled={aiLoading} className="btn-neon text-xs px-4" style={{ background: 'var(--accent-cyan)', color: '#000' }}>
            {aiLoading ? '…' : 'Generate'}
          </button>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 500 }}>
        {COLUMNS.map(col => {
          const colTasks = sorted.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="kanban-col flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.dot, boxShadow: `0 0 6px ${col.dot}` }} />
                  <span className="font-bold text-sm" style={{ color: col.color }}>{col.label}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5" style={{ scrollbarWidth: 'thin' }}>
                {loadingTasks && colTasks.length === 0 ? (
                  <div className="flex flex-col gap-2">
                    {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}
                  </div>
                ) : colTasks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-3xl mb-2">{col.id === 'Completed' ? '🏆' : col.id === 'In-Progress' ? '⚡' : '📋'}</div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No tasks here</p>
                  </div>
                ) : colTasks.map((t, i) => (
                  <div key={t._id} className="animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                    <TaskCard task={t} onEdit={setModal} />
                  </div>
                ))}
              </div>

              {/* Add in column */}
              {col.id === 'Pending' && (
                <button onClick={() => setModal('new')} className="m-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  style={{ border: '1px dashed rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'; e.currentTarget.style.color = 'var(--accent-green)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <Plus size={12} /> Add Task
                </button>
              )}
            </div>
          );
        })}
      </div>

      {modal && (
        <TaskModal task={modal === 'new' ? null : modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

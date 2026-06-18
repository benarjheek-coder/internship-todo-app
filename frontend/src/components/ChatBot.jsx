import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { X, Send, Bot, Loader2, ChevronDown, Trash2, Sparkles } from 'lucide-react';

const WELCOME = {
  role: 'assistant',
  content: "⚡ Hey! I'm **BENNY** — your AI Productivity OS.\n\nI have full access to your tasks and can:\n• Create tasks from natural language\n• Generate learning roadmaps\n• Plan your day or week\n• Analyze your productivity\n• Answer any question\n\nWhat would you like to achieve today? 🚀"
};

const QUICK_PROMPTS = [
  "Plan my day",
  "What should I focus on first?",
  "Create a roadmap to learn React",
  "Analyze my productivity",
];

export default function ChatBot() {
  const { user } = useContext(AuthContext);
  const { fetchTasks, showNotification, API } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
      setHasNew(false);
    }
  }, [open, messages]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: userText };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/chat`,
        { messages: updated.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      if (res.data.createdTasks?.length > 0) {
        fetchTasks();
        showNotification(`🤖 BENNY created ${res.data.createdTasks.length} tasks for you!`, 'ai');
      }
      if (!open) setHasNew(true);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || '';
      if (status === 401 || msg.includes('no longer exists') || msg.includes('Not authorized')) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '🔐 **Session expired** — your login session has ended (this happens when the server restarts).\n\nYou\'ll be redirected to login automatically. Or [click here](/login) to sign in again.'
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '❌ ' + (msg || 'Connection error. Make sure the backend is running.') }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed z-[998] flex flex-col animate-bounce-in"
          style={{
            bottom: 88, right: 20,
            width: 420, height: 580,
            background: '#0a0a1a',
            border: '1px solid rgba(0,255,136,0.15)',
            borderRadius: 20,
            boxShadow: '0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,255,136,0.08), 0 0 60px rgba(0,255,136,0.05)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: '#0d0d1f', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-green)' }}>
              <Bot size={16} color="#000" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="font-black text-xs text-white uppercase tracking-widest">BENNY AI</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-green)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,255,136,0.6)' }}>Online · Task-Aware</span>
              </div>
            </div>
            <button onClick={() => setMessages([WELCOME])} className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.2)' }} onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.6)'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}>
              <Trash2 size={13} />
            </button>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg" style={{ color: 'rgba(255,255,255,0.2)' }} onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.6)'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}>
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: 'thin' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5" style={{ background: 'var(--accent-green)' }}>
                    <Bot size={12} color="#000" />
                  </div>
                )}
                <div
                  className="max-w-[82%] px-3 py-2.5 text-sm leading-relaxed"
                  style={{
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? 'var(--accent-green)' : 'rgba(255,255,255,0.04)',
                    color: msg.role === 'user' ? '#000' : 'rgba(255,255,255,0.88)',
                    border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    fontWeight: msg.role === 'user' ? 600 : 400,
                  }}
                >
                  {msg.role === 'assistant'
                    ? <div className="ai-content"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                    : msg.content
                  }
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2" style={{ background: 'var(--accent-green)' }}>
                  <Bot size={12} color="#000" />
                </div>
                <div className="px-3 py-2.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-green)', animation: `typing 1.2s ease ${i*0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all"
                  style={{ background: 'rgba(0,255,136,0.07)', color: 'rgba(0,255,136,0.7)', border: '1px solid rgba(0,255,136,0.15)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,136,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,255,136,0.07)'}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask BENNY anything…"
                disabled={loading}
                className="input py-2.5 text-sm flex-1"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: input.trim() && !loading ? 'var(--accent-green)' : 'rgba(255,255,255,0.04)',
                  color: input.trim() && !loading ? '#000' : 'rgba(255,255,255,0.2)',
                }}
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} strokeWidth={2.5} />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed z-[999] w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200"
        style={{
          bottom: 20, right: 20,
          background: open ? '#0d0d1f' : 'var(--accent-green)',
          border: open ? '1.5px solid rgba(0,255,136,0.3)' : 'none',
          boxShadow: open ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,255,136,0.4)',
          animation: !open ? 'neon-pulse 3s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {open ? <X size={22} color="white" /> : <Sparkles size={22} color="#000" strokeWidth={2.5} />}
        {hasNew && !open && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: 'var(--accent-orange)', color: 'white' }}>!</div>
        )}
      </button>
      <style>{`@keyframes typing { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
    </>
  );
}

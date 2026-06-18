import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Bot, Send, Loader2, Trash2, Sparkles, Copy, Check, Zap } from 'lucide-react';

const WELCOME = {
  role: 'assistant',
  content: `# Hey! I'm BENNY AI 👋

I'm your **general-purpose AI assistant** — think ChatGPT, but built right into your productivity workspace.

**I can help you with literally anything:**

💻 **Code** — Debug, write, or explain code in any language  
🧮 **Math** — Solve equations, calculus, statistics  
📚 **Learning** — Explain any concept at any level  
✍️ **Writing** — Essays, emails, reports, creative writing  
🎯 **Productivity** — Plan your day, create tasks, build roadmaps  
🔬 **Research** — Answer factual questions, summarize topics  
💡 **Brainstorm** — Ideas, names, strategies, decisions  
🌐 **Anything else** — Just ask!

What would you like to know or do today?`
};

const QUICK = [
  { label: '📅 Plan my day', msg: 'Look at my tasks and create an optimized plan for my day with time blocks' },
  { label: '💻 Write code', msg: 'Write a Python function to sort a list of dictionaries by a key' },
  { label: '🗺️ Learning roadmap', msg: 'Create a complete roadmap to become a full stack developer in 6 months with tasks' },
  { label: '🧮 Explain concept', msg: 'Explain how machine learning works in simple terms with examples' },
  { label: '📊 Analyze tasks', msg: 'Analyze my productivity based on my current tasks and give me actionable insights' },
  { label: '✍️ Help me write', msg: 'Write a professional email asking for a salary raise' },
];

// Copy button for code blocks
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{
        position: 'absolute', top: 8, right: 8,
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
        color: copied ? 'var(--accent-green)' : 'rgba(255,255,255,0.5)',
        fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
        transition: 'all 0.2s',
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// Custom markdown renderer with code highlighting + copy button
function AIMessage({ content }) {
  return (
    <div className="ai-content">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const code = String(children).replace(/\n$/, '');
            if (inline) {
              return (
                <code style={{
                  background: 'rgba(0,255,136,0.1)', color: 'var(--accent-green)',
                  padding: '2px 6px', borderRadius: 4, fontSize: '0.875em',
                  fontFamily: 'Consolas, Monaco, monospace',
                }}>
                  {children}
                </code>
              );
            }
            return (
              <div style={{ position: 'relative', margin: '12px 0' }}>
                <div style={{
                  background: '#0a0a16', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}>
                  {/* Language bar */}
                  <div style={{
                    background: 'rgba(255,255,255,0.04)', padding: '6px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace',
                  }}>
                    {(className || 'code').replace('language-', '')}
                  </div>
                  <pre style={{
                    margin: 0, padding: '14px 16px', overflowX: 'auto',
                    fontSize: 13, lineHeight: 1.6,
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    color: 'rgba(255,255,255,0.88)',
                  }}>
                    <code>{code}</code>
                  </pre>
                </div>
                <CopyButton text={code} />
              </div>
            );
          },
          h1: ({ children }) => <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, marginTop: 14, color: 'var(--text-primary)' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, marginTop: 12, color: 'var(--text-primary)' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, marginTop: 10, color: 'var(--accent-green)' }}>{children}</h3>,
          strong: ({ children }) => <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{children}</strong>,
          a: ({ href, children }) => <a href={href} style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }} target="_blank" rel="noreferrer">{children}</a>,
          ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: 4, lineHeight: 1.6 }}>{children}</li>,
          p: ({ children }) => <p style={{ marginBottom: 10, lineHeight: 1.7 }}>{children}</p>,
          blockquote: ({ children }) => (
            <blockquote style={{
              borderLeft: '3px solid var(--accent-cyan)', paddingLeft: 12,
              color: 'var(--text-secondary)', margin: '10px 0', fontStyle: 'italic',
            }}>{children}</blockquote>
          ),
          hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '16px 0' }} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function AIAssistant() {
  const { user } = useContext(AuthContext);
  const { fetchTasks, showNotification, API } = useApp();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  };

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMsg = { role: 'user', content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await axios.post(
        `${API}/chat`,
        {
          messages: updated
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content }))
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);

      if (res.data.createdTasks?.length > 0) {
        fetchTasks();
        showNotification(`🤖 BENNY created ${res.data.createdTasks.length} task${res.data.createdTasks.length > 1 ? 's' : ''} automatically!`, 'ai');
      }
    } catch (err) {
      const status = err?.response?.status;
      const errMsg = err?.response?.data?.message || 'Connection error';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: status === 401
          ? '🔐 **Session expired.** Please log in again.'
          : `❌ **Error:** ${errMsg}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', minHeight: 500 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 16, marginBottom: 16,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--accent-green)',
            boxShadow: '0 0 20px rgba(0,255,136,0.4)',
          }}>
            <Sparkles size={20} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ fontWeight: 900, fontSize: 16, marginBottom: 1 }}>BENNY AI</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              General-purpose AI · Answers anything · Creates tasks automatically
            </p>
          </div>
        </div>
        <button
          onClick={() => setMessages([WELCOME])}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 10, cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Trash2 size={12} /> New chat
        </button>
      </div>

      {/* Quick prompts — visible only on fresh chat */}
      {messages.length === 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, flexShrink: 0 }}>
          {QUICK.map(({ label, msg }) => (
            <button
              key={label}
              onClick={() => send(msg)}
              style={{
                padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.25)'; e.currentTarget.style.color = 'var(--accent-green)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, paddingRight: 4, paddingBottom: 16 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: 12,
              alignItems: 'flex-start',
              animation: 'fadeInUp 0.3s ease both',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: msg.role === 'user' ? 'rgba(0,255,136,0.12)' : 'var(--accent-green)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(0,255,136,0.25)' : 'transparent'}`,
            }}>
              {msg.role === 'assistant'
                ? <Bot size={16} color="#000" />
                : <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--accent-green)' }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
              }
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: msg.role === 'user' ? '70%' : '85%',
              minWidth: 40,
              padding: msg.role === 'user' ? '10px 16px' : '14px 18px',
              borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, rgba(0,255,136,0.18), rgba(0,255,136,0.08))'
                : 'rgba(255,255,255,0.03)',
              border: msg.role === 'user'
                ? '1px solid rgba(0,255,136,0.25)'
                : '1px solid rgba(255,255,255,0.06)',
              fontSize: 14,
              lineHeight: 1.65,
              color: msg.role === 'user' ? 'var(--accent-green)' : 'var(--text-primary)',
              fontWeight: msg.role === 'user' ? 600 : 400,
            }}>
              {msg.role === 'assistant'
                ? <AIMessage content={msg.content} />
                : msg.content
              }
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', animation: 'fadeInUp 0.3s ease' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--accent-green)',
            }}>
              <Bot size={16} color="#000" />
            </div>
            <div style={{
              padding: '14px 18px', borderRadius: '4px 18px 18px 18px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent-green)',
                  animation: `typing 1.2s ease ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        paddingTop: 16,
        borderTop: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16, padding: '10px 14px',
          transition: 'border-color 0.2s',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,0.35)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything — code, math, plans, advice… (Enter to send, Shift+Enter for new line)"
            disabled={loading}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
              fontFamily: 'Inter, sans-serif', resize: 'none', maxHeight: 160,
              paddingTop: 2,
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: input.trim() && !loading ? 'var(--accent-green)' : 'rgba(255,255,255,0.06)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
              color: input.trim() && !loading ? '#000' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.2s',
              transform: 'none',
            }}
            onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
          BENNY can make mistakes. Verify important information. · Powered by Gemini AI
        </p>
      </div>

      <style>{`
        @keyframes typing { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

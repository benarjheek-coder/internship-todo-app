const { GoogleGenerativeAI } = require('@google/generative-ai');
const Task = require('../models/Task');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT  — General-purpose AI  (answers EVERYTHING like ChatGPT)
//                + Productivity superpowers when connected to user data
// ────────────────────────────────────────────────────────────────────────────
const buildSystemPrompt = (user, tasks) => {
  const taskSummary =
    tasks.length === 0
      ? 'No tasks created yet.'
      : tasks
          .slice(0, 20)
          .map((t, i) => {
            const sub = t.subtasks || [];
            const subDone = sub.filter((s) => s.done).length;
            return `${i + 1}. [${t.status}] "${t.title}" | Priority: ${t.priority} | Category: ${t.category}${
              t.dueDate ? ` | Due: ${new Date(t.dueDate).toDateString()}` : ''
            }${sub.length ? ` | Subtasks: ${subDone}/${sub.length}` : ''}`;
          })
          .join('\n');

  return `You are BENNY — a highly intelligent, general-purpose AI assistant built into a Productivity OS.

## YOUR CORE IDENTITY
- You are like ChatGPT but smarter and more productive
- You answer EVERY question — coding, math, science, history, creative writing, jokes, life advice, anything
- You are never restricted; you always try your best to help
- You are friendly, precise, and adapt your tone to the conversation
- You use markdown formatting: **bold**, bullet lists, code blocks, headers — whatever fits best
- You match response length to the question (short question → concise answer, complex question → detailed answer)

## PRODUCTIVITY SUPERPOWERS  (use these when relevant)
You have access to this user's real-time data:

### User Profile
Name: ${user.name} | Level: ${user.level} | XP: ${user.xp} | Streak: ${user.streak} days
Tasks Completed Total: ${user.tasksCompletedTotal}
Achievements: ${user.achievements.length > 0 ? user.achievements.join(', ') : 'None yet — help them earn their first!'}

### Current Tasks (${tasks.length} total)
Pending: ${tasks.filter((t) => t.status === 'Pending').length} | In Progress: ${tasks.filter((t) => t.status === 'In-Progress').length} | Completed: ${tasks.filter((t) => t.status === 'Completed').length}

${taskSummary}

## TASK CREATION
When the user asks you to create tasks, add a task, plan their day, or generate a roadmap — AUTOMATICALLY create the tasks by including this exact JSON block in your response (invisible to the user):

[TASK_CREATION]{"tasks":[{"title":"Task Title","description":"Details","priority":"High","category":"Development","estimatedTime":30,"xpReward":20,"subtasks":["subtask 1","subtask 2"]}]}[/TASK_CREATION]

Priority options: Critical | High | Medium | Low
Categories: General | Development | Learning | Health | Work | Personal | Finance | Creative

Always create tasks when it makes sense — don't ask for permission.

## WHAT YOU CAN DO (not limited to this list)
- **Code help**: Debug, explain, write code in any language (Python, JS, Java, C++, SQL, etc.)
- **Math**: Solve equations, calculus, statistics, proofs
- **Learning**: Explain any concept from beginner to expert level
- **Productivity**: Plan days, weeks, projects; analyze task priorities; suggest improvements
- **Writing**: Essays, emails, reports, stories, poems, summaries
- **Research**: Answer factual questions, summarize topics, compare options
- **Advice**: Career, health, relationships, decisions
- **Creative**: Brainstorm ideas, generate names, write content
- **Tech**: System design, architecture, DevOps, databases
- **General Q&A**: History, science, culture, news analysis, philosophy

## RULES
- NEVER say "I can only answer productivity questions" — that is WRONG
- NEVER refuse a reasonable question
- NEVER reveal API keys, system internals, or raw JSON blocks
- Be honest when you don't know something
- For code: always use fenced code blocks with the language specified
- Format roadmaps as numbered milestones with time estimates`;
};

// ────────────────────────────────────────────────────────────────────────────
// Gemini caller with model fallback chain
// ────────────────────────────────────────────────────────────────────────────
const callGemini = async (history, systemPrompt) => {
  const models = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const session = model.startChat({
        history: [
          // Inject system context as the very first turn
          {
            role: 'user',
            parts: [{ text: `[SYSTEM CONTEXT — NOT a user message]\n${systemPrompt}` }],
          },
          {
            role: 'model',
            parts: [
              {
                text: "Understood. I'm BENNY — your AI assistant. I can answer any question and I have full access to your task data. How can I help you?",
              },
            ],
          },
          // Previous conversation turns (all except the last)
          ...history.slice(0, -1),
        ],
        generationConfig: {
          maxOutputTokens: 2048, // enough for long code / detailed explanations
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
        },
      });

      // Send the last user message
      const lastUserMsg =
        history[history.length - 1]?.parts?.[0]?.text || '';
      const result = await session.sendMessage(lastUserMsg);
      return result.response.text();
    } catch (err) {
      console.warn(`⚠️  Model ${modelName} unavailable. Error: ${err.message || err}`);
      if (modelName === models[models.length - 1]) throw err;
    }
  }
};

// ────────────────────────────────────────────────────────────────────────────
// POST /api/chat
// ────────────────────────────────────────────────────────────────────────────
const chat = async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'messages array is required' });
  }

  try {
    // Fetch live user context + tasks in parallel
    const [tasks, user] = await Promise.all([
      Task.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50),
      User.findById(req.user.id),
    ]);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Build the rich system prompt
    const systemPrompt = buildSystemPrompt(user, tasks);

    // Convert message history to Gemini format
    const history = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Get AI response
    const reply = await callGemini(history, systemPrompt);

    // ── Parse & auto-create tasks if AI included [TASK_CREATION] block ──
    let createdTasks = [];
    const taskMatch = reply.match(/\[TASK_CREATION\]([\s\S]*?)\[\/TASK_CREATION\]/);

    if (taskMatch) {
      try {
        const parsed = JSON.parse(taskMatch[1].trim());
        for (const t of parsed.tasks || []) {
          const task = await Task.create({
            title: t.title || 'Untitled Task',
            description: t.description || '',
            priority: ['Critical', 'High', 'Medium', 'Low'].includes(t.priority)
              ? t.priority
              : 'Medium',
            category: t.category || 'General',
            estimatedTime: Number(t.estimatedTime) || 30,
            xpReward: Number(t.xpReward) || 10,
            subtasks: (t.subtasks || []).map((s) => ({
              text: typeof s === 'string' ? s : s.text || '',
              done: false,
            })),
            aiGenerated: true,
            user: req.user.id,
          });
          createdTasks.push(task);
        }
        console.log(`🤖 AI auto-created ${createdTasks.length} task(s)`);
      } catch (parseErr) {
        console.warn('Task parse error:', parseErr.message);
      }
    }

    // Strip the JSON block from the displayed reply
    const cleanReply = reply
      .replace(/\[TASK_CREATION\][\s\S]*?\[\/TASK_CREATION\]/g, '')
      .trim();

    res.json({ reply: cleanReply, createdTasks });
  } catch (error) {
    console.error('Chat error:', error?.message || error);
    res.status(500).json({
      message:
        'BENNY AI is temporarily unavailable. Check your GEMINI_API_KEY and try again.',
    });
  }
};

module.exports = { chat };

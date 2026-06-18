const Task = require('../models/Task');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// GET ALL TASKS
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ order: 1, createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// CREATE A NEW TASK
const setTask = async (req, res) => {
  if (!req.body.title) return res.status(400).json({ message: 'Please add a title field' });
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description || '',
      status: req.body.status || 'Pending',
      priority: req.body.priority || 'Medium',
      category: req.body.category || 'General',
      dueDate: req.body.dueDate || null,
      estimatedTime: req.body.estimatedTime || 30,
      xpReward: req.body.xpReward || 10,
      tags: req.body.tags || [],
      subtasks: req.body.subtasks || [],
      aiGenerated: req.body.aiGenerated || false,
      user: req.user.id,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating task', error: error.message });
  }
};

// UPDATE A TASK — awards XP on completion
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    const wasCompleted = task.status === 'Completed';
    const becomingCompleted = req.body.status === 'Completed';

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        completedAt: becomingCompleted && !wasCompleted ? new Date() : task.completedAt,
      },
      { new: true }
    );

    // Award XP on first completion
    let newAchievements = [];
    let userUpdate = null;
    if (becomingCompleted && !wasCompleted) {
      const user = await User.findById(req.user.id);
      user.tasksCompletedTotal += 1;

      // XP: base reward + bonus if before deadline
      let xpAmount = task.xpReward || 10;
      const isBeforeDeadline = task.dueDate && new Date() < new Date(task.dueDate);
      if (isBeforeDeadline) xpAmount += 10; // bonus

      await user.awardXP(xpAmount, 'Task completed');
      newAchievements = await user.checkAchievements();
      userUpdate = {
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        achievements: user.achievements,
        xpAwarded: xpAmount,
      };
    }

    res.status(200).json({ task: updatedTask, userUpdate, newAchievements });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

// DELETE A TASK
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    await task.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

// REORDER TASKS
const reorderTasks = async (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) return res.status(400).json({ message: 'orderedIds must be an array' });
  try {
    await Promise.all(orderedIds.map((id, index) =>
      Task.findOneAndUpdate({ _id: id, user: req.user.id }, { order: index })
    ));
    res.status(200).json({ message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ message: 'Server error reordering tasks' });
  }
};

// AI CREATE TASKS — natural language → structured tasks
const aiCreateTasks = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

  try {
    const systemPrompt = `You are a productivity AI. Given a user's goal or request, generate a structured list of tasks.
    
Return ONLY valid JSON in this exact format:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Brief description",
      "priority": "High",
      "category": "Development",
      "estimatedTime": 60,
      "xpReward": 20,
      "subtasks": ["Subtask 1", "Subtask 2"]
    }
  ],
  "summary": "Brief plan summary"
}

Priority must be one of: Critical, High, Medium, Low
Category should be relevant (e.g., Development, Learning, Health, Work, Personal)
estimatedTime is in minutes
xpReward between 10-50 based on difficulty
Generate 3-8 realistic, actionable tasks.`;

    const models = ['gemini-2.5-flash', 'gemini-3.1-flash-lite'];
    let text;
    let success = false;
    let lastError;

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(`${systemPrompt}\n\nUser request: ${prompt}`);
        text = result.response.text();
        success = true;
        break;
      } catch (err) {
        lastError = err;
        console.warn(`⚠️  Model ${modelName} failed for AI task generation:`, err.message || err);
      }
    }

    if (!success) {
      return res.status(500).json({ message: 'AI task generation failed on all models', error: lastError?.message });
    }

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ message: 'AI could not generate tasks' });

    const parsed = JSON.parse(jsonMatch[0]);
    const createdTasks = [];

    for (const t of parsed.tasks) {
      const task = await Task.create({
        title: t.title,
        description: t.description || '',
        priority: ['Critical','High','Medium','Low'].includes(t.priority) ? t.priority : 'Medium',
        category: t.category || 'General',
        estimatedTime: t.estimatedTime || 30,
        xpReward: t.xpReward || 10,
        subtasks: (t.subtasks || []).map(s => ({ text: s, done: false })),
        aiGenerated: true,
        user: req.user.id,
      });
      createdTasks.push(task);
    }

    res.json({ tasks: createdTasks, summary: parsed.summary });
  } catch (error) {
    console.error('AI create tasks error:', error);
    res.status(500).json({ message: 'AI task creation failed', error: error.message });
  }
};

module.exports = { getTasks, setTask, updateTask, deleteTask, reorderTasks, aiCreateTasks };

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user, updateUserLocally } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [notification, setNotification] = useState(null);
  const [xpAnimation, setXpAnimation] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${user?.token}` } });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const showXPGain = (amount) => {
    setXpAnimation(amount);
    setTimeout(() => setXpAnimation(null), 2000);
  };

  const fetchTasks = useCallback(async () => {
    if (!user?.token) return;
    setLoadingTasks(true);
    try {
      const res = await axios.get(`${API}/tasks`, authHeaders());
      setTasks(res.data);
    } catch (err) { console.error('Fetch tasks failed'); }
    finally { setLoadingTasks(false); }
  }, [user?.token]);

  const fetchGoals = useCallback(async () => {
    if (!user?.token) return;
    try {
      const res = await axios.get(`${API}/goals`, authHeaders());
      setGoals(res.data);
    } catch {}
  }, [user?.token]);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.token) return;
    try {
      const [sumRes, weekRes, catRes] = await Promise.all([
        axios.get(`${API}/analytics/summary`, authHeaders()),
        axios.get(`${API}/analytics/weekly`, authHeaders()),
        axios.get(`${API}/analytics/category`, authHeaders()),
      ]);
      setAnalytics(sumRes.data);
      setWeeklyData(weekRes.data);
      setCategoryData(catRes.data);
    } catch {}
  }, [user?.token]);

  useEffect(() => {
    if (user?.token) {
      fetchTasks();
      fetchGoals();
      fetchAnalytics();
    }
  }, [user?.token]);

  const createTask = async (taskData) => {
    try {
      const res = await axios.post(`${API}/tasks`, taskData, authHeaders());
      setTasks(prev => [res.data, ...prev]);
      showNotification('Task created! ⚡');
      return res.data;
    } catch (err) { showNotification('Failed to create task', 'error'); return null; }
  };

  const updateTask = async (id, updates) => {
    try {
      const res = await axios.put(`${API}/tasks/${id}`, updates, authHeaders());
      const { task, userUpdate, newAchievements } = res.data;
      setTasks(prev => prev.map(t => t._id === id ? task : t));
      if (userUpdate) {
        updateUserLocally(userUpdate);
        showXPGain(userUpdate.xpAwarded);
        if (newAchievements?.length > 0) {
          showNotification(`🏆 Achievement unlocked: ${newAchievements.join(', ')}!`, 'achievement');
        }
        fetchAnalytics();
      }
      return task;
    } catch { showNotification('Failed to update task', 'error'); return null; }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/tasks/${id}`, authHeaders());
      setTasks(prev => prev.filter(t => t._id !== id));
      showNotification('Task deleted');
    } catch { showNotification('Failed to delete task', 'error'); }
  };

  const aiCreateTasks = async (prompt) => {
    try {
      const res = await axios.post(`${API}/tasks/ai-create`, { prompt }, authHeaders());
      setTasks(prev => [...res.data.tasks, ...prev]);
      showNotification(`🤖 AI created ${res.data.tasks.length} tasks!`, 'ai');
      return res.data;
    } catch { showNotification('AI task creation failed', 'error'); return null; }
  };

  const createGoal = async (goalData) => {
    try {
      const res = await axios.post(`${API}/goals`, goalData, authHeaders());
      setGoals(prev => [res.data, ...prev]);
      showNotification('Goal created! 🎯');
      return res.data;
    } catch { return null; }
  };

  const updateGoal = async (id, updates) => {
    try {
      const res = await axios.put(`${API}/goals/${id}`, updates, authHeaders());
      setGoals(prev => prev.map(g => g._id === id ? res.data : g));
    } catch {}
  };

  const saveFocusSession = async (sessionData) => {
    try {
      const res = await axios.post(`${API}/focus/session`, sessionData, authHeaders());
      if (res.data.xpEarned) {
        updateUserLocally({ xp: user.xp + res.data.xpEarned });
        showXPGain(res.data.xpEarned);
        fetchAnalytics();
      }
      return res.data;
    } catch { return null; }
  };

  // Computed values
  const todayTasks = tasks.filter(t => {
    const today = new Date(); today.setHours(0,0,0,0);
    const completedToday = t.completedAt && new Date(t.completedAt) >= today;
    return t.status !== 'Completed' || completedToday;
  });
  const completedTodayCount = tasks.filter(t => {
    const today = new Date(); today.setHours(0,0,0,0);
    return t.status === 'Completed' && t.completedAt && new Date(t.completedAt) >= today;
  }).length;

  const xpForLevel = (level) => {
    const map = { Rookie:0, Explorer:100, Warrior:300, Master:600, Legend:900 };
    return map[level] || 0;
  };
  const xpNextLevel = (level) => {
    const map = { Rookie:100, Explorer:300, Warrior:600, Master:900, Legend:1000 };
    return map[level] || 1000;
  };

  const currentXP = user?.xp || 0;
  const currentLevel = user?.level || 'Rookie';
  const xpMin = xpForLevel(currentLevel);
  const xpMax = xpNextLevel(currentLevel);
  const xpProgress = currentLevel === 'Legend' ? 100 : Math.round(((currentXP - xpMin) / (xpMax - xpMin)) * 100);

  return (
    <AppContext.Provider value={{
      tasks, goals, analytics, weeklyData, categoryData,
      loadingTasks, activeView, setActiveView,
      notification, xpAnimation, mobileSidebarOpen, setMobileSidebarOpen,
      fetchTasks, fetchGoals, fetchAnalytics,
      createTask, updateTask, deleteTask, aiCreateTasks,
      createGoal, updateGoal,
      saveFocusSession,
      completedTodayCount, xpProgress, xpMin, xpMax, currentXP, currentLevel,
      showNotification, API, authHeaders,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

const express = require('express');
const router = express.Router();
const { getTasks, setTask, updateTask, deleteTask, reorderTasks, aiCreateTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTasks);
router.post('/', protect, setTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.patch('/reorder', protect, reorderTasks);
router.post('/ai-create', protect, aiCreateTasks);

module.exports = router;

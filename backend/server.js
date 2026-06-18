const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/focus', require('./routes/focus'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/', (req, res) => res.send('BENNY Productivity OS API — Running! 🚀'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`BENNY API running on port ${PORT}`));

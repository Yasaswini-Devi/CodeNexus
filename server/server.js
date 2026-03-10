const express = require('express');
const cors = require('cors');
require('dotenv').config();

const shareRoutes = require('./routes/share');

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// This will now work because pythonRoutes exports a Router function
app.use('/runpy', require('./routes/pythonRoutes'));
// AI assistant route (proxies to configured model endpoint)
app.use('/ai', require('./routes/aiRoutes'));
// Local mock model for testing (useful if you don't have a real model running)
app.use('/mock-model', require('./routes/mockModel'));

app.use('/api/share', shareRoutes);

const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

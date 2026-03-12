const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db');


const shareRoutes = require('./routes/share');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');

const app = express();

// Global Request Logger to see EVERY request hitting the server
app.use((req, res, next) => {
    console.log(`[SERVER] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});

// Middleware
app.use(cors({ origin: true , credentials: true }));
app.use(express.json());

// Routes
app.use('/runpy', require('./routes/pythonRoutes'));
app.use('/ai', require('./routes/aiRoutes'));
app.use('/mock-model', require('./routes/mockModel'));
app.use('/api/share', shareRoutes); // ✅ Mount the share route

app.use('/api/share', shareRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

const PORT = 5001;
connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});

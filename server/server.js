const express = require('express');
const cors = require('cors');
require('dotenv').config();

const shareRoutes = require('./routes/share'); // ✅ Import share.js

const app = express();

// ✅ CORS: Allow frontend (localhost:5173)
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use('/runpy', require('./routes/pythonRoutes'));
app.use('/ai', require('./routes/aiRoutes'));
app.use('/mock-model', require('./routes/mockModel'));
app.use('/api/share', shareRoutes); // ✅ Mount the share route

// ✅ IMPORTANT: Must match the port used in your Frontend fetch
const PORT = 5001; 
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Import Routes
try {
    const pythonRoutes = require('./routes/pythonRoutes');
    app.use('/runpy', pythonRoutes);
} catch (error) {
    console.error("CRITICAL ERROR: Could not load pythonRoutes file:", error);
}

// Routes
app.get('/', (req, res) => res.send('Server is working!'));

const PORT = 5001;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
 });

// Keep process from exiting
process.on('SIGINT', () => {
    console.log("Stopping server...");
    server.close(() => process.exit());
});

server.on('error', (err) => {
    console.error("SERVER ERROR:", err);
});
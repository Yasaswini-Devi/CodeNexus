const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Allow requests from any dev frontend (5173, 5174, etc.)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

// This will now work because pythonRoutes exports a Router function
app.use('/runpy', require('./routes/pythonRoutes'));

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
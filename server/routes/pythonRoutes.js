const express = require('express');
const router = express.Router();
const { generatefile, executepy } = require('../utils/pythonCompiler'); 
router.post('/', async (req, res) => {
    const { code } = req.body;
    try {
        const filePath = await generatefile('py', code);
        const output = await executepy(filePath);
        res.json({ output });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
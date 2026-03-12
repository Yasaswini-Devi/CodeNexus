const express = require('express');
const router = express.Router();
const { generatefile, executepy } = require('../utils/pythonCompiler'); 
router.post('/', async (req, res) => {
    const { code } = req.body;
    try {
        const filePath = await generatefile('py', code);
        const result = await executepy(filePath);
res.json({ output: result.output || '', plots: result.plots || [], error: result.error || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { executePythonJob } = require('../utils/pythonCompiler');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10,
    },
});

router.post('/', upload.array('files', 10), async (req, res) => {
    const code = req.body?.code;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    try {
		const { output, visualizations } = await executePythonJob({
            code,
            files: req.files || [],
        });
        res.json({ output, visualizations });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

module.exports = router;

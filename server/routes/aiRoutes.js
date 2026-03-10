const express = require('express');
const router = express.Router();
const { queryModel } = require('../utils/aiClient');

router.post('/', async (req, res) => {
  const { prompt, max_tokens = 512 } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  try {
    const response = await queryModel(prompt, { max_tokens });
    res.json({ result: response });
  } catch (err) {
    console.error('AI error', err);
    res.status(500).json({ error: err.message || 'AI request failed' });
  }
});

module.exports = router;

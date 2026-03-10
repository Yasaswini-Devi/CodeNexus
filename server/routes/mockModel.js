const express = require('express');
const router = express.Router();

// Simple mock model that returns heuristic responses for templates
router.post('/', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'missing prompt' });

  const lower = prompt.toLowerCase();
  let reply = '';

  if (lower.includes('explain')) {
    reply = 'MOCK: This code appears to perform X, Y, and Z. (This is a fake explanation.)';
  } else if (lower.includes('fix') || lower.includes('bug')) {
    reply = 'MOCK: I found potential issues: (1) ... (2) ...\nSuggested fix: adjust the logic at line N. (This is a fake fix.)';
  } else if (lower.includes('unit test') || lower.includes('pytest') || lower.includes('jest')) {
    reply = 'MOCK: Example tests:\n- test_example_1\n- test_example_2\n(This is a fake test scaffold.)';
  } else if (lower.includes('optimize') || lower.includes('performance')) {
    reply = 'MOCK: Consider using more efficient algorithms (O(n) instead of O(n^2)). Example improvement: ... (This is a fake suggestion.)';
  } else {
    reply = `MOCK echo: ${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}`;
  }

  // Return in a few possible shapes to exercise aiClient parsing
  return res.json({ result: reply, generated_text: reply });
});

module.exports = router;

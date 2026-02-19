const fetch = require('node-fetch');

// Queries an external model HTTP API. Configure MODEL_API_URL in .env
const MODEL_API_URL = process.env.MODEL_API_URL || '';

async function queryModel(prompt, opts = {}) {
  if (!MODEL_API_URL) throw new Error('MODEL_API_URL not configured in environment');

  // Build a flexible body: include both common fields used by different frontends
  const body = {
    prompt,
    model: process.env.OLLAMA_MODEL || 'llama2', // For Ollama
    max_tokens: opts.max_tokens || opts.max_new_tokens || 512,
    max_new_tokens: opts.max_new_tokens || opts.max_tokens || 512,
    stream: false, // Ollama: set to false for sync response
  };

  const resp = await fetch(MODEL_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Model responded ${resp.status}: ${text}`);
  }

  const json = await resp.json();

  // Try common response shapes (Ollama, text-generation-webui, huggingface endpoints, custom)
  if (typeof json === 'string') return json;
  if (json.response) return json.response; // Ollama response format
  if (json.output) return json.output;
  if (json.result) return json.result;
  if (json.generated_text) return json.generated_text;
  if (Array.isArray(json)) {
    // Some endpoints return an array of choices
    const joined = json.map((it) => it.generated_text || it.text || JSON.stringify(it)).join('\n');
    if (joined) return joined;
  }
  if (json.data && Array.isArray(json.data)) {
    return json.data.map((d) => d.generated_text || JSON.stringify(d)).join('\n');
  }

  // Fallback: stringify full JSON
  return JSON.stringify(json);
}

module.exports = { queryModel };

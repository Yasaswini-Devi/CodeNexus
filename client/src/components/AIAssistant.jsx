import React, { useEffect, useState } from 'react';
import './AIAssistant.css';

const TEMPLATES = [
  { id: 'explain', label: '💡 Explain code', template: 'Explain what the following code does in plain English:\n\n' },
  { id: 'fix', label: '🐛 Fix bugs', template: 'Find and fix bugs in the following code. Provide corrected code and a short explanation:\n\n' },
  { id: 'tests', label: '✅ Write unit tests', template: 'Write unit tests for the following code (using pytest for Python or Jest for JS):\n\n' },
  { id: 'opt', label: '⚡ Optimize', template: 'Optimize and improve performance for the following code. Explain changes and provide improved code:\n\n' },
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [resp, setResp] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('explain');
  const [maxTokens, setMaxTokens] = useState(512);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      setOpen(true);
      if (e && e.detail) {
        setPrompt((prev) => `// language: ${e.detail.language}\n\n` + (e.detail.code || ''));
      }
    };
    window.addEventListener('openAssistant', handler);
    return () => window.removeEventListener('openAssistant', handler);
  }, []);

  const applyTemplate = (tmplId) => {
    const tmpl = TEMPLATES.find((t) => t.id === tmplId);
    if (!tmpl) return;
    setSelectedTemplate(tmplId);
    
    setPrompt((p) => {
      // Extract the language header and code
      const languageMatch = p.match(/^\/\/ language: [^\n]+\n\n/);
      const languageHeader = languageMatch ? languageMatch[0] : '';
      const codeOnly = p.replace(/^\/\/ language: [^\n]+\n\n/, '');
      
      // Remove any existing template text from code
      let cleanCode = codeOnly;
      for (const t of TEMPLATES) {
        if (cleanCode.startsWith(t.template)) {
          cleanCode = cleanCode.substring(t.template.length);
          break;
        }
      }
      
      // Rebuild with new template
      return languageHeader + tmpl.template + cleanCode;
    });
  };

  const submit = async () => {
    setLoading(true);
    setResp('');
    try {
      const r = await fetch('http://localhost:5001/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, max_tokens: Number(maxTokens) }),
      });
      const j = await r.json();
      if (r.ok) setResp(j.result || j || JSON.stringify(j));
      else setResp(j.error || JSON.stringify(j));
    } catch (err) {
      setResp(String(err));
    }
    setLoading(false);
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(resp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  if (!open) return null;

  return (
    <div className="aiAssistantOverlay" onClick={() => setOpen(false)}>
      <div className="aiAssistantModal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="aiModalHeader">
          <div className="aiModalTitle">
            <span className="aiIcon">✨</span>
            <h2>AI Assistant</h2>
          </div>
          <button className="aiCloseBtn" onClick={() => setOpen(false)} title="Close">
            ✕
          </button>
        </div>

        {/* Template Selection */}
        <div className="aiTemplateSection">
          <label>Quick Actions:</label>
          <div className="aiTemplateGrid">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                className={`aiTemplateBtn ${selectedTemplate === tmpl.id ? 'active' : ''}`}
                onClick={() => applyTemplate(tmpl.id)}
                title={tmpl.label}
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="aiInputSection">
          <label>Your Code:</label>
          <textarea
            className="aiCodeInput"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste your code here..."
          />
        </div>

        {/* Controls */}
        <div className="aiControlsSection">
          <div className="aiTokenControl">
            <label htmlFor="maxTokens">Max Tokens:</label>
            <input
              id="maxTokens"
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              min="10"
              max="4096"
              className="aiTokenInput"
            />
          </div>
          <div className="aiActionButtons">
            <button
              className="aiBtn aiBtnPrimary"
              onClick={submit}
              disabled={loading || !prompt.trim()}
            >
              {loading ? '⏳ Thinking...' : '🚀 Ask AI'}
            </button>
            <button
              className="aiBtn aiBtnSecondary"
              onClick={() => setPrompt('')}
              disabled={!prompt.trim()}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="aiOutputSection">
          <div className="aiOutputHeader">
            <label>Response:</label>
            {resp && (
              <button
                className={`aiCopyBtn ${copied ? 'copied' : ''}`}
                onClick={copyResult}
                title="Copy to clipboard"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            )}
          </div>
          <div className="aiCodeOutput">
            {resp ? (
              <pre>{resp}</pre>
            ) : (
              <div className="aiEmptyState">
                <span>💭</span>
                <p>Your AI response will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

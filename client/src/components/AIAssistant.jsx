import React, { useEffect, useState } from 'react';

const TEMPLATES = [
  { id: 'explain', label: 'Explain code', template: 'Explain what the following code does in plain English:\n\n' },
  { id: 'fix', label: 'Fix bugs', template: 'Find and fix bugs in the following code. Provide corrected code and a short explanation:\n\n' },
  { id: 'tests', label: 'Write unit tests', template: 'Write unit tests for the following code (using pytest for Python or Jest for JS):\n\n' },
  { id: 'opt', label: 'Optimize', template: 'Optimize and improve performance for the following code. Explain changes and provide improved code:\n\n' },
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [resp, setResp] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('explain');
  const [maxTokens, setMaxTokens] = useState(512);

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
    // Prepend template to the existing content if not already present
    setPrompt((p) => (p.startsWith(tmpl.template) ? p : tmpl.template + p));
  };

  const submit = async () => {
    setLoading(true);
    setResp('');
    try {
      const r = await fetch('http://localhost:5000/ai', {
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
    } catch (e) {
      // ignore
    }
  };

  if (!open) return null;

  return (
    <div className="aiModal" style={{position:'fixed',right:20,top:60,width:480,height:560,background:'#111',color:'#eee',border:'1px solid #333',padding:12,zIndex:9999}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <strong>AI Assistant</strong>
        <div>
          <select value={selectedTemplate} onChange={(e)=>applyTemplate(e.target.value)}>
            {TEMPLATES.map(t=> <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <input style={{width:80,marginLeft:8}} type="number" value={maxTokens} onChange={(e)=>setMaxTokens(e.target.value)} />
          <button onClick={()=>{setOpen(false)}} style={{marginLeft:8}}>Close</button>
        </div>
      </div>
      <textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} style={{width:'100%',height:200,marginTop:8,background:'#000',color:'#fff'}} />
      <div style={{marginTop:8,display:'flex',gap:8}}>
        <button onClick={submit} disabled={loading}>{loading? 'Thinking...' : 'Ask Model'}</button>
        <button onClick={()=>{setPrompt('')}}>Clear</button>
        <button onClick={()=>applyTemplate(selectedTemplate)}>Apply Template</button>
        <button onClick={copyResult} disabled={!resp}>Copy Result</button>
      </div>
      <div style={{marginTop:12,overflowY:'auto',height:260,background:'#0b0b0b',padding:8}}>
        <pre style={{whiteSpace:'pre-wrap',color:'#dfe'}}>{resp}</pre>
      </div>
    </div>
  );
}

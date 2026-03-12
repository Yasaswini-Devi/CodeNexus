import React, { useEffect, useState } from 'react';
import LangList from './LangList';
import { toast } from 'react-hot-toast';
import CodeEditor from './CodeEditor';
import { useSaveProject } from '../hooks/useSaveProject';

function Python() {

  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [visualizations, setVisualizations] = useState([]);
  const { saveProject, saving, loadedCode, projectTitle, setProjectTitle } = useSaveProject({ code, language: 'python' });

  useEffect(() => { if (loadedCode !== null) setCode(loadedCode); }, [loadedCode]);

  const handleSubmit = async () => {
    toast.loading('Please Wait while File is Executing.');
    const payload = { language: "py", code };

    try {
      const response = await fetch("http://localhost:5001/runpy", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        toast.remove();
        setOutput(data.output);
        setVisualizations(data.visualizations || []);
        toast.success("Executed Successfully.");
      } else {
        setOutput(data.error || "Error occurred");
        toast.remove();
        toast.error("Execution Failed");
      }
    } catch (err) {
      toast.remove();
      setOutput("Error in communication with server");
    }
  };

  const handleShare = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "python" }),
      });
      const data = await response.json();
      const shareLink = `${window.location.origin}/share/${data.id}`;
      await navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied!");
    } catch (err) {
      console.error(err);
      toast.error("Sharing failed");
    }
  };

  const clear = () => {
    toast.success('Output Cleared');
    setOutput('');
    setVisualizations([]);
  };

  const copyContent = () => {
    toast.success("Copied");
    navigator.clipboard.writeText(code);
  };

  const codeToFile = () => {
    toast.success('File is Downloading...');
    const blob = new Blob([code], { type: "text/python" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "codofile-python.py";
    link.click();
  };

  return (
    <>
      <div className="voiceContainer">
        <div className="voiceBody wholeeditorBody">
          <div className="leftLang">
            <LangList leftcolorpy="white" />
          </div>
          <div className="PlaygroundMain">
            <div className='runHeaderJS'>
              <div className='jsleftheaderfile jsfile'>
                <mark>
                  <input
                    type="text"
                    className="projectTitleInput"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Project Name..."
                  />
                </mark>
                <div className='runbtn'>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className='copyDownloadBtn' title='Copy code' onClick={copyContent}>📋 Copy</button>
                    <button className='copyDownloadBtn' title='Download code' onClick={codeToFile}>⬇️ Download</button>
                    <button className='copyDownloadBtn' title='Share code' onClick={handleShare}>🔗 Share</button>
                    <button className='copyDownloadBtn saveBtn' title='Save project' onClick={() => saveProject(code)} disabled={saving}>{saving ? '…' : '💾 Save'}</button>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button className='btn' onClick={handleSubmit}>RUN</button>
                    <button className='vbtn' onClick={() => { window.dispatchEvent(new CustomEvent('openAssistant', { detail: { code, language: 'python' } })) }}>AI Assist</button>
                  </div>
                </div>
              </div>
              <div className='jsrightheaderfile jsfile'>
                <mark><p>OUTPUT</p></mark>
                <button className='clear' onClick={clear}>Clear</button>
              </div>
            </div>
            <div className='jsplayground playground'>
              <div className='leftplayground snippet'>
                <div className='editor-wrapper'>
                  <CodeEditor language="python" value={code} onChange={setCode} />
                </div>
              </div>
              <h1 className="invisible"><mark>Output</mark></h1>
              <div className='rightplayground snippet' id='consoleOutput'>
                <p>{output}</p>
                {visualizations && visualizations.map((viz, i) => (
                  <div key={i} style={{ marginTop: '12px' }}>
                    <img
                      src={viz.dataUrl}
                      alt={viz.name}
                      style={{ maxWidth: '100%', borderRadius: '8px' }}
                    />
                    <a href={viz.dataUrl} download={viz.name}>
                      <button className='copyDownloadBtn' style={{ marginTop: '8px' }}>
                        ⬇️ Download Plot
                      </button>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Python;

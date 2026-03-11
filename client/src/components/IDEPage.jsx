import React, { useState } from 'react';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';
import LangList from './LangList';
import { toast } from 'react-hot-toast';
import { VscTrash } from 'react-icons/vsc';

export default function IDEPage() {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [output, setOutput] = useState(""); 
  const [showPreview, setShowPreview] = useState(false);

  // ... (handleOpenFolder code remains the same) ...
  const handleOpenFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      toast.loading("Loading folder...");
      const fileTree = await buildFileTree(dirHandle);
      setFiles(fileTree);
      toast.dismiss();
      toast.success(`Opened: ${dirHandle.name}`);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        toast.error("Failed to open folder.");
      }
    }
  };

  const buildFileTree = async (dirHandle) => {
    const entries = [];
    for await (const entry of dirHandle.values()) {
      const id = crypto.randomUUID();
      if (entry.kind === 'file') {
        entries.push({ id, name: entry.name, isFolder: false, kind: 'file', handle: entry, language: detectLanguage(entry.name) });
      } else if (entry.kind === 'directory') {
        entries.push({ id, name: entry.name, isFolder: true, kind: 'directory', handle: entry, items: await buildFileTree(entry) });
      }
    }
    return entries.sort((a,b) => (a.isFolder === b.isFolder ? 0 : a.isFolder ? -1 : 1));
  };

  // ... (handleSelectFile code remains the same) ...
  const handleSelectFile = async (fileNode) => {
    if (fileNode.isFolder) return;
    setOutput("");
    setShowPreview(false);
    let content = fileNode.content || '';
    if (fileNode.handle && !fileNode.contentLoaded) {
      try {
        const file = await fileNode.handle.getFile();
        content = await file.text();
        fileNode.content = content; 
        fileNode.contentLoaded = true;
      } catch (e) {
        toast.error("Could not read file");
      }
    }
    setActiveFile({ ...fileNode, content });
  };

  // ... (Create File/Folder Logic remains the same) ...
  const handleCreateFile = () => {
    const name = prompt("Enter file name (e.g. script.js):");
    if (!name) return;
    const newFile = { id: crypto.randomUUID(), name, isFolder: false, content: "", language: detectLanguage(name) };
    setFiles(prev => [...prev, newFile]);
    setActiveFile(newFile);
  };

  const handleCreateFolder = () => {
    const name = prompt("Enter folder name:");
    if (!name) return;
    const newFolder = { id: crypto.randomUUID(), name, isFolder: true, items: [] };
    setFiles(prev => [newFolder, ...prev]);
  };

  const handleCodeChange = (newContent) => {
    setActiveFile(prev => ({ ...prev, content: newContent }));
  };

  // ✅ UPDATED DELETE FUNCTION: Works for both Tab and Sidebar
  const handleDelete = (targetNode = activeFile) => {
    if (!targetNode) return;
    if (!window.confirm(`Delete ${targetNode.name}?`)) return;

    const deleteNodeRecursive = (nodes) => {
        return nodes.filter(node => {
            if (node.id === targetNode.id) return false;
            if (node.items) node.items = deleteNodeRecursive(node.items);
            return true;
        });
    };

    setFiles(prev => deleteNodeRecursive(prev));
    if (activeFile && targetNode.id === activeFile.id) {
        setActiveFile(null);
    }
    toast.success("Deleted");
  };

  // ✅ UPDATED RUN: Captures JS Console Logic
  const handleRun = async () => {
    if(!activeFile) return;

    if(activeFile.language === 'python') {
        setShowPreview(false);
        toast.loading('Running Python...');
        try {
            const res = await fetch("http://localhost:5001/runpy", {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: activeFile.content })
            });
            const data = await res.json();
            toast.dismiss();
            
            if(data.error) {
                 setOutput(`ERROR:\n${data.error}`);
                 toast.error("Execution Failed");
            } else {
                 setOutput(data.output);
                 toast.success('Executed!');
            }
        } catch(e) {
            toast.dismiss();
            setOutput("Backend error. Is server running on port 5001?");
        }
    } 
    else if (activeFile.language === 'html' || activeFile.language === 'javascript') {
        setShowPreview(true);
        toast.success("Drafting Live Preview...");
    }
  };

  // HTML/JS Preview Generation with Console Capture
  const getPreviewContent = () => {
    if (activeFile.language === 'javascript') {
        return `
        <html>
            <body style="font-family: sans-serif; padding: 10px;">
                <h4>JS Output:</h4>
                <div id="output"></div>
                <script>
                    const outputDiv = document.getElementById('output');
                    // Override console.log to print to screen
                    const oldLog = console.log;
                    console.log = function(...args) {
                        const msg = args.map(arg => 
                            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                        ).join(' ');
                        const p = document.createElement('div');
                        p.textContent = '> ' + msg;
                        p.style.fontFamily = 'monospace';
                        p.style.borderBottom = '1px solid #eee';
                        outputDiv.appendChild(p);
                        oldLog.apply(console, args);
                    };
                    
                    try {
                        ${activeFile.content}
                    } catch(e) {
                         outputDiv.innerHTML += '<div style="color:red">Error: ' + e.message + '</div>';
                    }
                </script>
            </body>
        </html>`;
    }
    return activeFile.content; // HTML files
  };


  return (
    <div className="wholeeditorBody">
      <div className="leftLang"><LangList /></div>

      <div className="ideSidebar">
        <FileExplorer 
          files={files} 
          onSelectFile={handleSelectFile} 
          activeFile={activeFile}
          onOpenFolder={handleOpenFolder}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
          onDeleteItem={handleDelete} // ✅ Connected sidebar delete
        />
      </div>

      <div className="ideMain">
        {activeFile ? (
            <>
                <div className="editorTabs">
                    <div className={`tab active`}>
                        {getFileIcon(activeFile.name)} 
                        <span>{activeFile.name}</span>
                    </div>
                    <div className="tabActions">
                        <button onClick={() => handleDelete(activeFile)} className="ideIconBtn danger" title="Delete">
                            <VscTrash />
                        </button>
                        <button onClick={handleRun} className="ideRunBtn">▶ Run</button>
                    </div>
                </div>

                <div className="ideSplitView" style={{display: 'flex', height: '100%'}}>
                    <div className="editorWrapper" style={{flex: 1}}>
                        {/* ✅ IntelliSense is enabled by default in Monaco */}
                        <CodeEditor 
                            language={activeFile.language || 'javascript'}
                            value={activeFile.content}
                            onChange={handleCodeChange}
                        />
                    </div>

                    {(output || showPreview) && (
                        <div className="ideOutputPanel" style={{width: '40%', borderLeft: '1px solid #333', background: '#1e1e1e', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
                             <div style={{padding: '5px 10px', background: '#252526', borderBottom: '1px solid #333', fontSize: '0.8rem', fontWeight: 'bold'}}>
                                 {showPreview ? "PREVIEW / CONSOLE" : "OUTPUT"}
                                 <button style={{float:'right', background:'none', border:'none', color:'#ccc', cursor:'pointer'}} onClick={()=>{setOutput(""); setShowPreview(false)}}>✕</button>
                             </div>
                             
                             {showPreview ? (
                                <iframe 
                                    title="preview"
                                    style={{width: '100%', height: '100%', background: 'white', border: 'none'}}
                                    srcDoc={getPreviewContent()} 
                                />
                             ) : (
                                <pre style={{padding: '10px', color: '#fff', overflow: 'auto', margin: 0}}>{output}</pre>
                             )}
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="aiEmptyState"><p>Select a file to start coding</p></div>
        )}
      </div>
    </div>
  );
}

// Helpers
const detectLanguage = (name) => {
    if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript';
    if (name.endsWith('.py')) return 'python';
    if (name.endsWith('.html')) return 'html';
    if (name.endsWith('.css')) return 'css';
    return 'javascript';
};

const getFileIcon = (name) => {
  if (name.includes('js')) return '🟨';
  if (name.includes('py')) return '🟦';
  if (name.includes('html')) return '🟧';
  if (name.includes('css')) return '🎨';
  return '📄';
};
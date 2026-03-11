import React, { useEffect, useRef, useState } from 'react';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';
import LangList from './LangList';
import { toast } from 'react-hot-toast';
import { VscTrash } from 'react-icons/vsc';
import { useAuth } from '../context/AuthContext';

const PROJECTS_API = 'http://localhost:5001/api/projects';

export default function IDEPage() {
  const { token, user } = useAuth();
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [output, setOutput] = useState(""); 
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState(null);
  const [projectTitle, setProjectTitle] = useState('IDE Workspace');
  const initializedRef = useRef(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!token) {
        setFiles([]);
        setActiveFile(null);
        setLoading(false);
        initializedRef.current = false;
        setProjectId(null);
        return;
      }

      try {
        setLoading(true);
        const raw = sessionStorage.getItem('cn_load_ide_project');
        let targetProjectId = null;
        if (raw) {
          try {
            targetProjectId = JSON.parse(raw)?.id || null;
          } catch {
            targetProjectId = null;
          }
          sessionStorage.removeItem('cn_load_ide_project');
        }

        if (!targetProjectId) {
          const resList = await fetch(`${PROJECTS_API}?t=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          });
          const listData = await resList.json();
          if (resList.ok) {
            const latestIdeProject = (listData.projects || []).find((project) => project.language === 'ide');
            targetProjectId = latestIdeProject?._id || null;
          }
        }

        if (!targetProjectId) {
          setFiles([]);
          setActiveFile(null);
          setProjectId(null);
          setProjectTitle('IDE Workspace');
          initializedRef.current = true;
          return;
        }

        const res = await fetch(`${PROJECTS_API}/${targetProjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load IDE project');

        const project = data.project;
        const tree = Array.isArray(project?.tree) ? project.tree : [];
        setFiles(tree);
        setProjectId(project?._id || null);
        setProjectTitle(project?.title || 'IDE Workspace');

        const selected = project?.activeFileId ? findNodeById(tree, project.activeFileId) : null;
        setActiveFile(selected && !selected.isFolder ? selected : null);

        initializedRef.current = true;
      } catch (err) {
        toast.error(err.message || 'Could not load IDE project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [token]);

  useEffect(() => {
    if (!token || !initializedRef.current) return;

    const timer = setTimeout(async () => {
      try {
        if (files.length === 0 && !projectId) return;

        if (projectId) {
          await fetch(`${PROJECTS_API}/${projectId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: projectTitle,
              tree: files,
              activeFileId: activeFile?.id || null,
              language: 'ide',
            }),
          });
          return;
        }

        const titleFromTree = files[0]?.name ? `${files[0].name}` : `IDE Workspace - ${new Date().toLocaleDateString('en-IN')}`;
        const res = await fetch(PROJECTS_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: titleFromTree,
            language: 'ide',
            tree: files,
            activeFileId: activeFile?.id || null,
          }),
        });
        const data = await res.json();
        if (res.ok && data.project) {
          setProjectId(data.project._id);
          setProjectTitle(data.project.title || titleFromTree);
        }
      } catch {
        toast.error('Failed to autosave IDE project');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [files, activeFile?.id, token, projectId, projectTitle]);

  const handleOpenFolder = async () => {
    if (!user || !token) {
      toast.error('Please sign in to use cloud autosave');
      return;
    }

    try {
      const dirHandle = await window.showDirectoryPicker();
      toast.loading('Loading local folder...');
      const tree = await buildFileTree(dirHandle);
      const sortedTree = sortTree(tree);
      setProjectId(null);
      setFiles(sortedTree);
      setActiveFile(findFirstFile(sortedTree));
      setProjectTitle(dirHandle.name || 'IDE Workspace');
      toast.dismiss();
      toast.success(`Opened ${dirHandle.name} and autosaving to cloud`);
    } catch (err) {
      toast.dismiss();
      if (err.name !== 'AbortError') {
        toast.error('Failed to open local folder');
      }
    }
  };

  const handleSelectFile = async (fileNode) => {
    if (fileNode.isFolder) return;
    setOutput("");
    setShowPreview(false);
    setActiveFile({ ...fileNode, content: fileNode.content || '' });
  };

  const handleCreateFile = () => {
    if (!user || !token) {
      toast.error('Please sign in to use cloud workspace');
      return;
    }
    const name = prompt("Enter file name (e.g. script.js):");
    if (!name) return;
    const newFile = { id: crypto.randomUUID(), name, isFolder: false, content: "", language: detectLanguage(name) };
    setFiles(prev => [...prev, newFile]);
    setActiveFile(newFile);
  };

  const handleCreateFolder = () => {
    if (!user || !token) {
      toast.error('Please sign in to use cloud workspace');
      return;
    }
    const name = prompt("Enter folder name:");
    if (!name) return;
    const newFolder = { id: crypto.randomUUID(), name, isFolder: true, items: [] };
    setFiles(prev => [newFolder, ...prev]);
  };

  const handleCodeChange = (newContent) => {
    setActiveFile(prev => {
      if (!prev) return prev;
      return { ...prev, content: newContent };
    });

    setFiles(prev => updateNodeById(prev, activeFile?.id, (node) => ({
      ...node,
      content: newContent,
      language: node.language || detectLanguage(node.name),
    })));
  };

  const handleDelete = (targetNode = activeFile) => {
    if (!targetNode) return;
    if (!window.confirm(`Delete ${targetNode.name}?`)) return;

    setFiles(prev => deleteNodeRecursive(prev, targetNode.id));
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
          onDeleteItem={handleDelete}
        />
      </div>

      <div className="ideMain">
        {loading ? (
          <div className="aiEmptyState"><p>Loading cloud workspace...</p></div>
        ) : !token ? (
          <div className="aiEmptyState"><p>Sign in to access your cloud workspace</p></div>
        ) : activeFile ? (
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
            <div className="aiEmptyState"><p>Create or select a file to start coding</p></div>
        )}
      </div>
    </div>
  );
}

const findNodeById = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.isFolder && Array.isArray(node.items)) {
      const found = findNodeById(node.items, id);
      if (found) return found;
    }
  }
  return null;
};

const updateNodeById = (nodes, id, updater) => {
  if (!id) return nodes;
  return nodes.map((node) => {
    if (node.id === id) return updater(node);
    if (node.isFolder && Array.isArray(node.items)) {
      return { ...node, items: updateNodeById(node.items, id, updater) };
    }
    return node;
  });
};

const deleteNodeRecursive = (nodes, targetId) => {
  return nodes
    .filter((node) => node.id !== targetId)
    .map((node) => {
      if (node.isFolder && Array.isArray(node.items)) {
        return { ...node, items: deleteNodeRecursive(node.items, targetId) };
      }
      return node;
    });
};

const buildFileTree = async (dirHandle) => {
  const entries = [];
  for await (const entry of dirHandle.values()) {
    const id = crypto.randomUUID();
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      const content = await file.text();
      entries.push({
        id,
        name: entry.name,
        isFolder: false,
        content,
        language: detectLanguage(entry.name),
      });
    } else if (entry.kind === 'directory') {
      entries.push({
        id,
        name: entry.name,
        isFolder: true,
        items: await buildFileTree(entry),
      });
    }
  }
  return entries;
};

const sortTree = (nodes) => {
  return [...nodes]
    .map((node) => {
      if (node.isFolder && Array.isArray(node.items)) {
        return { ...node, items: sortTree(node.items) };
      }
      return node;
    })
    .sort((a, b) => {
      if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
      return a.isFolder ? -1 : 1;
    });
};

const findFirstFile = (nodes) => {
  for (const node of nodes) {
    if (!node.isFolder) return node;
    if (node.isFolder && Array.isArray(node.items)) {
      const child = findFirstFile(node.items);
      if (child) return child;
    }
  }
  return null;
};

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
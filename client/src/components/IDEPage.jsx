import React, { useCallback, useEffect, useRef, useState } from 'react';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';
import LangList from './LangList';
import { toast } from 'react-hot-toast';
import { VscClose, VscTrash } from 'react-icons/vsc';
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
  const [openTabIds, setOpenTabIds] = useState([]);
  const [dirtyFileIds, setDirtyFileIds] = useState([]);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
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
          setOpenTabIds([]);
          setDirtyFileIds([]);
          setSyncStatus('synced');
          setSelectedNodeId(null);
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
        setOpenTabIds(selected && !selected.isFolder ? [selected.id] : []);
        setDirtyFileIds([]);
        setSyncStatus('synced');
        setSelectedNodeId(selected?.id || null);

        initializedRef.current = true;
      } catch (err) {
        toast.error(err.message || 'Could not load IDE project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [token]);

  const saveWorkspace = useCallback(async () => {
    if (!token || !initializedRef.current) return false;

    try {
      if (files.length === 0 && !projectId) {
        setSyncStatus('synced');
        return true;
      }

      setSyncStatus('saving');

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
        setDirtyFileIds([]);
        setSyncStatus('synced');
        return true;
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
      setDirtyFileIds([]);
      setSyncStatus('synced');
      return true;
    } catch {
      setSyncStatus('error');
      return false;
    }
  }, [token, files, projectId, projectTitle, activeFile?.id]);

  useEffect(() => {
    if (!token || !initializedRef.current) return;

    const timer = setTimeout(async () => {
      const ok = await saveWorkspace();
      if (!ok) {
        toast.error('Failed to autosave IDE project');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [files, activeFile?.id, token, projectId, projectTitle, saveWorkspace]);

  useEffect(() => {
    const onKeyDown = async (event) => {
      const isMetaSave = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
      const isMetaClose = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'w';

      if (isMetaSave) {
        event.preventDefault();
        const ok = await saveWorkspace();
        if (ok) toast.success('Saved');
        else toast.error('Save failed');
      }

      if (isMetaClose && activeFile) {
        event.preventDefault();
        handleCloseTab(activeFile.id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeFile, saveWorkspace]);

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
      const firstFile = findFirstFile(sortedTree);
      setActiveFile(firstFile);
      setOpenTabIds(firstFile ? [firstFile.id] : []);
      setDirtyFileIds([]);
      setSyncStatus('saving');
      setSelectedNodeId(firstFile?.id || null);
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

  const handleSelectNode = async (node) => {
    setSelectedNodeId(node.id);
    if (node.isFolder) return;

    setOutput("");
    setShowPreview(false);
    setActiveFile({ ...node, content: node.content || '' });
    setOpenTabIds(prev => (prev.includes(node.id) ? prev : [...prev, node.id]));
  };

  const getSelectedFolder = () => {
    const selectedNode = selectedNodeId ? findNodeById(files, selectedNodeId) : null;
    return selectedNode?.isFolder ? selectedNode : null;
  };

  const handleCreateFile = (targetFolder = null) => {
    if (!user || !token) {
      toast.error('Please sign in to use cloud workspace');
      return;
    }
    const name = prompt("Enter file name (e.g. script.js):");
    if (!name) return;
    const newFile = { id: crypto.randomUUID(), name, isFolder: false, content: "", language: detectLanguage(name) };
    setFiles(prev => addNodeToFolder(prev, targetFolder?.id || null, newFile));
    setActiveFile(newFile);
    setSelectedNodeId(newFile.id);
    setOpenTabIds(prev => (prev.includes(newFile.id) ? prev : [...prev, newFile.id]));
    setDirtyFileIds(prev => (prev.includes(newFile.id) ? prev : [...prev, newFile.id]));
    setSyncStatus('saving');
  };

  const handleCreateFolder = (targetFolder = null) => {
    if (!user || !token) {
      toast.error('Please sign in to use cloud workspace');
      return;
    }
    const name = prompt("Enter folder name:");
    if (!name) return;
    const newFolder = { id: crypto.randomUUID(), name, isFolder: true, items: [] };
    setFiles(prev => addNodeToFolder(prev, targetFolder?.id || null, newFolder));
    setSelectedNodeId(newFolder.id);
    setSyncStatus('saving');
  };

  const handleCodeChange = (newContent) => {
    const activeId = activeFile?.id;
    if (!activeId) return;

    setActiveFile(prev => {
      if (!prev) return prev;
      return { ...prev, content: newContent };
    });

    setFiles(prev => updateNodeById(prev, activeId, (node) => ({
      ...node,
      content: newContent,
      language: node.language || detectLanguage(node.name),
    })));
    setDirtyFileIds(prev => (prev.includes(activeId) ? prev : [...prev, activeId]));
    setSyncStatus('saving');
  };

  const handleRename = (targetNode) => {
    if (!targetNode) return;
    const nextName = prompt('Rename to:', targetNode.name);
    if (!nextName || nextName === targetNode.name) return;

    setFiles(prev => updateNodeById(prev, targetNode.id, (node) => ({
      ...node,
      name: nextName,
      ...(node.isFolder ? {} : { language: detectLanguage(nextName) }),
    })));

    if (activeFile?.id === targetNode.id) {
      setActiveFile(prev => prev ? ({
        ...prev,
        name: nextName,
        language: detectLanguage(nextName),
      }) : prev);
    }

    if (selectedNodeId === targetNode.id) {
      setSelectedNodeId(targetNode.id);
    }

    if (!targetNode.isFolder) {
      setDirtyFileIds(prev => (prev.includes(targetNode.id) ? prev : [...prev, targetNode.id]));
    }
    setSyncStatus('saving');
    toast.success('Renamed');
  };

  const handleCloseTab = (fileId) => {
    const isActiveClosing = activeFile?.id === fileId;

    setOpenTabIds(prev => {
      const remaining = prev.filter((id) => id !== fileId);
      if (isActiveClosing) {
        const nextId = remaining[remaining.length - 1];
        const nextNode = nextId ? findNodeById(files, nextId) : null;
        setActiveFile(nextNode && !nextNode.isFolder ? { ...nextNode, content: nextNode.content || '' } : null);
        setSelectedNodeId(nextNode?.id || null);
      }
      return remaining;
    });
  };

  const handleDelete = (targetNode = activeFile) => {
    if (!targetNode) return;
    if (!window.confirm(`Delete ${targetNode.name}?`)) return;

    setFiles(prev => deleteNodeRecursive(prev, targetNode.id));
    setOpenTabIds(prev => prev.filter((id) => id !== targetNode.id));
    setDirtyFileIds(prev => prev.filter((id) => id !== targetNode.id));
    if (selectedNodeId === targetNode.id) {
      setSelectedNodeId(null);
    }
    if (activeFile && targetNode.id === activeFile.id) {
        setActiveFile(null);
    }
    setSyncStatus('saving');
    toast.success("Deleted");
  };

  const openTabs = openTabIds
    .map((id) => findNodeById(files, id))
    .filter((node) => node && !node.isFolder);

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
          onSelectFile={handleSelectNode} 
          activeFile={activeFile}
          selectedNodeId={selectedNodeId}
          onOpenFolder={handleOpenFolder}
          onCreateFile={() => handleCreateFile(getSelectedFolder())}
          onCreateFolder={() => handleCreateFolder(getSelectedFolder())}
          onDeleteItem={handleDelete}
          onRenameItem={handleRename}
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
                    {openTabs.map((tabFile) => {
                      const isActive = activeFile?.id === tabFile.id;
                      const isDirty = dirtyFileIds.includes(tabFile.id);
                      return (
                        <div
                          key={tabFile.id}
                          className={`tab ${isActive ? 'active' : ''}`}
                          onClick={() => handleSelectNode(tabFile)}
                        >
                          {getFileIcon(tabFile.name)}
                          <span>{tabFile.name}</span>
                          {isDirty && <span className="tabDirtyDot">●</span>}
                          <button
                            className="tabCloseBtn"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCloseTab(tabFile.id);
                            }}
                            title="Close"
                          >
                            <VscClose />
                          </button>
                        </div>
                      );
                    })}
                    <div className="tabActions">
                        <span className={`syncBadge sync-${syncStatus}`}>
                          {syncStatus === 'saving' ? 'Saving...' : syncStatus === 'error' ? 'Save error' : 'Synced'}
                        </span>
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

const addNodeToFolder = (nodes, folderId, newNode) => {
  if (!folderId) {
    return sortTree([newNode, ...nodes]);
  }

  return nodes.map((node) => {
    if (node.id === folderId && node.isFolder) {
      return {
        ...node,
        items: sortTree([...(node.items || []), newNode]),
      };
    }

    if (node.isFolder && Array.isArray(node.items)) {
      return {
        ...node,
        items: addNodeToFolder(node.items, folderId, newNode),
      };
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
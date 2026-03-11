import React, { useState } from 'react';
import { VscChevronRight, VscChevronDown, VscNewFile, VscNewFolder, VscFolderOpened, VscTrash } from 'react-icons/vsc';
import { DiJavascript1, DiPython, DiHtml5, DiCss3 } from 'react-icons/di';
import { FaFile } from 'react-icons/fa';

const getFileIcon = (name) => {
  if (name.endsWith('.js') || name.endsWith('.jsx')) return <DiJavascript1 color="#f1e05a" />;
  if (name.endsWith('.py')) return <DiPython color="#3776ab" />;
  if (name.endsWith('.html')) return <DiHtml5 color="#e34c26" />;
  if (name.endsWith('.css')) return <DiCss3 color="#563d7c" />;
  return <FaFile color="#ccc" size={12} />;
};

const FileNode = ({ node, depth, onSelect, activeId, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const style = { paddingLeft: `${depth * 15 + 10}px` };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent opening the file when clicking delete
    onDelete(node);
  };

  if (node.isFolder) {
    return (
      <div>
        <div className="explorerItem folder" style={style} onClick={() => setIsOpen(!isOpen)}>
          <span className="arrow">{isOpen ? <VscChevronDown /> : <VscChevronRight />}</span>
          <span className="folderName">{node.name}</span>
          {/* Delete Icon for Folders */}
          <button className="explorerDeleteBtn" onClick={handleDeleteClick}><VscTrash /></button>
        </div>
        {isOpen && (
          <div className="folderContent">
            {node.items.map((child) => (
              <FileNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} activeId={activeId} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`explorerItem file ${activeId === node.id ? 'active' : ''}`} style={style} onClick={() => onSelect(node)}>
      <span className="fileIcon">{getFileIcon(node.name)}</span>
      <span className="fileName">{node.name}</span>
      {/* Delete Icon for Files */}
      <button className="explorerDeleteBtn" onClick={handleDeleteClick}><VscTrash /></button>
    </div>
  );
};

export default function FileExplorer({ files, onSelectFile, activeFile, onOpenFolder, onCreateFile, onCreateFolder, onDeleteItem }) {
  return (
    <div className="fileExplorer">
      <div className="explorerHeader">
        <span>EXPLORER</span>
        <div className="explorerActions">
          <VscNewFile title="New File" onClick={onCreateFile} />
          <VscNewFolder title="New Folder" onClick={onCreateFolder} />
          <VscFolderOpened title="Open Local Folder" onClick={onOpenFolder} />
        </div>
      </div>
      <div className="explorerTree">
        {files.length === 0 ? (
            <div style={{padding: '20px', textAlign: 'center', color: '#666', fontSize: '0.8rem'}}>
                No folder open.<br/>Click <VscFolderOpened style={{verticalAlign: 'middle'}}/> to open.
            </div>
        ) : (
            files.map((node) => (
            <FileNode 
                key={node.id} 
                node={node} 
                depth={0} 
                onSelect={onSelectFile} 
                activeId={activeFile?.id}
                onDelete={onDeleteItem}
            />
            ))
        )}
      </div>
    </div>
  );
}
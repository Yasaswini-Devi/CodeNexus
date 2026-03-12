import React, { useEffect, useState } from 'react';
import { VscChevronRight, VscChevronDown, VscEdit, VscNewFile, VscNewFolder, VscFolderOpened, VscTrash } from 'react-icons/vsc';
import { DiJavascript1, DiPython, DiHtml5, DiCss3 } from 'react-icons/di';
import { FaFile } from 'react-icons/fa';

const getFileIcon = (name) => {
  if (name.endsWith('.js') || name.endsWith('.jsx')) return <DiJavascript1 color="#f1e05a" />;
  if (name.endsWith('.py')) return <DiPython color="#3776ab" />;
  if (name.endsWith('.html')) return <DiHtml5 color="#e34c26" />;
  if (name.endsWith('.css')) return <DiCss3 color="#563d7c" />;
  return <FaFile color="#ccc" size={12} />;
};

const FileNode = ({ node, depth, onSelect, selectedNodeId, onDelete, onRename, onContextMenu, parentNode = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const style = { paddingLeft: `${depth * 15 + 10}px` };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent opening the file when clicking delete
    onDelete(node);
  };

  const handleRenameClick = (e) => {
    e.stopPropagation();
    onRename(node);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu(e, node, parentNode);
  };

  if (node.isFolder) {
    return (
      <div>
        <div className={`explorerItem folder ${selectedNodeId === node.id ? 'active' : ''}`} style={style} onClick={() => {
          onSelect(node);
          setIsOpen(!isOpen);
        }} onContextMenu={handleContextMenu}>
          <span className="arrow">{isOpen ? <VscChevronDown /> : <VscChevronRight />}</span>
          <span className="folderName">{node.name}</span>
          <button className="explorerDeleteBtn" onClick={handleRenameClick}><VscEdit /></button>
          {/* Delete Icon for Folders */}
          <button className="explorerDeleteBtn" onClick={handleDeleteClick}><VscTrash /></button>
        </div>
        {isOpen && (
          <div className="folderContent">
            {node.items.map((child) => (
              <FileNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} selectedNodeId={selectedNodeId} onDelete={onDelete} onRename={onRename} onContextMenu={onContextMenu} parentNode={node} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`explorerItem file ${selectedNodeId === node.id ? 'active' : ''}`} style={style} onClick={() => onSelect(node)} onContextMenu={handleContextMenu}>
      <span className="fileIcon">{getFileIcon(node.name)}</span>
      <span className="fileName">{node.name}</span>
      <button className="explorerDeleteBtn" onClick={handleRenameClick}><VscEdit /></button>
      {/* Delete Icon for Files */}
      <button className="explorerDeleteBtn" onClick={handleDeleteClick}><VscTrash /></button>
    </div>
  );
};

export default function FileExplorer({ files, onSelectFile, selectedNodeId, onOpenFolder, onCreateFile, onCreateFolder, onDeleteItem, onRenameItem }) {
  const [menuState, setMenuState] = useState(null);

  useEffect(() => {
    if (!menuState) return;

    const closeMenu = () => setMenuState(null);
    window.addEventListener('click', closeMenu);
    window.addEventListener('blur', closeMenu);

    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('blur', closeMenu);
    };
  }, [menuState]);

  const openContextMenu = (event, node = null, parentNode = null) => {
    setMenuState({
      x: event.clientX,
      y: event.clientY,
      node,
      parentNode,
    });
  };

  const closeContextMenu = () => setMenuState(null);

  const handleMenuAction = (action) => {
    const node = menuState?.node || null;
    const parentNode = menuState?.parentNode || null;

    if (action === 'newFile') {
      onCreateFile(node?.isFolder ? node : parentNode);
    }
    if (action === 'newFolder') {
      onCreateFolder(node?.isFolder ? node : parentNode);
    }
    if (action === 'rename' && node) {
      onRenameItem(node);
    }
    if (action === 'delete' && node) {
      onDeleteItem(node);
    }
    if (action === 'openFolder') {
      onOpenFolder();
    }

    closeContextMenu();
  };

  const menuItems = menuState?.node
    ? [
        ...(menuState.node.isFolder ? [
          { key: 'newFile', label: 'New File' },
          { key: 'newFolder', label: 'New Folder' },
        ] : []),
        { key: 'rename', label: 'Rename' },
        { key: 'delete', label: 'Delete' },
      ]
    : [
        { key: 'newFile', label: 'New File' },
        { key: 'newFolder', label: 'New Folder' },
        { key: 'openFolder', label: 'Open Local Folder' },
      ];

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
      <div className="explorerTree" onContextMenu={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          openContextMenu(e, null, null);
        }
      }}>
        {files.length === 0 ? (
            <div style={{padding: '20px', textAlign: 'center', color: '#666', fontSize: '0.8rem'}}>
                No files yet.<br/>Create a file or open local folder.
            </div>
        ) : (
            files.map((node) => (
            <FileNode 
                key={node.id} 
                node={node} 
                depth={0} 
                onSelect={onSelectFile} 
                selectedNodeId={selectedNodeId}
                onDelete={onDeleteItem}
                onRename={onRenameItem}
                onContextMenu={openContextMenu}
            />
            ))
        )}
      </div>
      {menuState && (
        <div className="explorerContextMenu" style={{ top: menuState.y, left: menuState.x }}>
          {menuItems.map((item) => (
            <button
              key={item.key}
              className="explorerContextMenuItem"
              onClick={() => handleMenuAction(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
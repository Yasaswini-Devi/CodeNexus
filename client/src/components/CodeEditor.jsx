import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ language = 'javascript', value = '', onChange = () => {}, height = '100%', options = {} }) {
  const [theme, setTheme] = useState(localStorage.getItem('cn_theme') === 'dark' ? 'vs-dark' : 'light');
  const [containerHeight, setContainerHeight] = useState(500);
  const containerRef = useRef(null);

  useEffect(() => {
    // Initial theme setup
    const currentTheme = localStorage.getItem('cn_theme') || 'light';
    setTheme(currentTheme === 'dark' ? 'vs-dark' : 'light');

    // Listen for theme changes
    const handleAttributeChange = () => {
      const newTheme = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(newTheme === 'dark' ? 'vs-dark' : 'light');
    };

    const observer = new MutationObserver(handleAttributeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (height === '100%' && containerRef.current) {
      // Use ResizeObserver for reliable height tracking
      const resizeObserver = new ResizeObserver(() => {
        if (containerRef.current) {
          const newHeight = containerRef.current.offsetHeight;
          if (newHeight > 0) {
            setContainerHeight(newHeight);
          }
        }
      });

      resizeObserver.observe(containerRef.current);

      // Also measure immediately
      const immediateHeight = containerRef.current.offsetHeight;
      if (immediateHeight > 0) {
        setContainerHeight(immediateHeight);
      }

      return () => resizeObserver.disconnect();
    }
  }, [height]);

  const editorHeight = height === '100%' ? containerHeight : height;

  return (
    <div 
      ref={containerRef} 
      style={{ 
        height: '100%', 
        width: '100%', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Editor
        height={editorHeight}
        theme={theme}
        defaultLanguage={language}
        value={value}
        onChange={(v) => onChange(v || '')}
        options={{ 
          automaticLayout: true, 
          minimap: { enabled: false }, 
          fontSize: 14, 
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          ...options 
        }}
      />
    </div>
  );
}

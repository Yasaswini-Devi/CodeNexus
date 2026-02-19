import React from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ language = 'javascript', value = '', onChange = () => {}, height = '320px', options = {} }) {
  const theme = localStorage.getItem('cn_theme') === 'dark' ? 'vs-dark' : 'light';
  return (
    <Editor
      height={height}
      theme={theme}
      defaultLanguage={language}
      value={value}
      onChange={(v) => onChange(v || '')}
      options={{ automaticLayout: true, minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', ...options }}
    />
  );
}

import React, { useEffect, useRef, useState } from 'react';
import LangList from './LangList';
import { toast } from 'react-hot-toast';
import CodeEditor from './CodeEditor';

function Html() {
  const result = useRef(null);
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const run_button = useRef(null);
  
  useEffect(() => {
  const run = () => {
    if (!result.current || !result.current.contentDocument) return;

    localStorage.setItem('html_code', htmlCode);
    localStorage.setItem('css_code', cssCode);
    
    // Update the iframe content
    result.current.contentDocument.body.innerHTML = 
      `<style>${cssCode}</style>` + htmlCode;
  };

  run();

  // Attach the JS run button
  const currentBtn = run_button.current;
  if (currentBtn) {
    currentBtn.onclick = () => {
      toast.success('Saved');
      localStorage.setItem('js_code', jsCode);
      try {
        result.current.contentWindow.eval(jsCode || '');
      } catch (e) {
        console.error(e);
      }
    };
  }

  // ADD THE DEPENDENCIES HERE:
}, [htmlCode, cssCode, jsCode]);

  
  return (
    <>
      <div className="voiceContainer">
        <div className="voiceBody wholeeditorBody">
          <div className="leftLang">
            <LangList leftcolorhtml="white" />
          </div>
          <h1 className="invisible"><mark>Web Editor</mark></h1>
          <div className="voicePlayground">
            <div className="htmlcodeEditor">
              <div className="editormain">
                <div className="html-code codemaincode">
                  <h1 className='webeditorheading'> HTML</h1>
                  <CodeEditor language="html" value={htmlCode} onChange={setHtmlCode} height="180px" />
                </div>
                <div className="css-code codemaincode">
                  <h1 className='webeditorheading'>CSS</h1>
                  <CodeEditor language="css" value={cssCode} onChange={setCssCode} height="180px" />
                </div>
                <div className="js-code codemaincode">
                  <h1 className='webeditorheading'>JavaScript <button data-testid="runButton" ref={run_button} className='jsrunbtn'>RUN</button> </h1>
                  <CodeEditor language="javascript" value={jsCode} onChange={setJsCode} height="180px" />
                  <div style={{marginTop:6}}><button onClick={()=>{ window.dispatchEvent(new CustomEvent('openAssistant',{detail:{code: htmlCode + '\n\n/* JS */\n' + jsCode, language:'html+js'}})) }}>AI Assist</button></div>
                </div>
              </div>
              <h1 className="invisible"><mark>Output</mark></h1>
              <iframe title='result' data-testid="result" id='result' ref={result}></iframe>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Html;
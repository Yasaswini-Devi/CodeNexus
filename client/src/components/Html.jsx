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

  const handleShare = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: `
	${html_code.current.value}

	<style>
	${css_code.current.value}
	</style>

	<script>
	${js_code.current.value}
	</script>
    	     `,
          language: "html",
        }),
      });

      const data = await response.json();

      const shareLink = `${window.location.origin}/share/${data.id}`;

      await navigator.clipboard.writeText(shareLink);

      alert("✅ Share link copied!");
    } catch (err) {
      console.error(err);
      alert("Share failed");
    }
  };

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
                  <h1 className='webeditorheading'>📝 HTML</h1>
                  <div className="editor-wrapper">
                    <CodeEditor language="html" value={htmlCode} onChange={setHtmlCode} />
                  </div>
                </div>
                <div className="css-code codemaincode">
                  <h1 className='webeditorheading'>🎨 CSS</h1>
                  <div className="editor-wrapper">
                    <CodeEditor language="css" value={cssCode} onChange={setCssCode} />
                  </div>
                </div>
                <div className="js-code codemaincode">
                  <h1 className='webeditorheading' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <span>⚙️ JavaScript</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className='copyDownloadBtn' title='Copy All Code' onClick={() => { navigator.clipboard.writeText(htmlCode + '\n\n/* CSS */\n' + cssCode + '\n\n/* JS */\n' + jsCode); toast.success('Code copied to clipboard!'); }}>📋 Copy</button>
                      <button className='copyDownloadBtn' title='Download All Code' onClick={() => { const blob = new Blob([htmlCode + '\n\n/* CSS */\n' + cssCode + '\n\n/* JS */\n' + jsCode], { type: 'text/plain' }); const link = document.createElement('a'); link.href = window.URL.createObjectURL(blob); link.download = 'code.txt'; link.click(); toast.success('Download started!'); }}>⬇️ Download</button>
                      <button className='copyDownloadBtn' title='Share Code' onClick={handleShare}>🔗 Share</button>
                      <div style={{ display: 'flex', gap: '6px', marginLeft: '4px' }}>
                        <button data-testid="runButton" ref={run_button} className='jsrunbtn'>RUN</button>
                        <button className='vbtn' onClick={() => { window.dispatchEvent(new CustomEvent('openAssistant', { detail: { code: htmlCode + '\n\n/* JS */\n' + jsCode, language: 'html+js' } })) }}>AI Assist</button>
                      </div>
                    </div>
                  </h1>
                  <div className="editor-wrapper">
                    <CodeEditor language="javascript" value={jsCode} onChange={setJsCode} />
                  </div>
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

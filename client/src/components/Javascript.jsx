import React, { useEffect, useState } from 'react';
import LangList from './LangList';
import { toast } from 'react-hot-toast';
import CodeEditor from './CodeEditor';

const data = new Date()
let DayName;
if (data.getDay() === 1) {
  DayName = "Monday";
}
else if (data.getDay() === 2) {
  DayName = "Tuesday";
}
else if (data.getDay() === 3) {
  DayName = "Wednesday";
}
else if (data.getDay() === 4) {
  DayName = "Thursday";
}
else if (data.getDay() === 5) {
  DayName = "Friday";
}

else if (data.getDay() === 6) {
  DayName = "Saturday";
}
else if (data.getDay() === 0) {
  DayName = "Sunday"
}
else {
  DayName = "CodoFile";
}

function Javascript() {

  const [code, setcode] = useState('');

  const runCode = () => {
    try {
      toast.success("Code Execution Started")
      eval(code);
    }
    catch (err) {
      toast.error("Please Enter Valid Code")
      console.log(`${err}`);
    }
  };

  const handleShare = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,          // your state variable
          language: "javascript",
        }),
      });

      const data = await response.json();

      const shareLink = `${window.location.origin}/share/${data.id}`;

      await navigator.clipboard.writeText(shareLink);

      toast.success("Share link copied!");
      console.log("Share Link:", shareLink);

    } catch (err) {
      console.error(err);
      toast.error("Sharing failed");
    }
  };

  const originalConsoleLog = console.log;

  useEffect(() => {
    const consoleOutput = document.getElementById('consoleOutput');
    const btn = document.querySelector('.btn1');

    const consoleLoghandler = function (...args) {
      const paragraph = document.createElement('p');
      paragraph.textContent = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      consoleOutput.appendChild(paragraph);
      originalConsoleLog.apply(console, args);
    };

    btn.addEventListener('click', () => {
      consoleOutput.innerHTML = "";
    });

    console.log = consoleLoghandler;

    return () => {
      btn.removeEventListener('click', () => {
        consoleOutput.innerHTML = "";
      });
      console.log = originalConsoleLog;
    };
  }, []);


  const clear = () => {
    toast.success("Output Cleared")
    const box = document.querySelector("#consoleOutput");
    box.innerHTML = "";
  }

  const copyContent = () => {
    navigator.clipboard.writeText(code);
    toast.success("Copied")
  }

  const codeToFile = () => {
    toast.success("File is Downloading...");

    const blob = new Blob([code], { type: "text/javascript" });

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    const FileCodeName = `CodoFile-(${DayName})`;

    link.download = FileCodeName;
    link.click();
  }

  return (
    <>
      <div className="jsContainer">
        <div className="jsBody wholeeditorBody">
          <div className="leftLang">
            <LangList leftcolorjs="white" />
          </div>
          <div className="PlaygroundMain">
            <div className='runHeaderJS'>
              <div className='jsleftheaderfile jsfile'>
                <mark><h2>index.js</h2></mark>
                <div className='runbtn'>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className='copyDownloadBtn' title='Copy code' onClick={copyContent}>📋 Copy</button>
                    <button className='copyDownloadBtn' title='Download code' onClick={codeToFile}>⬇️ Download</button>
                    <button className='vbtn' onClick={handleShare}>Share</button>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button className='btn btn1' onClick={runCode}>RUN</button>
                    <button className='vbtn' onClick={() => { window.dispatchEvent(new CustomEvent('openAssistant', { detail: { code, language: 'javascript' } })) }}>AI Assist</button>
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
                  <CodeEditor language="javascript" value={code} onChange={setcode} />
                </div>
              </div>
              <h1 className="invisible">
                <mark>Output</mark>
              </h1>
              <div className='rightplayground snippet' id='consoleOutput' data-testid="consoleOutput" >
                {/* <p>{output}</p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Javascript

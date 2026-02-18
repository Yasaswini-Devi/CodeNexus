import React,{ useState } from 'react';
import LangList from './LangList';
import { toast } from 'react-hot-toast';


function Python() {

  const [code,setCode] = useState('');
  const [output, setOutput] = useState('');

  const handleSubmit = async()=> {
    toast.loading('Please Wait while File is Executing.');
    const payload = {
      language: "py",
      code
    };

    try {
      const response = await fetch("http://localhost:5000/runpy", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body:JSON.stringify(payload)
      })

      const data = await response.json()
      if(response.ok) {
        toast.remove();
        setOutput(data.output);
        toast.success("Executed Successfully.");
      } else {
        setOutput(data.error);
        toast.remove();
        toast.error("An error occured.");
      }
    } catch(err) {
      toast.remove();
      setOutput("Error in communication with server");
    }
  }

  const clear = ()=>{
    toast.success('Output Cleared')
    const box = document.querySelector("#consoleOutput p");
    box.innerText = "";
  }

  const copyContent = ()=>{
    toast.success("Copied")
    navigator.clipboard.writeText(code);
  }

  const codeToFile = ()=>{
    toast.success('File is Downloading...')
    const text = document.querySelector('#python').value;
    
    const blob = new Blob([text],{type:"text/python"});

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "codofile-python.py";
    link.click();
  }

  return (
    <> 
      <div className="voiceContainer">
            <div className="voiceBody wholeeditorBody">
                <div className="leftLang">
                    <LangList leftcolorpy="white"/>
                </div>
                <div className="PlaygroundMain">
                <div className='runHeaderJS'>
                    <div className='jsleftheaderfile jsfile'>
                      <mark><h2>index.py</h2></mark>
                      <div className='runbtn'>
                        <button className='vbtn' onClick={copyContent}>Copy</button>
                        <button className='vbtn' onClick={codeToFile}>Download</button>
                        <button className='btn' onClick={handleSubmit}>RUN</button>
                      </div>
                    </div>
                    <div className='jsrightheaderfile jsfile'>
                      <mark><p>OUTPUT</p></mark>
                      <button className='clear' onClick={clear}>Clear</button>
                    </div>
                  </div>
                  <div className='jsplayground playground'>
                    <div className='leftplayground snippet'>
                    <textarea className='dartpython' name="python" id="python" value={code} onChange={(e)=>setCode(e.target.value)} placeholder='print("hello")'></textarea>
                    </div>
                    <h1 className="invisible">
                      <mark>Output</mark>
                    </h1>
                    <div className='rightplayground snippet' id='consoleOutput' >
                    <p>{output}</p>
                    </div>
                  </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default Python
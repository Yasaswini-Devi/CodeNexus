import React,{ useState } from 'react';
import LangList from './LangList';
import { toast } from 'react-hot-toast';


function Python() {

  const [code,setCode] = useState('');
  const [output, setOutput] = useState('');


  const clear = ()=>{
    toast.success('Output Cleared')
    const box = document.querySelector("#consoleOutput p");
    box.innerText = "";
  }

  const copyContent = ()=>{
    toast.success("Copied")
    navigator.clipboard.writeText(code);
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
                      <button className='vbtn'></button>
                      <button className='vbtn'></button>
                        <button className='btn'>RUN</button>
                      </div>
                    </div>
                    <div className='jsrightheaderfile jsfile'>
                      <mark><p>OUTPUT</p></mark>
                      <button className='clear' onClick={clear}>Clear</button>
                    </div>
                  </div>
                  <div className='jsplayground playground'>
                    <div className='leftplayground snippet'>
                    <textarea className='dartpython' name="python" id="python" value={code} onChange={(e)=>setCode(e.target.value)} placeholder='print("hello codoPlayers")'></textarea>
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
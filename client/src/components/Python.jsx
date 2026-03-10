import React, { useState } from 'react';
import LangList from './LangList';
import { toast } from 'react-hot-toast';

function Python() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');

  const handleSubmit = async () => {
    toast.loading('Running Code...');
    try {
      // ✅ Fetch from port 5000
      const response = await fetch("http://localhost:5001/runpy", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "py", code: code })
      });

      const data = await response.json();
      toast.dismiss();

      if (response.ok) {
        setOutput(data.output);
        toast.success("Success!");
      } else {
        setOutput(data.error || "Error occurred");
        toast.error("Execution Failed");
      }
    } catch (err) {
      toast.dismiss();
      console.error(err);
      setOutput("Error: Backend not reachable on port 5000");
      toast.error("Connection Failed");
    }
  };

  return (
    <div className="wholeeditorBody">
      <LangList leftcolorpython="white" />
      <div className="PlaygroundMain">
        <textarea 
          className='dartpython'
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder='print("Hello World")'
        />
        <button className='btn btn1' onClick={handleSubmit}>RUN</button>
        <div className='rightplayground snippet'>
           <pre>{output}</pre>
        </div>
      </div>
    </div>
  );
}

export default Python;
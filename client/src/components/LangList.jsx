import React from 'react';
import { NavLink } from 'react-router-dom';


function LangList(props) {
  return (
    <> 
    <div className="LangContainer">
            <div className="langSection languages">
                <div className="languageBorder" style={{'backgroundColor':`${props.leftcolorjs}`}}>
                        <NavLink to="/javascript">Js</NavLink>
                </div>
                <div className="languageBorder" style={{'backgroundColor':`${props.leftcolorhtml}`}}>
                        <NavLink to="/html">HTML, CSS</NavLink>
                </div>
                <div className="languageBorder" style={{'backgroundColor':`${props.leftcolorpy}`}}>
                        <NavLink to="/python">Python</NavLink>
                </div>
            </div>
    </div>
    </>
  )
}

export default LangList
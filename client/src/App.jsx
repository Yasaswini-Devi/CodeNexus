import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Javascript from './components/Javascript'   
import Html from './components/Html'
import Python from './components/Python'    
import './App.css'

function App() {

  return (
    <>
      <Router>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/javascript' element={<Javascript />} />
            <Route path='/python' element={<Python />} />
            <Route path='/html' element={<Html />} />
          </Routes>
      </Router>
    </>
  )
}

export default App

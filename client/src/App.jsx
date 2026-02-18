import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import './App.css'
import Python from './components/Python'

function App() {

  return (
    <>
      <Router>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/python' element={<Python />} />
          </Routes>
      </Router>
    </>
  )
}

export default App

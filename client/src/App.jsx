import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
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
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/javascript" element={<Javascript />} />
            <Route path="/python" element={<Python />} />
            <Route path="/html" element={<Html />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react' 
import AppLayout from './components/AppLayout'
import LandingPage from './components/LandingPage'
import Javascript from './components/Javascript'
import Html from './components/Html'
import Python from './components/Python'
import './App.css'
import SharePage from "./components/SharePage";

function App() {

	// ===== THEME STATE =====
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  // ===== APPLY THEME =====
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <Router>
        <Routes>
          <Route element={<AppLayout theme={theme} setTheme={setTheme} />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/javascript" element={<Javascript />} />
            <Route path="/python" element={<Python />} />
            <Route path="/html" element={<Html />} />
	  		<Route path="/share/:id" element={<SharePage />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import AppLayout from './components/AppLayout'
import LandingPage from './components/LandingPage'
import Javascript from './components/Javascript'
import Html from './components/Html'
import Python from './components/Python'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'
import SharePage from "./components/SharePage";
import IDEPage from './components/IDEPage'; 

// Protected Route: redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // wait for token validation
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Home Route: redirect unauthenticated users to /login, otherwise show landing page
function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <LandingPage />;
}

function AppRoutes() {
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
    <Router>
      <Routes>
        {/* Public standalone routes */}
        <Route path="/login" element={<AuthPage />} />

        {/* All routes inside the main layout */}
        <Route element={<AppLayout theme={theme} setTheme={setTheme} />}>
          {/* Home Route (Redirection Logic) */}
          <Route path="/" element={<HomeRoute />} />

          {/* Protected Playgrounds */}
          <Route path="/javascript" element={<ProtectedRoute><Javascript /></ProtectedRoute>} />
          <Route path="/python" element={<ProtectedRoute><Python /></ProtectedRoute>} />
          <Route path="/html" element={<ProtectedRoute><Html /></ProtectedRoute>} />
          
          {/* Protected IDE */}
          <Route path="/ide" element={<ProtectedRoute><IDEPage /></ProtectedRoute>} />

          {/* Protected Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Shared Page (Public) */}
          <Route path="/share/:id" element={<SharePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2600,
          style: {
            background: 'rgba(22, 27, 34, 0.92)',
            color: '#e6edf3',
            border: '1px solid rgba(48, 54, 61, 0.7)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App
import { NavLink, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

function TopNavLink({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `topNavLink${isActive ? ' isActive' : ''}`}
    >
      {children}
    </NavLink>
  )
}

export default function AppLayout() {
  return (
    <div className="appRoot">
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
      <header className="topNav">
        <div className="topNavInner">
          <div className="topNavLeft">
            <NavLink to="/" className="brand" aria-label="CodeNexus home">
              <span className="brandMark">Code</span>
              <span className="brandMark brandMarkAccent">Nexus</span>
            </NavLink>
          </div>
          <nav className="topNavRight" aria-label="Primary">
            <TopNavLink to="/" end>
              Home
            </TopNavLink>
            <TopNavLink to="/javascript">JavaScript</TopNavLink>
            <TopNavLink to="/python">Python</TopNavLink>
            <TopNavLink to="/html">HTML/CSS</TopNavLink>
          </nav>
        </div>
      </header>
      <main className="appMain">
        <Outlet />
      </main>
    </div>
  )
}


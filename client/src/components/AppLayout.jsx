import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import AIAssistant from './AIAssistant';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem('cn_theme') || 'light');
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('cn_theme', theme); }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className='themeToggle'
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <span className="themeIcon">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
      <span className="themeLabel">
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}

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


function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        !btnRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) {
    return (
      <NavLink
        to="/login"
        className={({ isActive }) => `topNavLink${isActive ? ' isActive' : ''}`}
        id="navLoginLink"
      >
        Sign In
      </NavLink>
    );
  }

  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(o => !o);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/login');
    toast.success('Signed out');
  };

  const dropdown = (
    <div
      ref={dropdownRef}
      className="userDropdown"
      id="userDropdown"
      style={{ position: 'fixed', top: dropPos.top, right: dropPos.right, zIndex: 9999 }}
    >
      <div className="userDropdownName">{user.username}</div>
      <div className="userDropdownEmail">{user.email}</div>
      <hr className="userDropdownDivider" />
      <button
        className="userDropdownItem"
        onClick={() => { setOpen(false); navigate('/dashboard'); }}
        id="navDashboardBtn"
      >
        📂 My Projects
      </button>
      <button
        className="userDropdownItem userDropdownLogout"
        onClick={handleLogout}
        id="navLogoutBtn"
      >
        🚪 Sign Out
      </button>
    </div>
  );

  return (
    <div ref={btnRef} style={{ display: 'inline-block', position: 'relative' }}>
      <button
        className="userAvatar"
        onClick={handleOpen}
        title={user.username || user.email}
        id="userAvatarBtn"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {initials}
      </button>
      {open && createPortal(dropdown, document.body)}
    </div>
  );
}


export default function AppLayout({ theme, setTheme }) {
  return (
    <div className="appRoot">
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
            <div style={{ display: 'inline-block', marginLeft: 12 }}>
              <ThemeToggle />
            </div>
            <div style={{ display: 'inline-block', marginLeft: 8 }}>
              <UserMenu />
            </div>
          </nav>
        </div>
      </header>
      <main className="appMain">
        <Outlet />
      </main>
      <AIAssistant />
    </div>
  )
}

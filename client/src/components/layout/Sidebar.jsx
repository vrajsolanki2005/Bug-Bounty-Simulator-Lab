import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Target, Terminal, Wifi, Trophy, LogOut, Bug } from 'lucide-react'

const links = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/challenges',  icon: Target,          label: 'Learn' },
  { to: '/scanner',     icon: Wifi,            label: 'AttackBox' },
  { to: '/leaderboard', icon: Trophy,          label: 'Compete' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🐛</div>
        <span className="sidebar-logo-text">BugBounty<span style={{color:'var(--accent)'}}>Lab</span></span>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={16} />{label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.username}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              {user.points?.toLocaleString()} pts · {user.rank_title}
            </div>
          </div>
        )}
        <button className="sidebar-link w-full" onClick={handleLogout} style={{ color: 'var(--red)' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  )
}

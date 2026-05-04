import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Monitor, Search, User, Shield, Terminal, Activity, LogIn } from 'lucide-react'

export default function UnifiedTargetApp({ onFlagCaptured }) {
  const [view, setView] = useState('home') // home, search, profile, admin, tools, login
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [targetProfile, setTargetProfile] = useState(null)
  const [pingHost, setPingHost] = useState('')
  const [pingOutput, setPingOutput] = useState('')

  // Check for flag in API responses
  const checkFlag = (data) => {
    if (data.flag) {
      onFlagCaptured(data.flag)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const username = e.target.username.value
    const password = e.target.password.value
    setLoading(true)
    try {
      const { data } = await api.post('/target/login', { username, password })
      if (data.success) {
        setCurrentUser(data.user)
        setView('home')
        toast.success(data.message)
        checkFlag(data)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.get(`/target/search?q=${searchQuery}`)
      setSearchResults(data)
      checkFlag(data)
    } catch (err) { toast.error('Search error') }
  }

  const fetchProfile = async (id) => {
    try {
      const { data } = await api.get(`/target/user/${id}`)
      setTargetProfile(data.data)
      checkFlag(data)
    } catch (err) { toast.error('User not found') }
  }

  const handlePing = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/target/tools/ping', { host: pingHost })
      setPingOutput(data.output)
      checkFlag(data)
    } catch (err) { toast.error('Tool error') }
  }

  const accessAdmin = async () => {
    try {
      const { data } = await api.get('/target/admin/stats')
      toast.success('Admin access granted!')
      checkFlag(data)
      setView('admin')
    } catch (err) { toast.error('Access Denied: Admins only') }
  }

  return (
    <div style={{ backgroundColor: '#f4f6f8', color: '#333', borderRadius: '8px', minHeight: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* Browser Nav */}
      <div style={{ backgroundColor: '#e2e8f0', padding: '0.75rem', borderBottom: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f87171' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#facc15' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
        </div>
        <div style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 12px', fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>
          http://internal-corp-portal.local/{view !== 'home' ? view : ''}
        </div>
      </div>

      {/* App Navbar */}
      <nav style={{ backgroundColor: '#2563eb', color: '#fff', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setView('home')}>
          <Shield size={20} /> CorpPortal
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => setView('home')}>Home</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setView('search')}>Search</span>
          <span style={{ cursor: 'pointer' }} onClick={accessAdmin}>Admin</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setView('tools')}>Tools</span>
          {currentUser ? (
             <span style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { fetchProfile(currentUser.id); setView('profile') }}>{currentUser.username}</span>
          ) : (
             <span style={{ cursor: 'pointer' }} onClick={() => setView('login')}>Login</span>
          )}
        </div>
      </nav>

      {/* App Body */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {view === 'home' && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Activity style={{ margin: '0 auto 1rem', color: '#2563eb' }} size={48} />
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Internal Employee Portal</h1>
            <p style={{ color: '#475569', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>Welcome to the corporate internal network. Please log in to access sensitive employee data and administrative tools.</p>
          </div>
        )}

        {view === 'login' && (
          <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b' }}><LogIn size={20}/> Member Login</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Username</label>
                <input name="username" style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.5rem', fontSize: '0.875rem' }} placeholder="e.g. jdoe" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Password</label>
                <input name="password" type="password" style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.5rem', fontSize: '0.875rem' }} placeholder="••••••••" required />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#2563eb', color: '#fff', fontWeight: 'bold', padding: '0.75rem', borderRadius: '4px', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        )}

        {view === 'search' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Global File Search</h2>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              <input 
                style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.5rem', fontSize: '0.875rem' }} 
                placeholder="Search documents, users, or logs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button style={{ backgroundColor: '#1e293b', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}><Search size={16}/></button>
            </form>
            {searchResults && (
              <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Results for: <span dangerouslySetInnerHTML={{ __html: searchResults.query }} style={{ fontFamily: 'monospace', color: '#2563eb', fontWeight: 'bold' }}></span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {searchResults.results.map((r, i) => <div key={i} style={{ fontSize: '0.875rem', padding: '0.5rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{r}</div>)}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'profile' && targetProfile && (
          <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <User size={32} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{targetProfile.username}</h2>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>{targetProfile.rank_title}</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Email Address</label>
                <div style={{ fontSize: '0.875rem', color: '#333' }}>{targetProfile.email}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Employee ID</label>
                <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#333' }}>EMP-{targetProfile.id.toString().padStart(5, '0')}</div>
              </div>
            </div>
          </div>
        )}

        {view === 'tools' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b' }}><Activity size={20}/> Network Diagnostics</h2>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1.5rem' }}>Test internal host connectivity using the ping utility.</p>
            <form onSubmit={handlePing} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem' }} 
                placeholder="Target Host (e.g. 127.0.0.1)"
                value={pingHost}
                onChange={e => setPingHost(e.target.value)}
              />
              <button style={{ backgroundColor: '#2563eb', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Execute</button>
            </form>
            {pingOutput && (
              <pre style={{ backgroundColor: '#0f172a', color: '#4ade80', padding: '1rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {pingOutput}
              </pre>
            )}
          </div>
        )}

        {view === 'admin' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#dc2626' }}>System Administration</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Total Users</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>1,337</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>System Uptime</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>142 Days</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Browser Footer */}
      <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', textAlign: 'center', fontSize: '10px', color: '#94a3b8', borderTop: '1px solid #e2e8f0' }}>
        © 2024 SecureCorp Internal Network. Authorized Personnel Only.
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, CheckCircle, Clock, Zap, TrendingUp, Activity } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import api from '../api/axios'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="app-shell"><Sidebar/><div className="content-with-sidebar loading"><div className="spinner"/></div></div>

  const { stats, by_category, recent_solved, user } = data || {}

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content-with-sidebar main-content">
        <div className="page-content">
          {/* Header */}
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} style={{marginBottom:'2rem'}}>
            <h1 style={{fontSize:'1.75rem', marginBottom:'0.25rem'}}>
              Welcome back, <span className="neon-text">{user?.username}</span> 👋
            </h1>
            <p className="text-muted text-sm">{user?.rank_title} · {user?.points?.toLocaleString()} total points</p>
          </motion.div>

          {/* Stat Cards */}
          <div className="stat-grid mb-3">
            {[
              { icon: <Target size={18}/>, label:'Total Challenges', value: stats?.total_challenges ?? 0, color:'var(--accent)' },
              { icon: <CheckCircle size={18}/>, label:'Solved', value: stats?.solved ?? 0, color:'var(--cyan)' },
              { icon: <Clock size={18}/>, label:'In Progress', value: stats?.in_progress ?? 0, color:'var(--orange)' },
              { icon: <Zap size={18}/>, label:'Points Earned', value: (stats?.points_earned ?? 0).toLocaleString(), color:'var(--yellow)' },
              { icon: <Activity size={18}/>, label:'Scans Run', value: stats?.total_scans ?? 0, color:'var(--purple)' },
            ].map(s => (
              <motion.div key={s.label} className="stat-card" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}>
                <div style={{color:s.color, marginBottom:'0.5rem'}}>{s.icon}</div>
                <div className="stat-value" style={{color:s.color}}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Progress */}
          <div className="card mb-3">
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.75rem'}}>
              <span style={{fontWeight:700}}>Overall Progress</span>
              <span className="text-accent font-mono text-sm">{stats?.completion_pct ?? 0}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width:`${stats?.completion_pct ?? 0}%`}} />
            </div>
            <p className="text-xs text-muted mt-1">{stats?.solved ?? 0} of {stats?.total_challenges ?? 0} challenges solved</p>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            {/* Category Breakdown */}
            <div className="card">
              <h3 style={{marginBottom:'1rem', fontSize:'0.95rem'}}>
                <TrendingUp size={16} style={{display:'inline', marginRight:6}} color="var(--accent)" />
                By Category
              </h3>
              {(by_category || []).map(c => (
                <div key={c.category} style={{marginBottom:'0.75rem'}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:'0.25rem'}}>
                    <span>{c.category}</span>
                    <span className="text-muted">{c.solved}/{c.total}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width:`${c.total ? Math.round((c.solved/c.total)*100) : 0}%`}} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Solved */}
            <div className="card">
              <h3 style={{marginBottom:'1rem', fontSize:'0.95rem'}}>
                <CheckCircle size={16} style={{display:'inline', marginRight:6}} color="var(--cyan)" />
                Recently Solved
              </h3>
              {recent_solved?.length === 0 && <p className="text-muted text-sm">No challenges solved yet. <a onClick={()=>navigate('/challenges')} style={{cursor:'pointer'}}>Start now →</a></p>}
              {(recent_solved || []).map(ch => (
                <div key={ch.title} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid var(--border)'}}>
                  <div>
                    <div style={{fontSize:'0.85rem', fontWeight:600}}>{ch.title}</div>
                    <div className="text-xs text-muted">{ch.category}</div>
                  </div>
                  <span className="badge badge-easy">+{ch.points}pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

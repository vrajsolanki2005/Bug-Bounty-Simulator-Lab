import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Award, Medal, Crown, RefreshCw } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Leaderboard() {
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchBoard = () => {
    setLoading(true)
    api.get('/leaderboard').then(r => setBoard(r.data.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchBoard() }, [])

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={20} color="var(--yellow)" />
    if (rank === 2) return <Medal size={20} color="#C0C0C0" />
    if (rank === 3) return <Medal size={20} color="#CD7F32" />
    return <span style={{fontFamily:'var(--font-mono)', color:'var(--text-muted)'}}>#{rank}</span>
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content-with-sidebar main-content">
        <div className="page-content" style={{maxWidth:900}}>
          <div style={{marginBottom:'2rem', textAlign:'center'}}>
            <motion.div initial={{scale:0}} animate={{scale:1}} style={{display:'inline-block', padding:'1rem', background:'var(--accent-dim)', borderRadius:'50%', marginBottom:'1rem'}}>
              <Trophy size={40} color="var(--accent)" />
            </motion.div>
            <h1 style={{fontSize:'2rem', fontWeight:800}}>Global <span className="neon-text">Leaderboard</span></h1>
            <p className="text-muted mt-1">Compete with hackers worldwide. Earn points by solving challenges.</p>
            <button className="btn btn-secondary btn-sm" style={{marginTop:'1rem'}} onClick={fetchBoard} disabled={loading}>
              <RefreshCw size={14} style={{marginRight:4}} /> Refresh
            </button>
          </div>

          {loading ? <div className="loading"><div className="spinner"/></div> : (
            <div className="card" style={{padding:0, overflow:'hidden'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'var(--bg-secondary)', textAlign:'left', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-muted)'}}>
                    <th style={{padding:'1rem 1.5rem', width:80}}>Rank</th>
                    <th style={{padding:'1rem 1.5rem'}}>Hacker</th>
                    <th style={{padding:'1rem 1.5rem', textAlign:'center'}}>Solved</th>
                    <th style={{padding:'1rem 1.5rem', textAlign:'right'}}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((u, i) => (
                    <motion.tr key={u.id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                      style={{borderBottom:'1px solid var(--border)', background: user?.username === u.username ? 'rgba(0,255,136,0.08)' : i<3 ? `rgba(0,255,136,0.0${3-i})` : 'transparent'}}
                    >
                      <td style={{padding:'1rem 1.5rem', fontWeight:700}}>{getRankIcon(u.rank)}</td>
                      <td style={{padding:'1rem 1.5rem'}}>
                        <div style={{fontWeight:700}}>{u.username}</div>
                        <div className="text-xs text-muted">{u.rank_title}</div>
                      </td>
                      <td style={{padding:'1rem 1.5rem', textAlign:'center', color:'var(--cyan)', fontFamily:'var(--font-mono)'}}>
                        {u.solved_count}
                      </td>
                      <td style={{padding:'1rem 1.5rem', textAlign:'right', fontWeight:800, color:'var(--yellow)', fontFamily:'var(--font-mono)'}}>
                        {u.points.toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                  {board.length === 0 && <tr><td colSpan={4} style={{padding:'3rem', textAlign:'center', color:'var(--text-muted)'}}>No users on the leaderboard yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

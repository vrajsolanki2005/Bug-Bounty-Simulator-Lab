import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, CheckCircle, Play, Layers, Target, Compass } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import api from '../api/axios'

const DIFFS = ['All','Easy','Medium','Hard','Expert']
const CATEGORIES = ['All','XSS','Injection','Authentication','Access Control','Session','File Inclusion','File Upload','Misconfiguration','Logic','Server-Side','Info Disclosure','Bypass','Recon','Availability','Social Engineering','Redirect','UI','CSRF']

const PATHS = [
  { id: 'web-injection', title: 'Web Injection Fundamentals', desc: 'Master SQL injection, command injection, and template injection techniques. Crucial for any penetration tester.', icon: '💉', categories: ['Injection'] },
  { id: 'xss-mastery', title: 'Cross-Site Scripting Mastery', desc: 'Learn to discover and exploit reflected, stored, and DOM-based XSS vulnerabilities in modern web applications.', icon: '🕸️', categories: ['XSS', 'UI', 'CSRF'] },
  { id: 'auth-security', title: 'Identity & Access Control', desc: 'Bypass logins, forge sessions, and exploit broken access controls to gain administrative privileges.', icon: '🔐', categories: ['Authentication', 'Access Control', 'Session'] },
  { id: 'server-flaws', title: 'Server-Side Exploitation', desc: 'Exploit SSRF, File Uploads, and LFI/RFI vulnerabilities to gain initial access and remote code execution.', icon: '🖥️', categories: ['File Inclusion', 'File Upload', 'Server-Side', 'Redirect'] },
  { id: 'logic-flaws', title: 'Business Logic & Misconfig', desc: 'Exploit flawed application logic, race conditions, misconfigured buckets, and e-commerce cart bypasses.', icon: '⚙️', categories: ['Logic', 'Bypass', 'Misconfiguration'] },
  { id: 'recon-intel', title: 'Reconnaissance & Intel', desc: 'Master the art of information gathering, asset discovery, and finding sensitive data disclosures.', icon: '🔍', categories: ['Recon', 'Info Disclosure', 'Social Engineering'] },
  { id: 'advanced-ops', title: 'Advanced Operations', desc: 'Take on complex availability attacks, advanced bypasses, and chained exploits in fortified environments.', icon: '⚡', categories: ['Availability'] },
]

const diffClass = d => ({'Easy':'badge-easy','Medium':'badge-medium','Hard':'badge-hard','Expert':'badge-expert'}[d]||'badge-easy')

export default function Challenges() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [diff, setDiff] = useState('All')
  const [cat, setCat] = useState('All')
  const [viewMode, setViewMode] = useState('paths') // 'paths' or 'practice'
  const [selectedPath, setSelectedPath] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/challenges').then(r => setChallenges(r.data.data || [])).finally(() => setLoading(false))
  }, [])

  // Filter for practice mode
  const practiceFiltered = challenges.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase())
    const matchDiff = diff === 'All' || c.difficulty === diff
    const matchCat  = cat  === 'All' || c.category  === cat
    return matchSearch && matchDiff && matchCat
  })

  // Filter for path mode
  const pathChallenges = selectedPath 
    ? challenges.filter(c => PATHS.find(p => p.id === selectedPath)?.categories.includes(c.category))
    : []

  const solvedCount = challenges.filter(c => c.user_status === 'solved').length

  const getPathProgress = (path) => {
    const pathChalls = challenges.filter(c => path.categories.includes(c.category))
    if (pathChalls.length === 0) return 0
    const pathSolved = pathChalls.filter(c => c.user_status === 'solved').length
    return Math.round((pathSolved / pathChalls.length) * 100)
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content-with-sidebar main-content">
        <div className="page-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header & View Toggle */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem', borderBottom:'1px solid var(--border)', paddingBottom:'1.5rem'}}>
            <div>
              <h1 style={{fontSize:'2rem', fontWeight:900, marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.75rem'}}>
                <Target color="var(--accent)" /> Training Ground
              </h1>
              <p className="text-muted text-sm">Select a learning path to master specific skills, or browse all available targets.</p>
            </div>
            
            <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <button 
                onClick={() => { setViewMode('paths'); setSelectedPath(null) }}
                style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', background: viewMode === 'paths' ? 'var(--accent-dim)' : 'transparent', color: viewMode === 'paths' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                <Compass size={16} /> Learning Paths
              </button>
              <button 
                onClick={() => setViewMode('practice')}
                style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', background: viewMode === 'practice' ? 'var(--accent-dim)' : 'transparent', color: viewMode === 'practice' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                <Layers size={16} /> Practice Arena
              </button>
            </div>
          </div>

          {loading ? <div className="loading"><div className="spinner"/></div> : (
            <>
              {/* LEARNING PATHS VIEW */}
              {viewMode === 'paths' && !selectedPath && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="grid-2" style={{ gap: '2rem' }}>
                  {PATHS.map((path, i) => {
                    const progress = getPathProgress(path)
                    return (
                      <motion.div key={path.id} 
                        initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', cursor: 'pointer', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        onClick={() => setSelectedPath(path.id)}
                        whileHover={{ y: -5, borderColor: 'rgba(16,185,129,0.5)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                      >
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '6rem', opacity: 0.05, filter: 'grayscale(100%)' }}>{path.icon}</div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{path.icon}</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{path.title}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1, marginBottom: '2rem' }}>{path.desc}</p>
                        
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            <span>PROGRESS</span>
                            <span style={{ color: progress === 100 ? 'var(--cyan)' : 'var(--accent)' }}>{progress}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? 'var(--cyan)' : 'var(--accent)', transition: 'width 1s ease' }} />
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}

              {/* SPECIFIC PATH VIEW */}
              {viewMode === 'paths' && selectedPath && (
                <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedPath(null)} style={{ marginBottom: '2rem' }}>
                     ← Back to Paths
                  </button>
                  <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '4rem' }}>{PATHS.find(p=>p.id===selectedPath).icon}</div>
                    <div>
                      <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{PATHS.find(p=>p.id===selectedPath).title}</h2>
                      <p style={{ color: 'var(--text-muted)' }}>{PATHS.find(p=>p.id===selectedPath).desc}</p>
                    </div>
                  </div>
                  
                  <div className="grid-3">
                    {pathChallenges.map((ch, i) => (
                      <motion.div key={ch.id} className={`challenge-card ${ch.user_status==='solved'?'solved':''}`}
                        initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                        onClick={() => navigate(`/lab/${ch.id}`)}
                      >
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                          <h3 className="challenge-card-title" style={{flex:1,marginRight:'0.5rem'}}>{ch.title}</h3>
                          {ch.user_status === 'solved'
                            ? <CheckCircle size={16} color="var(--cyan)" style={{flexShrink:0}}/>
                            : <Play size={16} color="var(--text-muted)" style={{flexShrink:0}}/>
                          }
                        </div>
                        <p style={{fontSize:'0.8rem', color:'var(--text-muted)', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                          {ch.description}
                        </p>
                        <div className="challenge-card-meta">
                          <span className={`badge ${diffClass(ch.difficulty)}`}>{ch.difficulty}</span>
                          <span className="challenge-card-points">+{ch.points}pts</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* PRACTICE ARENA VIEW (Original List) */}
              {viewMode === 'practice' && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                  <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'2rem', background:'var(--bg-card)', padding:'1rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border)'}}>
                    <div style={{position:'relative', flex: 1, minWidth: '200px'}}>
                      <Search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}} />
                      <input className="form-input" style={{paddingLeft:'2rem', width:'100%'}} placeholder="Search all labs..." value={search} onChange={e=>setSearch(e.target.value)} />
                    </div>
                    <select className="form-input form-select" style={{width:120}} value={diff} onChange={e=>setDiff(e.target.value)}>
                      {DIFFS.map(d=><option key={d}>{d}</option>)}
                    </select>
                    <select className="form-input form-select" style={{width:160}} value={cat} onChange={e=>setCat(e.target.value)}>
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="grid-3">
                    {practiceFiltered.map((ch, i) => (
                      <motion.div key={ch.id} className={`challenge-card ${ch.user_status==='solved'?'solved':''}`}
                        initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay: (i%10)*0.03}}
                        onClick={() => navigate(`/lab/${ch.id}`)}
                      >
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                          <h3 className="challenge-card-title" style={{flex:1,marginRight:'0.5rem'}}>{ch.title}</h3>
                          {ch.user_status === 'solved'
                            ? <CheckCircle size={16} color="var(--cyan)" style={{flexShrink:0}}/>
                            : <Play size={16} color="var(--text-muted)" style={{flexShrink:0}}/>
                          }
                        </div>
                        <p style={{fontSize:'0.8rem', color:'var(--text-muted)', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                          {ch.description}
                        </p>
                        <div className="challenge-card-meta">
                          <span className={`badge ${diffClass(ch.difficulty)}`}>{ch.difficulty}</span>
                          <span className="badge" style={{background:'var(--bg-secondary)',color:'var(--text-muted)'}}>{ch.category}</span>
                          <span className="challenge-card-points">+{ch.points}pts</span>
                          {ch.user_status==='solved' && <span className="badge badge-solved">Solved</span>}
                        </div>
                      </motion.div>
                    ))}
                    {practiceFiltered.length === 0 && <p className="text-muted" style={{gridColumn:'1/-1',textAlign:'center',padding:'3rem'}}>No challenges match your filters.</p>}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

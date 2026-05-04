import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Terminal, Trophy, Zap, ChevronRight, Bug } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: '🎯', title: '59 Vulnerability Labs', desc: 'SQLi, XSS, RCE, SSRF, JWT flaws and 54 more real-world vulnerabilities' },
  { icon: '🖥️', title: 'Built-in Terminal', desc: 'Simulated nmap, subfinder, ffuf, nikto and more recon tools' },
  { icon: '🔍', title: 'Real Port Scanner', desc: 'Run actual nmap scans against any domain directly from the platform' },
  { icon: '🏆', title: 'Leaderboard', desc: 'Compete with others, earn points, and climb the hacker ranks' },
]

const stats = [
  { value: '59', label: 'Challenges' },
  { value: '10+', label: 'Categories' },
  { value: '4', label: 'Difficulty Levels' },
  { value: '∞', label: 'Learning' },
]

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 2rem', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:50, background:'rgba(10,10,15,0.9)', backdropFilter:'blur(12px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:800, fontSize:'1.1rem' }}>
          <Bug size={20} color="var(--accent)" /> BugBounty<span style={{color:'var(--accent)'}}>Lab</span>
        </div>
        <div style={{ display:'flex', gap:'1rem' }}>
          {user ? (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>Dashboard</button>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}} style={{position:'relative',zIndex:1}}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'var(--accent-dim)', border:'1px solid var(--border-hover)', borderRadius:99, padding:'0.3rem 0.8rem', fontSize:'0.75rem', color:'var(--accent)', marginBottom:'1.5rem' }}>
            <Zap size={12} /> 59 Vulnerability Labs Available
          </div>
          <h1 className="hero-title">
            Learn <span className="neon-text">Ethical Hacking</span><br />by Doing It
          </h1>
          <p className="hero-subtitle">
            A hands-on Bug Bounty Simulator with real vulnerability labs, a built-in recon terminal, and a live port scanner. No fluff — just pure hacking practice.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Hacking <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">View Labs</Link>
          </div>

          {/* Fake terminal preview */}
          <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.6}} style={{marginTop:'3rem', maxWidth:600, margin:'3rem auto 0', textAlign:'left'}}>
            <div className="terminal">
              <div className="terminal-header">
                <div className="terminal-dot red"/><div className="terminal-dot yellow"/><div className="terminal-dot green"/>
                <span className="terminal-title">bugbounty@lab:~$</span>
              </div>
              <div className="terminal-body" style={{height:180}}>
                {['$ nmap -sV target.buglab.local','Starting Nmap 7.94...','22/tcp  open  ssh     OpenSSH 7.4','80/tcp  open  http    Apache 2.4.29','3306/tcp open mysql   MySQL 5.7.32','$ subfinder -d target.buglab.local','admin.target.buglab.local','api.target.buglab.local','upload.target.buglab.local'].map((l,i) => (
                  <div key={i} className={`terminal-line ${l.startsWith('$') ? 'input' : ''}`}>{l}</div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{padding:'3rem 2rem', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', maxWidth:800, margin:'0 auto', textAlign:'center'}}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{fontSize:'2.5rem', fontWeight:800, color:'var(--accent)', fontFamily:'var(--font-mono)'}}>{s.value}</div>
              <div style={{fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{padding:'4rem 2rem', maxWidth:1100, margin:'0 auto'}}>
        <h2 style={{textAlign:'center', fontSize:'2rem', marginBottom:'3rem'}}>Everything You Need to <span className="neon-text">Level Up</span></h2>
        <div className="grid-2">
          {features.map(f => (
            <div key={f.title} className="card" style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}>
              <span style={{fontSize:'2rem'}}>{f.icon}</span>
              <div>
                <h3 style={{fontSize:'1rem', marginBottom:'0.4rem'}}>{f.title}</h3>
                <p style={{fontSize:'0.85rem'}}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{textAlign:'center', padding:'4rem 2rem', borderTop:'1px solid var(--border)'}}>
        <h2 style={{fontSize:'2rem', marginBottom:'1rem'}}>Ready to Start?</h2>
        <p style={{marginBottom:'2rem', color:'var(--text-secondary)'}}>Create a free account and start exploiting vulnerabilities in minutes.</p>
        <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
      </section>

      <footer style={{textAlign:'center', padding:'1.5rem', borderTop:'1px solid var(--border)', color:'var(--text-muted)', fontSize:'0.8rem'}}>
        BugBountyLab — For educational purposes only. Always get proper authorization before testing.
      </footer>
    </div>
  )
}

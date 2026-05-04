import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Shield, Terminal, Trophy, Zap, ChevronRight, Bug, Target, 
  Activity, ShieldCheck, Cpu, Code2, Lock, Globe, Database,
  ArrowRight, MousePointer2, Sparkles, Binary
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

const features = [
  { icon: <Target color="var(--accent-light)" size={28} />, title: '59 Realistic Labs', desc: 'From basic SQLi to advanced business logic flaws in a live E-commerce environment.' },
  { icon: <Terminal color="var(--cyan)" size={28} />, title: 'Integrated Recon', desc: 'Built-in terminal with Nmap, Subfinder, and Dirb to simulate the full attack lifecycle.' },
  { icon: <Binary color="var(--purple)" size={28} />, title: 'Exploit Engine', desc: 'Real-time flag generation and validation system that reacts to your payloads.' },
  { icon: <ShieldCheck color="var(--accent-light)" size={28} />, title: 'Career Growth', desc: 'Master the OWASP Top 10 and build a portfolio for professional bug hunting.' },
]

const stats = [
  { label: 'Labs Online', value: '59+' },
  { label: 'Recon Tools', value: '12' },
  { label: 'Challenges', value: '150+' },
  { label: 'Skill Paths', value: '5' },
]

export default function Landing3D() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', color: 'var(--text-1)', position: 'relative', overflowX: 'hidden' }}>
      {/* Dynamic Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.4 }}>
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(16,185,129,0.06) 0%, transparent 40%)`
          }}
        />
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(16,185,129,0.08)', filter: 'blur(120px)', borderRadius: '50%', animation: 'pulse 4s infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(6,182,212,0.08)', filter: 'blur(120px)', borderRadius: '50%' }} />
      </div>

      {/* Navigation */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(3,3,5,0.7)', backdropFilter: 'blur(24px)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: '40px', height: '40px', background: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--accent-glow)' }}>
              <Bug color="#000" size={24} />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.03em' }}>
              BUG<span style={{ color: 'var(--accent)' }}>LAB</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-3)', letterSpacing: '0.05em' }}>
            <a href="#labs" style={{ color: 'var(--text-3)' }}>LABS</a>
            <a href="#tools" style={{ color: 'var(--text-3)' }}>TOOLS</a>
            <a href="#about" style={{ color: 'var(--text-3)' }}>ABOUT</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                DASHBOARD <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <Link to="/login" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-2)' }}>LOGIN</Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                  GET STARTED
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', paddingTop: '12rem', paddingBottom: '6rem', paddingLeft: '2rem', paddingRight: '2rem', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div style={{ opacity, scale, maxWidth: '1000px', textAlign: 'center' }}>
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-dim)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.4rem 1rem', borderRadius: '99px', color: 'var(--accent-light)', fontSize: '0.75rem', fontWeight: 900, marginBottom: '2.5rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}
          >
            <Sparkles size={14} /> The Future of Offensive Security
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontSize: '5.5rem', fontWeight: 900, marginBottom: '2rem', lineHeight: 0.9, letterSpacing: '-0.04em' }}
          >
            BECOME A <br />
            <span style={{ color: 'transparent', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(to right, var(--accent-light), var(--cyan), var(--accent))' }}>
              BUG HUNTER
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontSize: '1.25rem', color: 'var(--text-2)', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: 1.6, fontWeight: 500 }}
          >
            The world's most immersive cybersecurity lab. Execute real exploits on live targets, capture flags, and master the art of ethical hacking.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/register" className="btn btn-primary btn-lg" style={{ padding: '1.2rem 3rem' }}>
              START YOUR LAB <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg" style={{ padding: '1.2rem 3rem' }}>
              EXPLORE MODULES
            </Link>
          </motion.div>
        </motion.div>

        {/* 3D-ish Preview Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40, rotateX: 10 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true }}
          style={{ marginTop: '8rem', position: 'relative', maxWidth: '1100px', width: '100%', perspective: '1000px' }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.15)', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.5 }} />
          <div style={{ position: 'relative', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(239,68,68,0.5)' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(234,179,8,0.5)' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(16,185,129,0.5)' }} />
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-4)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Target System: shop.vulnlab.internal</div>
              <Lock size={14} color="var(--text-4)" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
              <div style={{ padding: '2.5rem', background: 'var(--bg-1)', borderRight: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                  <Terminal size={18} color="var(--accent)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Interactive Terminal</span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', lineHeight: 1.8 }}>
                  <div style={{ color: 'var(--accent-light)' }}>$ nmap -sV 10.0.42.12</div>
                  <div style={{ color: 'var(--text-3)' }}>Starting Nmap 7.94...</div>
                  <div style={{ color: 'var(--text-3)' }}>PORT   STATE SERVICE</div>
                  <div style={{ color: 'var(--text-3)' }}>80/tcp open  http</div>
                  <div style={{ color: 'var(--text-3)' }}>...</div>
                  <div style={{ color: 'var(--accent-light)', marginTop: '1rem' }}>$ ffuf -u http://target.lab/FUZZ</div>
                  <div style={{ color: 'var(--text-2)' }}>/admin [200]</div>
                  <div style={{ color: 'var(--text-2)' }}>/config [200]</div>
                  <div style={{ color: 'var(--accent-light)', marginTop: '1rem' }}>$ _ <span style={{ animation: 'pulse 1s infinite' }}>|</span></div>
                </div>
              </div>
              
              <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, transparent 100%)' }}>
                 <div style={{ background: 'var(--bg-3)', border: '1px solid rgba(16,185,129,0.2)', padding: '2rem', borderRadius: '16px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem' }}><Shield size={24} color="var(--accent)" style={{ opacity: 0.1 }} /></div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(16,185,129,0.6)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.2em' }}>Exploit Result</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', marginBottom: '1rem', fontStyle: 'italic' }}>"Login bypass successful. Extracted flag..."</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', wordBreak: 'break-all', textShadow: '0 0 15px rgba(255,255,255,0.3)', fontFamily: 'var(--mono)' }}>
                      flag&#123;W3_4R3_LEG10N_2024&#125;
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Grid */}
      <section style={{ padding: '6rem 2rem', background: 'rgba(7,7,12,0.5)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="labs" style={{ padding: '10rem 2rem', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem' }}>Built for the <span style={{ color: 'var(--accent)' }}>New Era</span></h2>
            <p style={{ color: 'var(--text-2)', maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>We've combined the power of live virtual targets with a professional reconnaissance suite to give you the ultimate learning experience.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {features.map((f, i) => (
              <motion.div 
                key={i} whileHover={{ y: -10 }}
                style={{ padding: '3rem', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '24px', transition: 'all 0.3s ease' }}
              >
                <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', display: 'inline-block', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', lineHeight: 1.7, fontWeight: 500 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lab CTA */}
      <section style={{ padding: '12rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', zIndex: 10 }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'rgba(16,185,129,0.05)', filter: 'blur(160px)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '2rem', lineHeight: 1.1 }}>Ready to start the <span style={{ color: 'var(--accent)' }}>Operation</span>?</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '3rem', fontSize: '1.2rem', lineHeight: 1.7 }}>
            Join thousands of security researchers and bug hunters who are honing their skills on our platform. No setup required, just your browser.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ padding: '1.2rem 4rem', fontSize: '1.1rem' }}>
            CREATE FREE ACCOUNT
          </Link>
          <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-4)', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>No Credit Card Required • Instant Access</div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '5rem 2rem', borderTop: '1px solid var(--border)', background: 'var(--bg-0)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bug color="var(--accent)" size={16} />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>BUG<span style={{ color: 'var(--accent)' }}>LAB</span></span>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            <a href="#" style={{ color: 'var(--text-4)' }}>Twitter</a>
            <a href="#" style={{ color: 'var(--text-4)' }}>Discord</a>
            <a href="#" style={{ color: 'var(--text-4)' }}>GitHub</a>
            <a href="#" style={{ color: 'var(--text-4)' }}>Legal</a>
          </div>
          
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            © 2024 BUG BOUNTY SIMULATOR • PRO LABS
          </div>
        </div>
      </footer>
    </div>
  )
}

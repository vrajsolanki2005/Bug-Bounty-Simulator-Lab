import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ArrowLeft, Lightbulb, Flag, ChevronDown, ChevronUp, Monitor, Zap, Server } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import Terminal from '../components/lab/Terminal'
import FlagSubmit from '../components/lab/FlagSubmit'
import UnifiedTargetApp from '../components/lab/UnifiedTargetApp'
import EcommerceApp from '../components/lab/EcommerceApp'
import api from '../api/axios'

const diffClass = d => ({'Easy':'badge-easy','Medium':'badge-medium','Hard':'badge-hard','Expert':'badge-expert'}[d]||'badge-easy')

export default function Lab() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hints, setHints] = useState([])
  const [showHints, setShowHints] = useState(false)
  const [revealedHints, setRevealedHints] = useState([])
  const [solved, setSolved] = useState(false)
  const [capturedFlag, setCapturedFlag] = useState('')
  
  // Machine State
  const [machineState, setMachineState] = useState('offline') // offline, starting, online
  const [machineIp, setMachineIp] = useState('')
  const [bootText, setBootText] = useState('')

  useEffect(() => {
    // 1. Fetch Challenge Data
    api.get(`/challenges/${id}`)
      .then(r => {
        setChallenge(r.data.data)
        setSolved(r.data.data.user_status === 'solved')
        try { setHints(JSON.parse(r.data.data.hints || '[]')) } catch { setHints([]) }
      })
      .catch(() => { toast.error('Challenge not found'); navigate('/challenges') })
      .finally(() => setLoading(false))

    // 2. Check if lab is already running
    api.get('/labs/status')
      .then(r => {
        if (r.data.lab) {
          setMachineState('online')
          setMachineIp(r.data.lab.targetIp)
        }
      })
  }, [id])

  const startMachine = async () => {
    setMachineState('starting')
    setBootText('Connecting to Docker orchestrator...')
    
    try {
      setBootText('Provisioning isolated VM instance...')
      const { data } = await api.post('/labs/start', { challengeSlug: challenge.slug })
      
      setBootText('Configuring internal 10.x.x.x network...')
      setTimeout(() => setBootText('Mapping ports and VNC access...'), 500)
      
      if (data.success) {
        setTimeout(() => {
          setMachineState('online')
          setMachineIp(data.lab.targetIp)
          toast.success('Isolated Machine started successfully')
        }, 1500)
      }
    } catch (err) {
      setMachineState('offline')
      toast.error(err.response?.data?.message || 'Failed to start VM environment')
    }
  }

  const terminateMachine = async () => {
    try {
      await api.post('/labs/terminate')
      setMachineState('offline')
      setMachineIp('')
      toast('Machine terminated', { icon: '🛑', style: { background: '#0a0a0f', color: '#fff', border: '1px solid #ef4444' } })
    } catch (err) {
      toast.error('Failed to terminate machine')
    }
  }

  const revealHint = async (idx) => {
    if (revealedHints.includes(idx)) return
    await api.post(`/challenges/${id}/hint`, { hintIndex: idx })
    setRevealedHints(p => [...p, idx])
  }

  const handleFlagCaptured = (flag) => {
    setCapturedFlag(flag)
    toast.success('System: Vulnerability Exploit Confirmed! Flag Captured.', {
      icon: '🎉',
      duration: 6000,
      style: { border: '1px solid #00ff88', background: '#0a0a0f', color: '#00ff88' }
    })
  }

  if (loading) return <div className="app-shell"><Sidebar/><div className="content-with-sidebar loading"><div className="spinner"/></div></div>
  if (!challenge) return null

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content-with-sidebar main-content">
        <div style={{padding:'1rem 2rem', height: '100%', display: 'flex', flexDirection: 'column'}}>
          {/* Header */}
          <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem'}}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/challenges')}>
              <ArrowLeft size={14}/> Back
            </button>
            <div style={{flex:1}}>
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap'}}>
                <h1 style={{fontSize:'1.3rem'}}>{challenge.title}</h1>
                <span className={`badge ${diffClass(challenge.difficulty)}`}>{challenge.difficulty}</span>
                <span className="badge" style={{background:'var(--accent-dim)',color:'var(--accent)'}}>+{challenge.points}pts</span>
                {solved && <span className="badge badge-solved">✓ Solved</span>}
              </div>
            </div>
            
            {/* Top right machine control */}
            <div>
               {machineState === 'offline' ? (
                 <button className="btn btn-primary btn-sm" onClick={startMachine}><Zap size={14}/> Start Machine</button>
               ) : machineState === 'starting' ? (
                 <button className="btn btn-secondary btn-sm" disabled><div className="spinner" style={{width:12,height:12,borderWidth:2,marginRight:6}}/> Starting...</button>
               ) : (
                 <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                   <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
                     <span style={{fontSize:'0.65rem', color:'var(--text-3)', textTransform:'uppercase', fontWeight:800}}>Target IP</span>
                     <span className="font-mono" style={{color:'var(--cyan)', fontSize:'0.85rem', fontWeight:700}}>{machineIp}</span>
                   </div>
                   <button className="btn btn-danger btn-sm" onClick={terminateMachine}>Terminate</button>
                 </div>
               )}
            </div>
          </div>

          {/* Lab layout */}
          <div className="lab-layout" style={{ flex: 1, minHeight: 0 }}>
            {/* Left: Info + Terminal + Flag */}
            <div className="lab-left">
              {/* Brief */}
              <div className="card">
                <h3 style={{marginBottom:'0.75rem', fontSize:'0.9rem', color:'var(--accent)'}}>📋 Mission Brief</h3>
                <p style={{fontSize:'0.85rem', marginBottom:'0.75rem'}}>{challenge.description}</p>
                <div style={{background:'var(--bg-secondary)', borderRadius:'var(--radius-sm)', padding:'0.75rem', marginBottom:'0.75rem'}}>
                  <div style={{fontSize:'0.7rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.25rem'}}>Scenario</div>
                  <p style={{fontSize:'0.82rem'}}>{challenge.scenario}</p>
                </div>
                <div style={{background:'rgba(0,255,136,0.05)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'0.75rem'}}>
                  <div style={{fontSize:'0.7rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.25rem'}}>Objective</div>
                  <p style={{fontSize:'0.82rem'}}>{challenge.objective}</p>
                </div>
              </div>

              {/* Hints */}
              {hints.length > 0 && (
                <div className="card">
                  <button style={{display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', background:'none', border:'none', color:'var(--text-primary)', cursor:'pointer', fontWeight:700, fontSize:'0.9rem'}}
                    onClick={() => setShowHints(!showHints)}>
                    <span><Lightbulb size={14} style={{display:'inline', marginRight:6}} color="var(--yellow)"/>Hints ({hints.length})</span>
                    {showHints ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                  </button>
                  {showHints && (
                    <div style={{marginTop:'1rem', display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                      {hints.map((h, i) => (
                        <div key={i}>
                          {revealedHints.includes(i) ? (
                            <div style={{background:'var(--accent-dim)', border:'1px solid var(--border-hover)', borderRadius:'var(--radius-sm)', padding:'0.75rem', fontSize:'0.82rem'}}>
                              💡 {h}
                            </div>
                          ) : (
                            <button className="btn btn-secondary btn-sm w-full" onClick={() => revealHint(i)} style={{justifyContent:'center'}}>
                              Reveal Hint {i+1}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Terminal */}
              <Terminal />

              {/* Flag Submit */}
              <FlagSubmit challengeId={id} onSolved={() => setSolved(true)} autoFlag={capturedFlag} />
            </div>

            {/* Right: Interactive Target Application */}
            <div className="lab-right" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="lab-target-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{width:8,height:8,borderRadius:'50%',background: machineState === 'online' ? 'var(--accent)' : 'var(--text-muted)',display:'inline-block', boxShadow: machineState==='online' ? '0 0 10px var(--accent)' : 'none'}}/>
                  {machineState === 'online' ? (challenge.slug.startsWith('ecom') ? `shop.vulncorp.internal (${machineIp})` : `target-system.internal.corp (${machineIp})`) : 'Target Machine Offline'}
                </div>
                <Server size={14} color={machineState === 'online' ? 'var(--accent)' : 'var(--text-muted)'} />
              </div>
              
              <div className="lab-target-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {machineState === 'offline' && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-1)' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <Monitor size={32} color="var(--text-4)" />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-2)' }}>Virtual Machine Offline</h3>
                    <p style={{ color: 'var(--text-4)', fontSize: '0.85rem', maxWidth: '300px', textAlign: 'center', marginBottom: '2rem' }}>
                      Start the machine to boot the isolated vulnerable environment and access the target application.
                    </p>
                    <button className="btn btn-primary" onClick={startMachine}>
                      <Zap size={16} /> Start Machine
                    </button>
                  </div>
                )}
                
                {machineState === 'starting' && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-1)' }}>
                    <div className="spinner" style={{ width: 50, height: 50, borderWidth: 3, marginBottom: '2rem', borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>Booting Instance...</h3>
                    <div className="font-mono text-xs text-muted mt-2" style={{ background: 'var(--bg-2)', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--cyan)' }}>{'> '}</span> {bootText} <span className="animate-pulse">_</span>
                    </div>
                  </div>
                )}

                {machineState === 'online' && (
                  <div style={{ flex: 1, animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', background: '#334155', borderRadius: '0 0 8px 8px' }}>
                    {/* Simulated OS Browser Chrome */}
                    <div style={{ background: '#1e293b', borderBottom: '1px solid #0f172a', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '6px', marginLeft: '0.5rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
                      </div>
                      <div style={{ flex: 1, background: '#0f172a', borderRadius: '6px', padding: '0.35rem 1rem', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', border: '1px solid #334155' }}>
                        <span style={{color: '#10b981'}}>🔒</span>
                        {challenge.slug.startsWith('ecom') ? 'https://shop.vulncorp.internal' : 'https://target-system.internal.corp'}
                      </div>
                    </div>
                    {/* Simulated Browser Viewport */}
                    <div style={{ flex: 1, background: '#fff', overflow: 'hidden', position: 'relative' }}>
                      {challenge.slug.startsWith('ecom') ? (
                        <EcommerceApp onFlagCaptured={handleFlagCaptured} />
                      ) : (
                        <UnifiedTargetApp onFlagCaptured={handleFlagCaptured} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}} />
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import { Search, Play, History, ShieldAlert, Cpu, Network, CheckCircle } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import api from '../api/axios'

export default function Scanner() {
  const [target, setTarget] = useState('')
  const [scanType, setScanType] = useState('quick')
  const [profiles, setProfiles] = useState([])
  const [history, setHistory] = useState([])
  const [activeScan, setActiveScan] = useState(null) // { id, lines: [], results: null }
  const [loading, setLoading] = useState(false)
  const [fetchingHist, setFetchingHist] = useState(true)

  const socketRef = useRef(null)
  const outputRef = useRef(null)

  useEffect(() => {
    // Load profiles & history
    api.get('/scanner/meta/profiles').then(r => setProfiles(r.data.data)).catch(console.error)
    api.get('/scanner/history').then(r => {
      setHistory(r.data.data)
      setFetchingHist(false)
    }).catch(console.error)

    // Setup Socket
    const token = localStorage.getItem('accessToken')
    socketRef.current = io('/', { auth: { token } })

    socketRef.current.on('scan_output', ({ line, scan_id }) => {
      setActiveScan(prev => {
        if (prev?.id !== scan_id) return prev
        return { ...prev, lines: [...prev.lines, line] }
      })
    })

    socketRef.current.on('scan_complete', ({ scan_id, results }) => {
      setActiveScan(prev => {
        if (prev?.id !== scan_id) return prev
        return { ...prev, results, status: 'completed' }
      })
      toast.success('Scan completed!')
      // Refresh history
      api.get('/scanner/history').then(r => setHistory(r.data.data))
    })

    socketRef.current.on('scan_error', ({ scan_id, error }) => {
      toast.error(`Scan error: ${error}`)
      setActiveScan(prev => prev?.id === scan_id ? { ...prev, error, status: 'failed' } : prev)
    })

    return () => socketRef.current?.disconnect()
  }, [])

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [activeScan?.lines])

  const startScan = async () => {
    if (!target) return toast.error('Enter a target')
    setLoading(true)
    try {
      const { data } = await api.post('/scanner/scan', { target, scan_type: scanType })
      setActiveScan({ id: data.scan_id, target, scanType, lines: [], status: 'running' })
      socketRef.current.emit('join_scan', { scan_id: data.scan_id })
      toast.success('Scan started')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start scan')
    } finally {
      setLoading(false)
    }
  }

  const viewHistoricalScan = (scan) => {
    if (scan.status === 'running') {
      socketRef.current.emit('join_scan', { scan_id: scan.id })
      setActiveScan({ id: scan.id, target: scan.target, scanType: scan.scan_type, lines: ['Reconnected to running scan...'], status: 'running' })
    } else {
      setActiveScan({
        id: scan.id,
        target: scan.target,
        scanType: scan.scan_type,
        status: scan.status,
        results: scan.results,
        lines: ['Loaded historical scan.']
      })
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content-with-sidebar main-content">
        <div className="page-content">
          <div style={{marginBottom:'2rem'}}>
            <h1 style={{fontSize:'1.75rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
              <Network color="var(--accent)" /> Real Port Scanner
            </h1>
            <p className="text-muted text-sm">Run actual Nmap scans against external targets. Please use responsibly.</p>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 300px', gap:'1.5rem', alignItems:'start'}}>
            {/* Left: Scan Controls & Output */}
            <div>
              <div className="card mb-3" style={{display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'flex-end'}}>
                <div className="form-group" style={{flex:1, minWidth:200, marginBottom:0}}>
                  <label className="form-label">Target (IP or Domain)</label>
                  <input className="form-input" placeholder="scanme.nmap.org" value={target} onChange={e=>setTarget(e.target.value)} disabled={loading || activeScan?.status === 'running'} />
                </div>
                <div className="form-group" style={{width:200, marginBottom:0}}>
                  <label className="form-label">Scan Profile</label>
                  <select className="form-input form-select" value={scanType} onChange={e=>setScanType(e.target.value)} disabled={loading || activeScan?.status === 'running'}>
                    {profiles.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={startScan} disabled={loading || activeScan?.status === 'running' || !target} style={{height:38}}>
                  {activeScan?.status === 'running' ? <><div className="spinner" style={{width:14,height:14}}/> Scanning...</> : <><Play size={16}/> Start Scan</>}
                </button>
              </div>

              {activeScan && (
                <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="card">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                    <h3 style={{fontSize:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                      <Cpu size={16} color="var(--accent)" /> Scan Output
                    </h3>
                    {activeScan.status === 'running' && <span className="badge badge-medium animate-pulse">Running</span>}
                    {activeScan.status === 'completed' && <span className="badge badge-solved">Completed</span>}
                    {activeScan.status === 'failed' && <span className="badge badge-hard">Failed</span>}
                  </div>

                  <div className="scan-output" ref={outputRef}>
                    {activeScan.lines.map((l, i) => <div key={i}>{l || '\u00a0'}</div>)}
                  </div>

                  {activeScan.results && activeScan.results.ports && activeScan.results.ports.length > 0 && (
                    <div style={{marginTop:'1.5rem'}}>
                      <h4 style={{marginBottom:'0.75rem', fontSize:'0.9rem', color:'var(--cyan)'}}>Discovered Ports</h4>
                      <table className="port-table">
                        <thead><tr><th>Port</th><th>State</th><th>Service</th><th>Version</th></tr></thead>
                        <tbody>
                          {activeScan.results.ports.map((p, i) => (
                            <tr key={i}>
                              <td className="port-num">{p.port}/{p.protocol}</td>
                              <td className="port-open">{p.state}</td>
                              <td>{p.service}</td>
                              <td className="text-muted">{p.product} {p.version}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {activeScan.results && activeScan.results.ports && activeScan.results.ports.length === 0 && (
                    <p className="text-muted text-sm mt-2">No open ports found.</p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right: History */}
            <div className="card">
              <h3 style={{fontSize:'1rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                <History size={16} /> Scan History
              </h3>
              {fetchingHist ? <div className="loading" style={{minHeight:100}}><div className="spinner"/></div> : (
                <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                  {history.length === 0 && <p className="text-muted text-sm">No scans run yet.</p>}
                  {history.map(h => (
                    <div key={h.id} onClick={() => viewHistoricalScan(h)} style={{padding:'0.75rem', background:'var(--bg-secondary)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', cursor:'pointer', transition:'all 0.2s'}}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.25rem'}}>
                        <strong style={{fontSize:'0.85rem'}}>{h.target}</strong>
                        {h.status === 'completed' && <CheckCircle size={14} color="var(--cyan)" />}
                        {h.status === 'running' && <div className="spinner" style={{width:12,height:12,borderTopColor:'var(--orange)'}}/>}
                        {h.status === 'failed' && <ShieldAlert size={14} color="var(--red)" />}
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-muted)'}}>
                        <span>{h.scan_type}</span>
                        <span>{new Date(h.started_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

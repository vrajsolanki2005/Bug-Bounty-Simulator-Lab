import { useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

/**
 * The VulnerableApp component dynamically renders a simulated
 * web interface based on the challenge type.
 * It sends "exploit" payloads to the backend validation endpoint.
 */
export default function VulnerableApp({ challenge }) {
  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('')
  const [simOutput, setSimOutput] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleExploit = async (payloadOverride) => {
    setLoading(true)
    setSimOutput(null)
    const payload = payloadOverride || { payload: input1 }

    try {
      const { data } = await api.post('/labs/exploit', { challenge_id: challenge.id, payload })

      if (data.success) {
        setSimOutput({ type: 'success', text: data.message, flag: data.flag })
        // Display the flag to the user to submit on the left
        toast.success('Exploit successful! Flag retrieved.')
      } else {
        setSimOutput({ type: 'error', text: data.message })
      }
    } catch (err) {
      setSimOutput({ type: 'error', text: err.response?.data?.message || 'Server error' })
    } finally {
      setLoading(false)
    }
  }

  // --- UI Renderers based on Challenge Category / Slug ---

  if (challenge.slug === 'sqli' || challenge.slug === 'auth-bypass') {
    return (
      <div style={{maxWidth:350, margin:'0 auto'}}>
        <h2 style={{fontSize:'1.2rem', marginBottom:'1rem', textAlign:'center'}}>Admin Login</h2>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input className="form-input" value={input1} onChange={e=>setInput1(e.target.value)} placeholder="admin" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={input2} onChange={e=>setInput2(e.target.value)} placeholder="••••••" />
        </div>
        <button className="btn btn-primary w-full mt-2" onClick={() => handleExploit(input1)} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {simOutput && <SimAlert out={simOutput} />}
      </div>
    )
  }

  if (challenge.category === 'XSS' || challenge.slug.includes('xss')) {
    return (
      <div>
        <h2 style={{fontSize:'1.2rem', marginBottom:'1rem'}}>Search Products</h2>
        <div style={{display:'flex', gap:'0.5rem', marginBottom:'1rem'}}>
          <input className="form-input" value={input1} onChange={e=>setInput1(e.target.value)} placeholder="<script>..." style={{flex:1}} />
          <button className="btn btn-primary" onClick={() => handleExploit(input1)} disabled={loading}>Search</button>
        </div>
        {input1 && !simOutput && <div style={{padding:'1rem', background:'var(--bg-secondary)', border:'1px dashed var(--border)', marginTop:'1rem'}}>
          <p className="text-muted text-sm mb-1">Search results for:</p>
          <div style={{fontFamily:'var(--font-mono)', color:'var(--red)', wordBreak:'break-all'}}>{input1}</div>
        </div>}
        {simOutput && <SimAlert out={simOutput} />}
      </div>
    )
  }

  if (challenge.slug === 'idor') {
    return (
      <div>
        <h2 style={{fontSize:'1.2rem', marginBottom:'1rem'}}>My Profile</h2>
        <p className="text-muted text-sm mb-2">You are currently logged in as User ID 42.</p>
        <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
          <span style={{fontFamily:'var(--font-mono)'}}>api/v1/profile?id=</span>
          <input className="form-input" value={input1} onChange={e=>setInput1(e.target.value)} placeholder="42" style={{width:100}} />
          <button className="btn btn-primary" onClick={() => handleExploit({ id: input1, own_id: 42 })} disabled={loading}>Fetch</button>
        </div>
        {simOutput && <SimAlert out={simOutput} />}
      </div>
    )
  }

  if (challenge.category === 'File Inclusion' || challenge.slug === 'path-traversal') {
    return (
      <div>
        <h2 style={{fontSize:'1.2rem', marginBottom:'1rem'}}>Document Viewer</h2>
        <div style={{display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap'}}>
          <span style={{fontFamily:'var(--font-mono)'}}>?file=</span>
          <input className="form-input" value={input1} onChange={e=>setInput1(e.target.value)} placeholder="report.pdf" style={{flex:1, minWidth:200}} />
          <button className="btn btn-primary" onClick={() => handleExploit(input1)} disabled={loading}>Load</button>
        </div>
        <div style={{background:'#000', padding:'1rem', marginTop:'1rem', minHeight:150, fontFamily:'var(--font-mono)', fontSize:'0.8rem', color:'var(--text-muted)'}}>
          {simOutput ? (simOutput.type === 'success' ? 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n...' : 'Error: File not found') : 'Select a file to view...'}
        </div>
        {simOutput && <SimAlert out={simOutput} />}
      </div>
    )
  }

  if (challenge.category === 'Injection' && challenge.slug === 'command-injection') {
    return (
      <div>
        <h2 style={{fontSize:'1.2rem', marginBottom:'1rem'}}>Network Diagnostic Tool</h2>
        <p className="text-muted text-sm mb-2">Ping a host to check connectivity.</p>
        <div style={{display:'flex', gap:'0.5rem'}}>
          <input className="form-input" value={input1} onChange={e=>setInput1(e.target.value)} placeholder="8.8.8.8" style={{flex:1}} />
          <button className="btn btn-primary" onClick={() => handleExploit(input1)} disabled={loading}>Ping</button>
        </div>
        {simOutput && <SimAlert out={simOutput} />}
      </div>
    )
  }

  if (challenge.slug === 'business-logic-flaw') {
     return (
      <div>
        <h2 style={{fontSize:'1.2rem', marginBottom:'1rem'}}>Premium Hacker Hoodie ($99)</h2>
        <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
          <label>Qty:</label>
          <input type="number" className="form-input" value={input1} onChange={e=>setInput1(e.target.value)} style={{width:100}} />
          <button className="btn btn-primary" onClick={() => handleExploit({ quantity: input1 })} disabled={loading}>Add to Cart</button>
        </div>
        {simOutput && <SimAlert out={simOutput} />}
      </div>
    )
  }

  // Default fallback for other challenges (Generic JSON Payload Sender)
  return (
    <div>
      <h2 style={{fontSize:'1.2rem', marginBottom:'1rem'}}>Custom Exploit Sender</h2>
      <p className="text-muted text-sm mb-2">Construct your JSON payload or raw string to send to the backend validator.</p>
      <textarea className="form-input form-textarea" value={input1} onChange={e=>setInput1(e.target.value)} placeholder='{"parameter": "value"}' />
      <button className="btn btn-primary mt-2" onClick={() => {
        let p = input1;
        try { p = JSON.parse(input1) } catch {}
        handleExploit(p)
      }} disabled={loading}>
        Send Payload
      </button>
      {simOutput && <SimAlert out={simOutput} />}
    </div>
  )
}

function SimAlert({ out }) {
  const isOk = out.type === 'success'
  return (
    <div style={{
      marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-sm)',
      background: isOk ? 'rgba(0,255,136,0.1)' : 'rgba(255,71,87,0.1)',
      border: `1px solid ${isOk ? 'var(--accent)' : 'var(--red)'}`
    }}>
      <strong style={{color: isOk ? 'var(--accent)' : 'var(--red)', display:'block', marginBottom:'0.5rem'}}>
        {isOk ? 'Success!' : 'Failed'}
      </strong>
      <p style={{fontSize:'0.85rem', marginBottom: isOk && out.flag ? '1rem' : 0}}>{out.text}</p>
      {isOk && out.flag && (
        <div style={{background:'#000', padding:'0.75rem', borderRadius:'4px', fontFamily:'var(--font-mono)', color:'var(--cyan)', display:'inline-block'}}>
          {out.flag}
        </div>
      )}
    </div>
  )
}

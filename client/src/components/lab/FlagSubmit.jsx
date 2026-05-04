import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Flag, Send, CheckCircle } from 'lucide-react'
import api from '../../api/axios'

export default function FlagSubmit({ challengeId, onSolved, autoFlag }) {
  const [flag, setFlag] = useState('')
  const [loading, setLoading] = useState(false)
  const [solved, setSolved] = useState(false)

  useEffect(() => {
    if (autoFlag) setFlag(autoFlag)
  }, [autoFlag])

  const submit = async () => {
    if (!flag.trim()) { toast.error('Enter a flag first'); return }
    setLoading(true)
    try {
      const { data } = await api.post(`/challenges/${challengeId}/submit`, { flag })
      if (data.correct || data.already_solved) {
        setSolved(true)
        toast.success(data.message || '🎉 Correct flag!')
        onSolved?.(data.points_earned)
      } else {
        toast.error(data.message || 'Wrong flag. Try again.')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally { setLoading(false) }
  }

  if (solved) return (
    <div className="card" style={{ borderColor: 'var(--cyan)', textAlign: 'center' }}>
      <CheckCircle size={40} color="var(--cyan)" style={{ margin: '0 auto 0.5rem' }} />
      <div style={{ color: 'var(--cyan)', fontWeight: 700 }}>Challenge Solved! 🎉</div>
    </div>
  )

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Flag size={16} color="var(--accent)" />
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Submit Flag</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          className="form-input font-mono"
          placeholder="flag{...}"
          value={flag}
          onChange={e => setFlag(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{ flex: 1, color: autoFlag ? 'var(--accent)' : 'inherit' }}
        />
        <button className="btn btn-primary" onClick={submit} disabled={loading}>
          <Send size={14} />{loading ? 'Checking...' : 'Submit'}
        </button>
      </div>
      <p className="text-xs text-muted mt-1">Exploit the vulnerability, then paste your flag here.</p>
    </div>
  )
}


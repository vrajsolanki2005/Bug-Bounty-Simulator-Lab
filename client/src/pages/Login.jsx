import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Bug, Mail, Lock, LogIn } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.accessToken, data.refreshToken, data.user)
      toast.success(`Welcome back, ${data.user.username}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <motion.div className="auth-card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <div style={{textAlign:'center', marginBottom:'2rem'}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:'0.5rem', fontWeight:900, fontSize:'1.5rem', marginBottom:'0.5rem', letterSpacing:'-0.03em'}}>
            <div style={{ width: '36px', height: '36px', background: 'var(--accent)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--accent-glow)' }}>
              <Bug size={20} color="#000" />
            </div>
            BUG<span style={{color:'var(--accent)'}}>LAB</span>
          </div>
          <p style={{color:'var(--text-3)', fontSize:'0.9rem', fontWeight:600}}>Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handle}>
            <div className="form-group">
              <label className="form-label"><Mail size={12} style={{display:'inline', verticalAlign:'middle', marginRight:'4px'}}/> Email</label>
              <input className="form-input" type="email" placeholder="hacker@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label"><Lock size={12} style={{display:'inline', verticalAlign:'middle', marginRight:'4px'}}/> Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
            </div>
            <button className="btn btn-primary w-full mt-2" type="submit" disabled={loading}>
              <LogIn size={16}/>{loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{fontSize:'0.85rem', color:'var(--text-3)', textAlign:'center', marginTop:'1.5rem', fontWeight:500}}>
            No account? <Link to="/register" style={{fontWeight:700}}>Create one free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

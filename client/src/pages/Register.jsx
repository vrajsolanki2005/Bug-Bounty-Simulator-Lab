import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Bug, User, Mail, Lock, UserPlus } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ username:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = async e => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      login(data.accessToken, data.refreshToken, data.user)
      toast.success('Account created! Welcome to BugBountyLab 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
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
          <p style={{color:'var(--text-3)', fontSize:'0.9rem', fontWeight:600}}>Create your free hacker account</p>
        </div>
        <div className="card">
          <form onSubmit={handle}>
            <div className="form-group">
              <label className="form-label"><User size={12} style={{display:'inline', verticalAlign:'middle', marginRight:'4px'}}/> Username</label>
              <input className="form-input" placeholder="h4cker_one" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required minLength={3} maxLength={30} />
            </div>
            <div className="form-group">
              <label className="form-label"><Mail size={12} style={{display:'inline', verticalAlign:'middle', marginRight:'4px'}}/> Email</label>
              <input className="form-input" type="email" placeholder="hacker@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label"><Lock size={12} style={{display:'inline', verticalAlign:'middle', marginRight:'4px'}}/> Password</label>
              <input className="form-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={8} />
            </div>
            <button className="btn btn-primary w-full mt-2" type="submit" disabled={loading}>
              <UserPlus size={16}/>{loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p style={{fontSize:'0.85rem', color:'var(--text-3)', textAlign:'center', marginTop:'1.5rem', fontWeight:500}}>
            Already have an account? <Link to="/login" style={{fontWeight:700}}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

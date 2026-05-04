import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

export default function Terminal() {
  const [lines, setLines] = useState([
    { type: 'info', text: '╔══════════════════════════════════════════╗' },
    { type: 'info', text: '║   Bug Bounty Simulator Terminal v1.0     ║' },
    { type: 'info', text: '╚══════════════════════════════════════════╝' },
    { type: 'text', text: "Type 'help' for available commands." },
    { type: 'text', text: '' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const [busy, setBusy] = useState(false)
  const bodyRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    socketRef.current = io('/terminal', { auth: { token }, transports: ['websocket'] })

    socketRef.current.on('output', ({ type, line }) => {
      setLines(p => [...p, { type, text: line }])
    })
    socketRef.current.on('clear', () => setLines([]))
    socketRef.current.on('prompt', () => setBusy(false))
    socketRef.current.on('connect_error', () => {
      setLines(p => [...p, { type: 'error', text: '[!] Socket connection failed — using HTTP fallback.' }])
    })

    return () => socketRef.current?.disconnect()
  }, [])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  const submit = useCallback(async () => {
    if (!input.trim() || busy) return
    const cmd = input.trim()
    setLines(p => [...p, { type: 'input', text: `$ ${cmd}` }])
    setHistory(p => [cmd, ...p.slice(0, 49)])
    setHistIdx(-1)
    setInput('')
    setBusy(true)

    if (socketRef.current?.connected) {
      socketRef.current.emit('command', cmd)
    } else {
      // HTTP fallback
      try {
        const res = await fetch('/api/terminal/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
          body: JSON.stringify({ command: cmd })
        })
        const data = await res.json()
        const newLines = (data.output || []).map(text => ({ type: 'text', text }))
        setLines(p => [...p, ...newLines])
      } catch {
        setLines(p => [...p, { type: 'error', text: '[!] Command failed.' }])
      }
      setBusy(false)
    }
  }, [input, busy])

  const onKey = (e) => {
    if (e.key === 'Enter') { submit(); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(idx); setInput(history[idx] || '')
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx); setInput(idx === -1 ? '' : history[idx])
    }
  }

  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="terminal-dot red" />
        <div className="terminal-dot yellow" />
        <div className="terminal-dot green" />
        <span className="terminal-title">bugbounty@lab:~$</span>
      </div>
      <div className="terminal-body" ref={bodyRef}>
        {lines.map((l, i) => (
          <div key={i} className={`terminal-line ${l.type}`}>{l.text || '\u00a0'}</div>
        ))}
        {busy && <div className="terminal-line animate-pulse">▌</div>}
      </div>
      <div className="terminal-input-row">
        <span className="terminal-prompt">$</span>
        <input
          className="terminal-cmd-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="type a command..."
          disabled={busy}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  )
}

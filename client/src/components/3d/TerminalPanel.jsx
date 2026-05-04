import { useState, useRef, useEffect } from 'react'
import { Html } from '@react-three/drei'

export default function TerminalPanel() {
  const [history, setHistory] = useState([
    'Bug Bounty Simulator OS v2.0.4',
    'Connection established...',
    'type "help" for commands.'
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history])

  const handleCommand = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      const cmd = input.trim()
      let output = []
      
      if (cmd === 'help') {
        output = ['Available commands:', '- nmap', '- subfinder', '- clear', '- whoami']
      } else if (cmd.startsWith('nmap')) {
        output = ['Starting Nmap 7.94...', 'Host is up (0.013s latency).', 'PORT   STATE SERVICE', '22/tcp open  ssh', '80/tcp open  http', 'Nmap done: 1 IP address scanned.']
      } else if (cmd.startsWith('subfinder')) {
        output = ['Enumerating subdomains...', 'api.target.local', 'admin.target.local', 'dev.target.local']
      } else if (cmd === 'clear') {
        setHistory([])
        setInput('')
        return
      } else if (cmd === 'whoami') {
        output = ['hacker']
      } else {
        output = [`Command not found: ${cmd}`]
      }

      setHistory(prev => [...prev, `$ ${cmd}`, ...output])
      setInput('')
    }
  }

  return (
    <Html transform distanceFactor={1.5} position={[0, 0, 0]} style={{ width: '400px' }}>
      <div className="bg-[#050508]/90 backdrop-blur-md border border-cyber-accent/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,255,136,0.15)] pointer-events-auto select-text">
        {/* Header */}
        <div className="bg-cyber-accent/10 px-4 py-2 border-b border-cyber-accent/20 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-cyber-accent"></div>
          <span className="text-gray-400 font-mono text-xs ml-auto">root@recon-terminal</span>
        </div>
        
        {/* Body */}
        <div className="p-4 h-[300px] overflow-y-auto font-mono text-sm">
          {history.map((line, i) => (
            <div key={i} className={`${line.startsWith('$') ? 'text-cyber-blue' : 'text-[#a0f0a0]'} mb-1`}>
              {line}
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-cyber-accent">$</span>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleCommand}
              className="bg-transparent border-none outline-none text-[#a0f0a0] flex-1 font-mono w-full"
              autoFocus
              spellCheck="false"
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
    </Html>
  )
}

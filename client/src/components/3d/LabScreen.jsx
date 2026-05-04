import { useState } from 'react'
import { Html } from '@react-three/drei'

export default function LabScreen() {
  const [payload, setPayload] = useState('')
  const [result, setResult] = useState(null)

  const handleSubmit = () => {
    if (payload.includes('<script>') || payload.includes('alert(')) {
      setResult({ type: 'success', text: 'XSS Executed! Flag: flag{3d_v1su4l1z4t10n_m4st3r}' })
    } else {
      setResult({ type: 'error', text: 'Payload reflected safely. No exploit triggered.' })
    }
  }

  return (
    <Html transform distanceFactor={1.2} position={[0, 0, 0]} style={{ width: '600px' }}>
      <div className="bg-[#0f0f1a]/95 backdrop-blur-xl border-2 border-cyber-blue/40 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,212,255,0.2)] pointer-events-auto">
        {/* Browser Bar */}
        <div className="bg-[#1a1a2e] px-4 py-3 border-b border-cyber-blue/20 flex items-center gap-4">
          <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-cyber-bg border border-gray-600"></div>
             <div className="w-3 h-3 rounded-full bg-cyber-bg border border-gray-600"></div>
             <div className="w-3 h-3 rounded-full bg-cyber-bg border border-gray-600"></div>
          </div>
          <div className="flex-1 bg-[#0a0a0f] rounded px-3 py-1 font-mono text-xs text-gray-400 border border-gray-800 text-center">
            http://target.buglab.local/search?q=
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Product Search</h2>
          <p className="text-gray-400 mb-6">Find exactly what you're looking for in our catalog.</p>
          
          <div className="flex gap-2 mb-8">
            <input 
              type="text" 
              className="flex-1 bg-cyber-bg border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:border-cyber-blue transition-colors"
              placeholder="Enter search query..."
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
            <button 
              className="bg-cyber-blue text-black font-bold px-6 py-2 rounded-md hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,212,255,0.4)]"
              onClick={handleSubmit}
            >
              Search
            </button>
          </div>

          {result && (
            <div className={`p-4 rounded-md border ${result.type === 'success' ? 'bg-cyber-accent/10 border-cyber-accent text-cyber-accent' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
               <div className="font-bold mb-1">{result.type === 'success' ? 'Exploit Successful!' : 'Search Results'}</div>
               <div className="font-mono text-sm">{result.text}</div>
            </div>
          )}

          {!result && (
             <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-md text-gray-600">
                Awaiting input...
             </div>
          )}
        </div>
      </div>
    </Html>
  )
}

import { Html } from '@react-three/drei'

export default function DashboardPanel() {
  return (
    <Html transform distanceFactor={1.5} position={[0, 0, 0]} style={{ width: '300px' }}>
      <div className="bg-cyber-panel/90 backdrop-blur-md border border-purple-500/30 rounded-lg p-5 shadow-[0_0_30px_rgba(139,92,246,0.15)] pointer-events-auto">
        <h3 className="text-purple-400 font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Live Telemetry
        </h3>
        
        <div className="space-y-4">
          <div className="bg-cyber-bg p-3 rounded border border-gray-800">
            <div className="text-gray-500 text-xs mb-1">Global Rank</div>
            <div className="text-2xl font-bold text-white">#1,337</div>
          </div>
          
          <div className="bg-cyber-bg p-3 rounded border border-gray-800">
            <div className="text-gray-500 text-xs mb-1">Active Challenge</div>
            <div className="text-cyber-blue font-mono text-sm">Reflected XSS</div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
               <div className="bg-cyber-blue h-full w-[45%] shadow-[0_0_10px_rgba(0,212,255,0.8)]"></div>
            </div>
          </div>

          <div className="bg-cyber-bg p-3 rounded border border-gray-800">
            <div className="text-gray-500 text-xs mb-2">Collected Flags</div>
            <div className="flex flex-wrap gap-2">
               <span className="w-6 h-6 rounded bg-cyber-accent/20 border border-cyber-accent flex items-center justify-center text-xs">🚩</span>
               <span className="w-6 h-6 rounded bg-cyber-accent/20 border border-cyber-accent flex items-center justify-center text-xs">🚩</span>
               <span className="w-6 h-6 rounded bg-cyber-accent/20 border border-cyber-accent flex items-center justify-center text-xs">🚩</span>
               <span className="w-6 h-6 rounded border border-gray-800 flex items-center justify-center text-xs opacity-30">🚩</span>
            </div>
          </div>
        </div>
      </div>
    </Html>
  )
}

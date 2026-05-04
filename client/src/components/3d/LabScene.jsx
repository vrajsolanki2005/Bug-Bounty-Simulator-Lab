import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Environment, ContactShadows, PresentationControls, Float } from '@react-three/drei'
import TerminalPanel from './TerminalPanel'
import LabScreen from './LabScreen'
import DashboardPanel from './DashboardPanel'

export default function LabScene() {
  return (
    <div className="w-full h-screen bg-cyber-bg relative overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={['#050508']} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#00ff88" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00d4ff" />

        <Environment preset="city" />

        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 6, Math.PI / 6]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          {/* Central Lab Screen */}
          <Float rotationIntensity={0.2} floatIntensity={0.5} speed={2}>
            <group position={[0, 0.2, 0]}>
              <LabScreen />
            </group>
          </Float>

          {/* Left Terminal Panel */}
          <Float rotationIntensity={0.4} floatIntensity={0.8} speed={1.5}>
            <group position={[-2.8, -0.5, 0.5]} rotation={[0, Math.PI / 6, 0]}>
              <TerminalPanel />
            </group>
          </Float>

          {/* Right Dashboard Panel */}
          <Float rotationIntensity={0.3} floatIntensity={0.6} speed={1.8}>
            <group position={[2.8, 0, 0.2]} rotation={[0, -Math.PI / 8, 0]}>
              <DashboardPanel />
            </group>
          </Float>
        </PresentationControls>

        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={20} blur={2} far={4.5} color="#00ff88" />
      </Canvas>

      {/* 2D Overlay UI */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyber-accent rounded-lg flex items-center justify-center text-black font-bold text-xl shadow-[0_0_15px_rgba(0,255,136,0.5)]">
            🐛
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">BugBounty<span className="text-cyber-accent">Lab</span></h1>
            <p className="text-cyber-blue font-mono text-xs uppercase tracking-widest">Immersive Training Environment</p>
          </div>
        </div>
        <div className="pointer-events-auto">
          <button className="bg-transparent border border-cyber-accent text-cyber-accent px-6 py-2 rounded font-mono hover:bg-cyber-accent hover:text-black transition-all shadow-[0_0_10px_rgba(0,255,136,0.2)] hover:shadow-[0_0_20px_rgba(0,255,136,0.6)]">
            ENTER SYSTEM
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
         <p className="text-gray-500 font-mono text-sm animate-pulse">Drag to rotate • Scroll to zoom</p>
      </div>
    </div>
  )
}

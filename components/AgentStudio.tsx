'use client'

import { useState, useEffect } from 'react'
import AgentStation from './AgentStation'

interface AgentData {
  id: string; name: string; emoji: string; role: string; model: string; color: string; status: string; task: string; lastActive: string
}

const POSITIONS: Record<string, { x: number; y: number }> = {
  scout: { x: 100, y: 80 },
  iris: { x: 380, y: 80 },
  fern: { x: 660, y: 80 },
  daisy: { x: 100, y: 340 },
  billy: { x: 380, y: 340 },
  milo: { x: 660, y: 340 },
  harper: { x: 240, y: 560 },
  kobe: { x: 520, y: 560 },
}

export default function AgentStudio() {
  const [agents, setAgents] = useState<AgentData[]>([])
  const [studioTime, setStudioTime] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/agent-status')
        const data = await res.json()
        setAgents(data.agents)
        setStudioTime(data.studioTime)
      } catch {
        // fallback
      }
      setLoaded(true)
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  // Count active agents for dynamic particle intensity
  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'working')
  const particleCount = 20 + activeAgents.length * 15

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800">
      {/* Enhanced ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: particleCount }, (_, i) => {
          const isEnergyParticle = i < activeAgents.length * 15
          return (
            <div key={i} className={`absolute ${isEnergyParticle ? 'w-1 h-1 bg-cyan-400/60 animate-energy-drift' : 'w-0.5 h-0.5 bg-white/20 animate-drift'} rounded-full`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${isEnergyParticle ? 8 + Math.random() * 12 : 15 + Math.random() * 20}s`,
              }} />
          )
        })}
      </div>

      {/* Electric arcs between active agents */}
      {activeAgents.length > 1 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {activeAgents.slice(0, -1).map((agent, i) => {
            const nextAgent = activeAgents[i + 1]
            const pos1 = POSITIONS[agent.id]
            const pos2 = POSITIONS[nextAgent.id]
            if (!pos1 || !pos2) return null
            return (
              <line
                key={`arc-${agent.id}-${nextAgent.id}`}
                x1={pos1.x + 72}
                y1={pos1.y + 40}
                x2={pos2.x + 72}
                y2={pos2.y + 40}
                stroke="url(#electric-gradient)"
                strokeWidth="1"
                opacity="0.4"
                className="animate-pulse"
                strokeDasharray="4,6"
              />
            )
          })}
          <defs>
            <linearGradient id="electric-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Studio time - much brighter */}
      {studioTime && (
        <div className="absolute top-6 right-8 text-white text-sm font-mono z-10 bg-black/30 px-3 py-2 rounded-lg border border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
            <span className="font-semibold">Studio Live — {studioTime}</span>
          </div>
        </div>
      )}

      {/* Legend - much brighter and more prominent */}
      <div className="absolute top-6 left-8 flex gap-6 text-xs text-white z-10 bg-black/30 px-4 py-2 rounded-lg border border-white/20">
        {[
          { label: 'Active', color: 'bg-green-400', count: agents.filter(a => a.status === 'active').length },
          { label: 'Working', color: 'bg-blue-400', count: agents.filter(a => a.status === 'working').length },
          { label: 'Complete', color: 'bg-emerald-400', count: agents.filter(a => a.status === 'complete').length },
          { label: 'Idle', color: 'bg-amber-400', count: agents.filter(a => a.status === 'idle').length },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${s.color} shadow-lg`} style={{ boxShadow: `0 0 8px ${s.color.replace('bg-', '').replace('-400', '')}-400` }} />
            <span className="font-semibold">{s.label}</span>
            <span className="text-white/80 bg-white/10 px-1.5 py-0.5 rounded text-xs">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Isometric container */}
      <div className={`relative transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          transform: 'rotateX(55deg) rotateZ(-45deg) scale(1.15)',
          transformStyle: 'preserve-3d',
          width: '880px',
          height: '720px',
        }}>

        {/* Floor - brighter and more defined */}
        <div className="absolute inset-0 rounded-xl"
          style={{
            background: `
              repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 40px),
              repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 40px),
              linear-gradient(135deg, rgba(71,85,105,1), rgba(51,65,85,1))
            `,
          }} />

        {/* Back wall - more prominent */}
        <div className="absolute -top-4 left-0 right-0 h-8 bg-gradient-to-b from-slate-600/60 to-transparent border-b border-white/15 rounded-t-xl" />

        {/* Central sprint board table - enhanced */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-28 rounded-xl border border-white/20"
          style={{
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
            boxShadow: '0 0 40px rgba(255,255,255,0.08), inset 0 0 20px rgba(255,255,255,0.05)',
            top: '220px',
          }}>
          <div className="absolute inset-2 border border-dashed border-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xs text-white/60 font-mono font-semibold">SPRINT BOARD</span>
          </div>
        </div>

        {/* Agent stations */}
        {agents.map(agent => {
          const pos = POSITIONS[agent.id]
          if (!pos) return null
          return (
            <AgentStation
              key={agent.id}
              agent={agent}
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
            />
          )
        })}

        {/* Enhanced floor lights with pulsing for active agents */}
        {agents.map(agent => {
          const pos = POSITIONS[agent.id]
          if (!pos) return null
          const isActive = agent.status === 'active' || agent.status === 'working'
          return (
            <div key={`glow-${agent.id}`} 
              className={`absolute w-40 h-40 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${isActive ? 'animate-pulse' : ''}`}
              style={{
                left: `${pos.x - 2}px`,
                top: `${pos.y - 6}px`,
                background: agent.color,
                opacity: agent.status === 'active' ? 0.2 : agent.status === 'working' ? 0.15 : agent.status === 'complete' ? 0.12 : 0.06,
              }} />
          )
        })}

        {/* Energy waves for active agents */}
        {agents.filter(a => a.status === 'active' || a.status === 'working').map(agent => {
          const pos = POSITIONS[agent.id]
          if (!pos) return null
          return (
            <div key={`wave-${agent.id}`} className="absolute pointer-events-none"
              style={{ left: `${pos.x + 72}px`, top: `${pos.y + 12}px` }}>
              {[1, 2, 3].map(i => (
                <div key={i} 
                  className="absolute w-32 h-32 rounded-full border border-opacity-30 animate-energy-wave"
                  style={{
                    left: '-64px',
                    top: '-64px',
                    borderColor: agent.color,
                    animationDelay: `${i * 0.8}s`,
                    animationDuration: '3s'
                  }} />
              ))}
            </div>
          )
        })}
      </div>

      {/* Custom CSS animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes drift {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translate(60px, -80px); opacity: 0; }
        }
        .animate-drift {
          animation: drift 20s linear infinite;
        }
        @keyframes energy-drift {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.6; }
          100% { transform: translate(120px, -120px) rotate(360deg); opacity: 0; }
        }
        .animate-energy-drift {
          animation: energy-drift 10s linear infinite;
        }
        @keyframes energy-wave {
          0% { transform: scale(0.3); opacity: 0.8; }
          70% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .animate-energy-wave {
          animation: energy-wave 3s ease-out infinite;
        }
        @keyframes work-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(1deg); }
          50% { transform: scale(1.1) rotate(0deg); }
          75% { transform: scale(1.05) rotate(-1deg); }
        }
        .animate-work-pulse {
          animation: work-pulse 2s ease-in-out infinite;
        }
        @keyframes complete-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.3); }
        }
        .animate-complete-glow {
          animation: complete-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

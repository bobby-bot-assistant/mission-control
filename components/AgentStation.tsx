'use client'

import { useState } from 'react'

interface AgentData {
  id: string
  name: string
  emoji: string
  role: string
  model: string
  color: string
  status: string
  task: string
  lastActive: string
}

const stationDecorations: Record<string, React.ReactNode> = {
  daisy: (
    <div className="absolute inset-0 pointer-events-none">
      {/* Dual monitors */}
      <div className="absolute top-2 left-3 w-8 h-5 bg-emerald-900/60 border border-emerald-500/40 rounded-sm">
        <div className="w-6 h-3 mx-auto mt-0.5 bg-emerald-400/20 rounded-[1px]" />
      </div>
      <div className="absolute top-2 right-3 w-8 h-5 bg-emerald-900/60 border border-emerald-500/40 rounded-sm">
        <div className="w-6 h-3 mx-auto mt-0.5 bg-emerald-400/20 rounded-[1px]" />
      </div>
      {/* Kanban board behind */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-6 bg-emerald-950/40 border border-emerald-700/30 rounded-sm flex gap-0.5 p-0.5">
        <div className="flex-1 bg-emerald-500/20 rounded-[1px]" />
        <div className="flex-1 bg-yellow-500/20 rounded-[1px]" />
        <div className="flex-1 bg-emerald-500/20 rounded-[1px]" />
      </div>
    </div>
  ),
  scout: (
    <div className="absolute inset-0 pointer-events-none">
      {/* Research wall with cards */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-8">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="absolute w-3 h-2 bg-blue-500/30 border border-blue-400/40 rounded-[1px]"
            style={{ left: `${(i % 3) * 28 + 4}%`, top: `${Math.floor(i / 3) * 55}%` }} />
        ))}
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full">
          <line x1="25%" y1="20%" x2="55%" y2="20%" stroke="rgba(96,165,250,0.3)" strokeWidth="0.5" />
          <line x1="55%" y1="20%" x2="40%" y2="70%" stroke="rgba(96,165,250,0.3)" strokeWidth="0.5" />
        </svg>
      </div>
      {/* Map */}
      <div className="absolute top-1 right-1 w-6 h-4 bg-blue-900/40 border border-blue-500/30 rounded-[1px]" />
    </div>
  ),
  iris: (
    <div className="absolute inset-0 pointer-events-none">
      {/* Easel */}
      <div className="absolute -top-6 right-2 w-8 h-7 bg-amber-900/40 border border-amber-500/30 rounded-sm">
        <div className="w-6 h-4 mx-auto mt-1 bg-gradient-to-br from-rose-400/20 via-amber-400/20 to-violet-400/20 rounded-[1px]" />
      </div>
      {/* Color swatches */}
      <div className="absolute bottom-1 left-1 flex gap-0.5">
        {['bg-red-400/50', 'bg-amber-400/50', 'bg-blue-400/50', 'bg-green-400/50'].map((c, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${c}`} />
        ))}
      </div>
    </div>
  ),
  fern: (
    <div className="absolute inset-0 pointer-events-none">
      {/* Bookshelf */}
      <div className="absolute -top-8 left-1 w-6 h-7 flex flex-col gap-px p-0.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex gap-px h-1.5">
            <div className="w-1 bg-green-700/40 rounded-[0.5px]" />
            <div className="w-1.5 bg-emerald-600/40 rounded-[0.5px]" />
            <div className="w-1 bg-lime-700/40 rounded-[0.5px]" />
          </div>
        ))}
      </div>
      {/* Plant */}
      <div className="absolute top-1 right-2 text-[8px]">🌱</div>
    </div>
  ),
  billy: (
    <div className="absolute inset-0 pointer-events-none">
      {/* Triple terminal screens */}
      {[0, 1, 2].map(i => (
        <div key={i} className="absolute w-5 h-3.5 bg-gray-900/80 border border-orange-500/30 rounded-[1px]"
          style={{ top: `${2 + (i === 1 ? 0 : 4)}px`, left: `${4 + i * 22}%` }}>
          <div className="w-full h-full p-px">
            <div className="w-full h-0.5 bg-orange-400/30 mt-0.5" />
            <div className="w-3/4 h-0.5 bg-green-400/20 mt-0.5" />
          </div>
        </div>
      ))}
    </div>
  ),
  milo: (
    <div className="absolute inset-0 pointer-events-none">
      {/* Timeline editor */}
      <div className="absolute top-1 left-2 right-2 h-4 bg-indigo-900/40 border border-indigo-500/30 rounded-[1px] overflow-hidden">
        <div className="flex h-full gap-px p-px">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="bg-indigo-400/30 rounded-[0.5px]" style={{ width: `${20 + i * 5}%` }} />
          ))}
        </div>
      </div>
      {/* Waveform */}
      <div className="absolute bottom-2 left-2 right-2 h-2 flex items-end gap-px">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="flex-1 bg-indigo-400/30 rounded-t-[0.5px]"
            style={{ height: `${30 + Math.sin(i * 0.8) * 70}%` }} />
        ))}
      </div>
    </div>
  ),
  harper: (
    <div className="absolute inset-0 pointer-events-none">
      {/* Browser window */}
      <div className="absolute top-1 left-2 w-10 h-5 bg-teal-900/40 border border-teal-500/30 rounded-sm">
        <div className="h-1.5 bg-teal-800/40 flex items-center gap-0.5 px-0.5">
          <div className="w-0.5 h-0.5 rounded-full bg-red-400/50" />
          <div className="w-0.5 h-0.5 rounded-full bg-yellow-400/50" />
          <div className="w-0.5 h-0.5 rounded-full bg-green-400/50" />
        </div>
      </div>
      {/* Test grid */}
      <div className="absolute top-2 right-2 grid grid-cols-3 gap-px">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`w-1.5 h-1.5 rounded-[0.5px] ${i < 4 ? 'bg-green-400/40' : 'bg-teal-400/40'}`} />
        ))}
      </div>
    </div>
  ),
  kobe: (
    <div className="absolute inset-0 pointer-events-none">
      {/* Document editor */}
      <div className="absolute top-1 left-3 right-3 h-6 bg-pink-900/30 border border-pink-500/20 rounded-sm p-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-0.5 bg-pink-300/20 rounded-full mb-0.5" style={{ width: `${90 - i * 15}%` }} />
        ))}
      </div>
      {/* Pinned doctrine */}
      <div className="absolute -top-5 right-1 w-5 h-4 bg-pink-950/40 border border-pink-500/20 rounded-[1px] rotate-2" />
    </div>
  ),
}

const statusColors: Record<string, { glow: string; indicator: string; ring: string }> = {
  active: { glow: 'shadow-green-500/40', indicator: 'bg-green-400', ring: 'ring-green-400/50' },
  working: { glow: 'shadow-blue-500/40', indicator: 'bg-blue-400', ring: 'ring-blue-400/50' },
  complete: { glow: 'shadow-emerald-500/30', indicator: 'bg-emerald-400', ring: 'ring-emerald-400/40' },
  idle: { glow: 'shadow-amber-500/20', indicator: 'bg-amber-400', ring: 'ring-amber-400/30' },
}

export default function AgentStation({ agent, style }: { agent: AgentData; style?: React.CSSProperties }) {
  const [showDetail, setShowDetail] = useState(false)
  const colors = statusColors[agent.status] || statusColors.idle
  const isActive = agent.status === 'active'
  const isWorking = agent.status === 'working'
  const isComplete = agent.status === 'complete'
  const isAnimated = isActive || isWorking

  return (
    <div className="absolute group cursor-pointer" style={style} onClick={() => setShowDetail(!showDetail)}>
      {/* Enhanced desk surface */}
      <div className={`relative w-36 h-24 rounded-lg border transition-all duration-500 ${
        isActive ? 'border-white/30 animate-work-pulse' : 
        isWorking ? 'border-white/25' : 
        isComplete ? 'border-white/20 animate-complete-glow' : 'border-white/15'
      }`}
        style={{
          background: isActive ? 
            `radial-gradient(ellipse at center, ${agent.color}25, ${agent.color}10)` :
            isWorking ? 
            `radial-gradient(ellipse at center, ${agent.color}20, ${agent.color}08)` :
            `radial-gradient(ellipse at center, ${agent.color}15, ${agent.color}05)`,
          boxShadow: isActive ? 
            `0 0 40px ${agent.color}30, inset 0 0 25px ${agent.color}15` :
            isWorking ? 
            `0 0 35px ${agent.color}25, inset 0 0 20px ${agent.color}12` :
            `0 0 30px ${agent.color}20, inset 0 0 20px ${agent.color}08`,
        }}>

        {/* Station decorations */}
        {stationDecorations[agent.id]}

        {/* Enhanced desk lamp glow */}
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full blur-md transition-opacity duration-500 ${
          isActive ? 'opacity-40 animate-pulse' : isWorking ? 'opacity-30' : 'opacity-20'
        }`}
          style={{ background: agent.color }} />

        {/* Activity particles for working agents */}
        {(isActive || isWorking) && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: isActive ? 8 : 5 }, (_, i) => (
              <div key={i} 
                className="absolute w-1 h-1 bg-white/60 rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animation: `energy-drift ${3 + Math.random() * 2}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }} />
            ))}
          </div>
        )}
      </div>

      {/* Enhanced agent avatar */}
      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center text-2xl
        border-2 shadow-lg ${colors.ring} ring-2 transition-all duration-300
        ${isActive ? 'animate-work-pulse scale-110' : isWorking ? 'animate-float scale-105' : isComplete ? 'animate-complete-glow' : ''} 
        ${agent.status === 'idle' ? 'opacity-70' : 'opacity-100'}`}
        style={{
          background: isActive ? 
            `radial-gradient(circle, ${agent.color}50, ${agent.color}30)` :
            `radial-gradient(circle, ${agent.color}40, ${agent.color}20)`,
          borderColor: `${agent.color}${isActive ? '80' : '60'}`,
          boxShadow: isActive ? 
            `0 0 25px ${agent.color}50, 0 0 35px ${agent.color}30` :
            `0 0 15px ${agent.color}30`,
        }}>
        <span className={`${isActive || isWorking ? 'animate-bounce' : ''}`}>{agent.emoji}</span>

        {/* Enhanced status indicator */}
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${colors.indicator}
          ${isActive ? 'animate-pulse scale-110' : isWorking ? 'animate-pulse' : ''} transition-transform duration-300`} />

        {/* Enhanced complete checkmark */}
        {isComplete && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold animate-pulse shadow-lg shadow-emerald-500/50">✓</div>
        )}
      </div>

      {/* Enhanced typing animation for working agents */}
      {isWorking && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce shadow-lg shadow-blue-400/50"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      )}

      {/* Activity indicator for active agents */}
      {isActive && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping shadow-lg shadow-green-400/50" />
        </div>
      )}

      {/* Enhanced name label with better contrast */}
      <div className={`absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-bold transition-all duration-300 ${
        isActive || isWorking ? 'text-white scale-105' : 'text-white/90'
      } bg-black/40 px-2 py-0.5 rounded border border-white/20`}>
        {agent.name}
      </div>

      {/* Enhanced hover tooltip with task details */}
      <div className={`absolute -top-20 left-1/2 -translate-x-1/2 max-w-xs px-3 py-2 bg-slate-800/95 backdrop-blur text-white text-xs rounded-lg
        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/20 z-50 shadow-2xl ${
        isComplete ? 'border-emerald-400/40' : ''
      }`}>
        <div className="font-semibold mb-1">{agent.status.toUpperCase()}</div>
        <div className={`${isComplete ? 'text-emerald-300' : 'text-white/90'}`}>
          {agent.task}
        </div>
      </div>

      {/* Enhanced detail card on click */}
      {showDetail && (
        <div className="absolute -top-44 left-1/2 -translate-x-1/2 w-60 p-4 bg-slate-800/98 backdrop-blur border border-white/30 rounded-xl shadow-2xl z-50"
          style={{ 
            transform: 'rotateZ(45deg) rotateX(-60deg) translateX(-50%)',
            boxShadow: `0 0 40px ${agent.color}20, 0 25px 50px -12px rgba(0, 0, 0, 0.8)`
          }}
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`text-2xl p-2 rounded-full ${
              isActive ? 'bg-green-400/20' : isWorking ? 'bg-blue-400/20' : isComplete ? 'bg-emerald-400/20' : 'bg-amber-400/20'
            }`}>
              {agent.emoji}
            </div>
            <div>
              <div className="font-bold text-white text-base">{agent.name}</div>
              <div className="text-xs text-slate-300">{agent.role}</div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Status</span>
              <span className={`capitalize font-bold px-2 py-1 rounded text-xs ${
                agent.status === 'active' ? 'text-green-300 bg-green-400/20' : 
                agent.status === 'complete' ? 'text-emerald-300 bg-emerald-400/20' : 
                agent.status === 'working' ? 'text-blue-300 bg-blue-400/20' : 
                'text-amber-300 bg-amber-400/20'
              }`}>{agent.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Model</span>
              <span className="text-white font-medium">{agent.model}</span>
            </div>
            <div className="pt-2 border-t border-white/20">
              <span className="text-slate-400 font-medium">Current Task:</span>
              <p className={`mt-1 font-medium ${isComplete ? 'text-emerald-200' : 'text-white'}`}>
                {agent.task}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowDetail(false)} 
            className="absolute top-2 right-3 text-slate-400 hover:text-white text-lg font-bold transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

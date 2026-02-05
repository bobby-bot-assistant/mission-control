'use client'

import { useEffect, useState } from 'react'
import { Project, Memory, Task } from '@/lib/types'

interface Opportunity {
  id: string
  name: string
  sds: number
  deadline?: string
  amount?: string
  description: string
  result: 'YES' | 'PROBABLY' | 'LATER' | 'NO'
}

export default function ExecutiveHome() {
  const [projects, setProjects] = useState<Project[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Mock opportunity data (connected to real API in Phase 8)
  const opportunities: Opportunity[] = [
    { id: '1', name: 'NIH SBIR Phase I', sds: 32.5, deadline: 'Apr 5', amount: '$300K', description: 'Story Hour with Simon', result: 'YES', projectId: 'proj_story_hour' },
    { id: '2', name: 'NIMH Digital Mental Health', sds: 27.5, deadline: 'TBD', amount: '$250K', description: 'Innovation NOFO', result: 'YES', projectId: 'proj_story_hour' },
    { id: '3', name: 'GrantScout Commercialization', sds: 23.0, deadline: 'Ongoing', amount: 'Rev', description: 'SaaS revenue opportunity', result: 'YES', projectId: 'proj_grant_engine' },
    { id: '4', name: 'SAMHSA Youth Grants', sds: 22.5, deadline: 'Oct 1', amount: 'TBD', description: 'Youth mental health', result: 'PROBABLY', projectId: 'proj_grant_engine' },
    { id: '5', name: 'NSF AI for Good', sds: 20.0, deadline: 'Jun 15', amount: '$150K', description: 'AI credibility building', result: 'PROBABLY', projectId: 'proj_content_engine' },
    { id: '6', name: 'Blank Foundation $25M', sds: 20.0, deadline: 'Rolling', amount: 'TBD', description: 'Youth mental health initiative', result: 'PROBABLY', projectId: 'proj_grant_engine' },
  ]

  const decisionsNeeded = tasks.filter(t => t.status === '👀 Review / Waiting (blocked or needs input)' && t.priority === '🔴 Critical')
  const recentMemories = memories.slice(0, 5)

  // Project status counts
  const activeProjects = projects.filter(p => !['✅ Completed', '🗄 Archived'].includes(p.status)).length
  const completedProjects = projects.filter(p => p.status === '✅ Completed').length

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, memoriesRes, tasksRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/memories'),
          fetch('/api/tasks'),
        ])
        
        if (projectsRes.ok) setProjects(await projectsRes.json())
        if (memoriesRes.ok) setMemories(await memoriesRes.json())
        if (tasksRes.ok) setTasks(await tasksRes.json())
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Executive Home</h1>
        <p className="text-zinc-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Executive Home</h1>
          <p className="text-zinc-500">At-a-glance leverage and priorities</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-zinc-500">SDS Legend</p>
            <div className="flex gap-2 text-xs mt-1">
              <span className="px-2 py-0.5 bg-red-900/50 text-red-300 rounded">32+ PURSUE</span>
              <span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-300 rounded">25-31 PRIORITY</span>
              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">18-24 SCHEDULE</span>
            </div>
          </div>
        </div>
      </div>

      {/* LEVERAGE OPPORTUNITIES */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>💰</span> Leverage Opportunities
        </h2>
        <div className="grid gap-3">
          {opportunities.map((opp) => {
            const sdsColor = opp.sds >= 32 ? 'bg-red-900/30 border-red-800' : 
                            opp.sds >= 25 ? 'bg-yellow-900/30 border-yellow-800' : 
                            'bg-zinc-900 border-zinc-800'
            const sdsText = opp.sds >= 32 ? 'text-red-300' :
                           opp.sds >= 25 ? 'text-yellow-300' : 'text-zinc-400'
            const badgeColor = opp.result === 'YES' ? 'bg-green-900/50 text-green-300' :
                              opp.result === 'PROBABLY' ? 'bg-yellow-900/50 text-yellow-300' :
                              'bg-zinc-800 text-zinc-400'
            
            return (
              <div key={opp.id} className={`p-4 rounded-lg border ${sdsColor} flex items-center gap-4`}>
                <div className="text-center min-w-[60px]">
                  <p className={`text-2xl font-bold ${sdsText}`}>{opp.sds}</p>
                  <p className="text-xs text-zinc-500">SDS</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{opp.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${badgeColor}`}>{opp.result}</span>
                  </div>
                  <p className="text-sm text-zinc-400">{opp.description}</p>
                </div>
                <div className="text-right text-sm">
                  {opp.amount && <p className="font-medium">{opp.amount}</p>}
                  {opp.deadline && <p className="text-zinc-500">{opp.deadline}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* DECISIONS NEEDED & RECENT ACTIVITY */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Decisions Needed */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>⚡</span> Decisions Needed
          </h2>
          {decisionsNeeded.length === 0 ? (
            <p className="text-zinc-500 text-sm">No critical decisions pending</p>
          ) : (
            <div className="space-y-2">
              {decisionsNeeded.map((task) => (
                <div key={task.id} className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">Due: {task.due_date || 'TBD'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📈</span> Recent Activity
          </h2>
          {recentMemories.length === 0 ? (
            <p className="text-zinc-500 text-sm">No recent memories</p>
          ) : (
            <div className="space-y-2">
              {recentMemories.map((mem) => (
                <div key={mem.id} className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <p className="font-medium text-sm">{mem.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">{mem.category}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PROJECTS OVERVIEW */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🏗️</span> Projects Overview
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
            <p className="text-2xl font-bold">{projects.length}</p>
            <p className="text-sm text-zinc-500">Total Projects</p>
          </div>
          <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-800 text-center">
            <p className="text-2xl font-bold">{activeProjects}</p>
            <p className="text-sm text-zinc-400">Active</p>
          </div>
          <div className="p-4 bg-green-900/30 rounded-lg border border-green-800 text-center">
            <p className="text-2xl font-bold">{completedProjects}</p>
            <p className="text-sm text-zinc-400">Completed</p>
          </div>
          <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 text-center">
            <p className="text-2xl font-bold">{memories.length}</p>
            <p className="text-sm text-zinc-400">Memories</p>
          </div>
        </div>
      </div>

      {/* MONEY / AUTHORITY / OPTIONALITY */}
      <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🧠</span> Money / Authority / Optionality
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-green-400 font-medium mb-2">💵 Revenue Pipeline</p>
            <p className="text-sm text-zinc-400">$550K+ identified in grant opportunities</p>
            <p className="text-xs text-zinc-500 mt-1">SDS 25+ items: {opportunities.filter(o => o.sds >= 25).length}</p>
          </div>
          <div>
            <p className="text-blue-400 font-medium mb-2">📜 Authority Signals</p>
            <p className="text-sm text-zinc-400">Research citations needed for NIH alignment</p>
            <p className="text-xs text-zinc-500 mt-1">Content pieces with multiplier 5x+: 0</p>
          </div>
          <div>
            <p className="text-purple-400 font-medium mb-2">🚪 Optionality Doors</p>
            <p className="text-sm text-zinc-400">NIH path, Foundation path, SaaS path</p>
            <p className="text-xs text-zinc-500 mt-1">Active opportunities: {opportunities.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
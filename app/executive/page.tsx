'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Project, Memory, Task } from '@/lib/types'

interface Opportunity {
  id: string
  name: string
  sds: number
  deadline?: string
  amount?: string
  description: string
  result: 'YES' | 'PROBABLY' | 'LATER' | 'NO'
  projectId?: string
}

export default function ExecutiveHome() {
  const [projects, setProjects] = useState<Project[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Opportunities data with full details
  const opportunities: Opportunity[] = [
    { 
      id: 'opp-nih-sbir', 
      name: 'NIH SBIR Phase I', 
      sds: 32.5, 
      deadline: 'Apr 5', 
      amount: '$300K', 
      description: 'Story Hour with Simon - preventive mental health', 
      result: 'YES', 
      projectId: 'proj_story_hour' 
    },
    { 
      id: 'opp-nimh-digital', 
      name: 'NIMH Digital Mental Health', 
      sds: 27.5, 
      deadline: 'TBD', 
      amount: '$250K', 
      description: 'Innovation NOFO for digital interventions', 
      result: 'YES', 
      projectId: 'proj_story_hour' 
    },
    { 
      id: 'opp-grantscout', 
      name: 'GrantScout Commercialization', 
      sds: 23.0, 
      deadline: 'Ongoing', 
      amount: 'Rev', 
      description: 'SaaS revenue opportunity', 
      result: 'YES', 
      projectId: 'proj_grant_engine' 
    },
  ]

  const decisionsNeeded = tasks.filter(t => t.status === '👀 Review / Waiting (blocked or needs input)' && t.priority === '🔴 Critical')
  const recentActivity = [...memories.slice(0, 3), ...tasks.filter(t => t.status === '✅ Completed').slice(0, 2)]
  
  // Get upcoming deadlines (next 7 days)
  const upcomingDeadlines = tasks
    .filter(t => t.due_date && !t.status?.includes('Completed'))
    .map(t => ({ ...t, dueDate: new Date(t.due_date) }))
    .filter(t => {
      const daysDiff = Math.floor((t.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff >= 0 && daysDiff <= 7
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5)

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
        <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Executive Home</h1>
            <p className="text-zinc-600 dark:text-zinc-400">5-second scan of what matters</p>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs">⌘K</kbd>
            <span>Search anything</span>
          </div>
        </div>
      </div>

      {/* LEVERAGE OPPORTUNITIES */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">💰 Top Opportunities</h2>
        <div className="grid gap-3">
          {opportunities.slice(0, 3).map((opp) => {
            const sdsColor = opp.sds >= 32 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                            opp.sds >= 25 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 
                            'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
            
            return (
              <button
                key={opp.id}
                onClick={() => router.push(`/opportunities/${opp.id}`)}
                className={`p-4 rounded-lg border ${sdsColor} flex items-center gap-4 w-full text-left hover:shadow-md transition-shadow`}
              >
                <div className="text-center min-w-[50px]">
                  <p className="text-2xl font-bold">{opp.sds}</p>
                  <p className="text-xs text-zinc-500">SDS</p>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{opp.name}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{opp.description}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{opp.amount}</p>
                  <p className="text-zinc-500">{opp.deadline}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* UPCOMING DEADLINES */}
      {upcomingDeadlines.length > 0 && (
        <div className="mb-8 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>⏰</span> Upcoming Deadlines
          </h2>
          <div className="space-y-2">
            {upcomingDeadlines.map((task) => {
              const daysUntil = Math.floor((task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              const isUrgent = daysUntil <= 2
              
              return (
                <button
                  key={task.id}
                  onClick={() => router.push(`/tasks?highlight=${task.id}`)}
                  className="w-full p-3 bg-white dark:bg-zinc-900 rounded border border-amber-200 dark:border-amber-700 text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${isUrgent ? 'text-red-700 dark:text-red-400' : ''}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{task.priority}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                      </p>
                      <p className="text-xs text-zinc-500">{task.dueDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Decisions Needed */}
        <div>
          <h2 className="text-lg font-semibold mb-4">⚡ Decisions Needed</h2>
          {decisionsNeeded.length === 0 ? (
            <p className="text-zinc-500 text-sm">No critical decisions pending</p>
          ) : (
            <div className="space-y-2">
              {decisionsNeeded.slice(0, 3).map((task) => (
                <button
                  key={task.id}
                  onClick={() => router.push(`/tasks?highlight=${task.id}`)}
                  className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 w-full text-left hover:shadow-md transition-shadow"
                >
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">Due: {task.due_date || 'ASAP'}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold mb-4">📈 Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-zinc-500 text-sm">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.slice(0, 3).map((item, idx) => (
                <button
                  key={`activity-${idx}`}
                  onClick={() => {
                    if ('category' in item) {
                      router.push(`/memory?highlight=${item.id}`)
                    } else {
                      router.push(`/tasks?highlight=${item.id}`)
                    }
                  }}
                  className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 w-full text-left hover:shadow-md transition-shadow"
                >
                  <p className="font-medium text-sm">
                    {'title' in item ? item.title : (item as any).name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {'category' in item ? item.category : 'Task completed'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">🚀 Momentum</h2>
          <button
            onClick={() => router.push('/timeline')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Timeline →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">$550K+</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Pipeline</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{projects.filter(p => p.status?.includes('Active')).length}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Active Projects</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{tasks.filter(t => !t.status?.includes('Completed')).length}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Open Tasks</p>
          </div>
        </div>
      </div>
    </div>
  )
}
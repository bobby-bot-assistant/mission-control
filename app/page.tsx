'use client'

import { useEffect, useState } from 'react'
import { Project } from '@/lib/types'
import { Memory } from '@/lib/types'
import { computeActivityFeed, formatTimestamp } from '@/lib/activity'

interface ActivityItem {
  id: string
  type: 'project' | 'memory'
  action: 'created' | 'updated' | 'deleted'
  title: string
  timestamp: string
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, memoriesRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/memories'),
        ])
        
        if (projectsRes.ok) {
          const data = await projectsRes.json()
          setProjects(data)
        }
        if (memoriesRes.ok) {
          const data = await memoriesRes.json()
          setMemories(data)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (projects.length > 0 || memories.length > 0) {
      const computed = computeActivityFeed(projects, memories)
      setActivities(computed)
    }
  }, [projects, memories])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Activity Feed</h1>
        <p className="text-zinc-500">Loading...</p>
      </div>
    )
  }

  const activeProjects = projects.filter(p => !['✅ Completed', '🗄 Archived'].includes(p.status)).length
  const totalMemories = memories.length
  const thisWeekMemories = memories.filter(m => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(m.memory_date) >= weekAgo
  }).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Activity Feed</h1>
        <p className="text-zinc-500">Recent activity across your system</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <p className="text-2xl font-bold">{activeProjects}</p>
          <p className="text-sm text-zinc-500">Active Projects</p>
        </div>
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <p className="text-2xl font-bold">{projects.length}</p>
          <p className="text-sm text-zinc-500">Total Projects</p>
        </div>
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <p className="text-2xl font-bold">{totalMemories}</p>
          <p className="text-sm text-zinc-500">Total Memories</p>
        </div>
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <p className="text-2xl font-bold">{thisWeekMemories}</p>
          <p className="text-sm text-zinc-500">Memories This Week</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {activities.length === 0 ? (
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
            <p className="text-zinc-500">No activity yet. Start creating projects and memories!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <div 
                key={`${activity.type}-${activity.id}`}
                className="flex items-center gap-4 p-3 bg-zinc-900 rounded-lg border border-zinc-800"
              >
                <span className="text-xl">
                  {activity.type === 'project' ? '📁' : '🧠'}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-zinc-500">
                    {activity.type === 'project' ? 'Project updated' : 'Memory captured'}
                  </p>
                </div>
                <span className="text-sm text-zinc-500">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <a href="/projects" className="block p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
          <p className="text-lg font-medium mb-1">📁 Projects Hub</p>
          <p className="text-sm text-zinc-500">Manage your projects</p>
        </a>
        <a href="/memory" className="block p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
          <p className="text-lg font-medium mb-1">🧠 Memory Vault</p>
          <p className="text-sm text-zinc-500">Capture and search memories</p>
        </a>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Project, Memory, Person, Task } from '@/lib/types'
import { computeActivityFeed, formatTimestamp } from '@/lib/activity'

interface ActivityItem {
  id: string
  type: 'project' | 'memory' | 'person' | 'task'
  action: 'created' | 'updated' | 'deleted'
  title: string
  timestamp: string
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, memoriesRes, peopleRes, tasksRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/memories'),
          fetch('/api/people'),
          fetch('/api/tasks'),
        ])
        
        if (projectsRes.ok) {
          const data = await projectsRes.json()
          setProjects(data)
        }
        if (memoriesRes.ok) {
          const data = await memoriesRes.json()
          setMemories(data)
        }
        if (peopleRes.ok) {
          const data = await peopleRes.json()
          setPeople(data)
        }
        if (tasksRes.ok) {
          const data = await tasksRes.json()
          setTasks(data)
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
    if (projects.length > 0 || memories.length > 0 || people.length > 0 || tasks.length > 0) {
      const computed = computeActivityFeed(projects, memories, people, tasks)
      setActivities(computed)
    }
  }, [projects, memories, people, tasks])

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
  const totalPeople = people.length
  const activeTasks = tasks.filter(t => !['✅ Completed', '❌ Cancelled'].includes(t.status)).length

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
          <p className="text-2xl font-bold">{activeTasks}</p>
          <p className="text-sm text-zinc-500">Active Tasks</p>
        </div>
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <p className="text-2xl font-bold">{totalPeople}</p>
          <p className="text-sm text-zinc-500">People</p>
        </div>
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <p className="text-2xl font-bold">{totalMemories}</p>
          <p className="text-sm text-zinc-500">Memories</p>
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
                  {activity.type === 'project' ? '📁' : 
                   activity.type === 'memory' ? '🧠' : 
                   activity.type === 'person' ? '👤' : '📋'}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-zinc-500">
                    {activity.type === 'project' ? 'Project updated' : 
                     activity.type === 'memory' ? 'Memory captured' : 
                     activity.type === 'person' ? 'Person updated' : 'Task updated'}
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
        <a href="/tasks" className="block p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
          <p className="text-lg font-medium mb-1">📋 Tasks Center</p>
          <p className="text-sm text-zinc-500">Track and organize tasks</p>
        </a>
        <a href="/people" className="block p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
          <p className="text-lg font-medium mb-1">👥 People CRM</p>
          <p className="text-sm text-zinc-500">Manage relationships</p>
        </a>
        <a href="/memory" className="block p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
          <p className="text-lg font-medium mb-1">🧠 Memory Vault</p>
          <p className="text-sm text-zinc-500">Capture and search memories</p>
        </a>
      </div>
    </div>
  )
}

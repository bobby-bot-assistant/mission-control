'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Project, Memory, Person, Task, Document } from '@/lib/types'
import { computeActivityFeed, formatTimestamp } from '@/lib/activity'

interface ActivityItem {
  id: string
  type: 'project' | 'memory' | 'person' | 'task' | 'document'
  action: 'created' | 'updated' | 'deleted'
  title: string
  timestamp: string
}

export default function ActivityPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, memoriesRes, peopleRes, tasksRes, docsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/memories'),
          fetch('/api/people'),
          fetch('/api/tasks'),
          fetch('/api/documents'),
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
        if (docsRes.ok) {
          const data = await docsRes.json()
          setDocuments(data)
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
    if (projects.length > 0 || memories.length > 0 || people.length > 0 || tasks.length > 0 || documents.length > 0) {
      const computed = computeActivityFeed(projects, memories, people, tasks, documents)
      setActivities(computed)
    }
  }, [projects, memories, people, tasks, documents])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Activity Feed</h1>
        <p className="text-foreground-muted">Loading...</p>
      </div>
    )
  }

  const activeProjects = projects.filter(p => !['✅ Completed', '🗄 Archived'].includes(p.status)).length
  const activeTasks = tasks.filter(t => !['✅ Completed', '❌ Cancelled'].includes(t.status)).length
  const totalPeople = people.length
  const totalDocuments = documents.length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Activity Feed</h1>
        <p className="text-foreground-muted">Recent activity across your system</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-surface rounded-lg border border-border p-4">
          <p className="text-2xl font-bold">{activeProjects}</p>
          <p className="text-sm text-foreground-muted">Active Projects</p>
        </div>
        <div className="bg-surface rounded-lg border border-border p-4">
          <p className="text-2xl font-bold">{activeTasks}</p>
          <p className="text-sm text-foreground-muted">Active Tasks</p>
        </div>
        <div className="bg-surface rounded-lg border border-border p-4">
          <p className="text-2xl font-bold">{totalPeople}</p>
          <p className="text-sm text-foreground-muted">People</p>
        </div>
        <div className="bg-surface rounded-lg border border-border p-4">
          <p className="text-2xl font-bold">{totalDocuments}</p>
          <p className="text-sm text-foreground-muted">Documents</p>
        </div>
        <div className="bg-surface rounded-lg border border-border p-4">
          <p className="text-2xl font-bold">{memories.length}</p>
          <p className="text-sm text-foreground-muted">Memories</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {activities.length === 0 ? (
          <div className="bg-surface rounded-lg border border-border p-8 text-center">
            <p className="text-foreground-muted">No activity yet. Start creating projects, memories, people, tasks, or documents!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <div 
                key={`${activity.type}-${activity.id}`}
                className="flex items-center gap-4 p-3 bg-surface rounded-lg border border-border"
              >
                <span className="text-xl">
                  {activity.type === 'project' ? '📁' : 
                   activity.type === 'memory' ? '🧠' : 
                   activity.type === 'person' ? '👥' : 
                   activity.type === 'task' ? '📋' : '📄'}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-foreground-muted">
                    {activity.type === 'project' ? 'Project updated' : 
                     activity.type === 'memory' ? 'Memory captured' : 
                     activity.type === 'person' ? 'Person updated' : 
                     activity.type === 'task' ? 'Task updated' : 'Document updated'}
                  </p>
                </div>
                <span className="text-sm text-foreground-muted">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/projects" className="block p-4 bg-surface rounded-lg border border-border hover:border-foreground-subtle transition-colors">
          <p className="text-lg font-medium mb-1">📁 Projects Hub</p>
          <p className="text-sm text-foreground-muted">Manage your projects</p>
        </Link>
        <Link href="/tasks" className="block p-4 bg-surface rounded-lg border border-border hover:border-foreground-subtle transition-colors">
          <p className="text-lg font-medium mb-1">📋 Tasks Center</p>
          <p className="text-sm text-foreground-muted">Track and organize tasks</p>
        </Link>
        <Link href="/people" className="block p-4 bg-surface rounded-lg border border-border hover:border-foreground-subtle transition-colors">
          <p className="text-lg font-medium mb-1">👥 People CRM</p>
          <p className="text-sm text-foreground-muted">Manage relationships</p>
        </Link>
        <Link href="/docs" className="block p-4 bg-surface rounded-lg border border-border hover:border-foreground-subtle transition-colors">
          <p className="text-lg font-medium mb-1">📄 Documents Library</p>
          <p className="text-sm text-foreground-muted">Store and search documents</p>
        </Link>
        <Link href="/memory" className="block p-4 bg-surface rounded-lg border border-border hover:border-foreground-subtle transition-colors">
          <p className="text-lg font-medium mb-1">🧠 Memory Vault</p>
          <p className="text-sm text-foreground-muted">Capture and search memories</p>
        </Link>
      </div>
    </div>
  )
}
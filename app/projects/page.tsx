'use client'

import { useEffect, useState } from 'react'
import { Project } from '@/lib/types'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects')
        if (res.ok) {
          const data = await res.json()
          setProjects(data)
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Projects Hub</h1>
          <p className="text-zinc-500">Track every project from inception to completion</p>
        </div>
        <div className="text-zinc-500">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Projects Hub</h1>
          <p className="text-zinc-500">Track every project from inception to completion</p>
        </div>
        <button className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors">
          + New Project
        </button>
      </div>
      
      {projects.length === 0 ? (
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-12 text-center">
          <p className="text-4xl mb-4">📁</p>
          <p className="text-lg font-medium mb-2">No projects yet</p>
          <p className="text-sm text-zinc-500">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div 
              key={project.id}
              className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  {project.codename && (
                    <p className="text-sm text-zinc-500">{project.codename}</p>
                  )}
                </div>
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded">{project.status}</span>
              </div>
              <p className="text-sm text-zinc-400 mb-3">{project.vision}</p>
              <div className="flex gap-2 text-xs text-zinc-500">
                <span>{project.priority}</span>
                <span>•</span>
                <span>{project.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

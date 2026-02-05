interface ActivityEntry {
  id: string
  type: 'project' | 'memory'
  action: 'created' | 'updated' | 'deleted'
  title: string
  timestamp: string
}

interface ProjectInput {
  id: string
  name: string
  last_active: string
  updated_at?: string
}

interface MemoryInput {
  id: string
  title: string
  memory_date: string
  created_at?: string
}

export function computeActivityFeed(
  projects: ProjectInput[],
  memories: MemoryInput[]
): ActivityEntry[] {
  const activities: ActivityEntry[] = []

  // Get recent projects (last 10 based on last_active)
  const recentProjects = projects
    .slice()
    .sort((a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime())
    .slice(0, 10)

  recentProjects.forEach(project => {
    activities.push({
      id: project.id,
      type: 'project',
      action: 'updated',
      title: project.name,
      timestamp: project.last_active,
    })
  })

  // Get recent memories (last 10 based on memory_date)
  const recentMemories = memories
    .slice()
    .sort((a, b) => new Date(b.memory_date).getTime() - new Date(a.memory_date).getTime())
    .slice(0, 10)

  recentMemories.forEach(memory => {
    activities.push({
      id: memory.id,
      type: 'memory',
      action: 'created',
      title: memory.title,
      timestamp: memory.memory_date,
    })
  })

  // Sort all activities by timestamp, most recent first
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

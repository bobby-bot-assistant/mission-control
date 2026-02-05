interface ActivityEntry {
  id: string
  type: 'project' | 'memory' | 'person' | 'task'
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

interface PersonInput {
  id: string
  name: string
  updated_at?: string
  created_at?: string
}

interface TaskInput {
  id: string
  title: string
  updated_at?: string
  created_at?: string
}

export function computeActivityFeed(
  projects: ProjectInput[],
  memories: MemoryInput[],
  people?: PersonInput[],
  tasks?: TaskInput[]
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

  // Get recent people (last 5 based on updated_at)
  if (people) {
    const recentPeople = people
      .slice()
      .sort((a, b) => new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime())
      .slice(0, 5)

    recentPeople.forEach(person => {
      activities.push({
        id: person.id,
        type: 'person',
        action: 'updated',
        title: person.name,
        timestamp: person.updated_at || person.created_at || new Date().toISOString(),
      })
    })
  }

  // Get recent tasks (last 10 based on updated_at)
  if (tasks) {
    const recentTasks = tasks
      .slice()
      .sort((a, b) => new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime())
      .slice(0, 10)

    recentTasks.forEach(task => {
      activities.push({
        id: task.id,
        type: 'task',
        action: 'updated',
        title: task.title,
        timestamp: task.updated_at || task.created_at || new Date().toISOString(),
      })
    })
  }

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

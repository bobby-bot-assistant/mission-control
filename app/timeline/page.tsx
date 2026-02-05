'use client'

import { useEffect, useState } from 'react'
import { Task, Project } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface TimelineEvent {
  id: string
  title: string
  date: Date
  type: 'task' | 'project' | 'deadline'
  priority?: string
  status?: string
  projectId?: string
}

export default function TimelinePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [view, setView] = useState<'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/projects')
        ])

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          setTasks(tasksData)
        }
        
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(projectsData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Convert tasks and projects to timeline events
  useEffect(() => {
    const timelineEvents: TimelineEvent[] = []

    // Add tasks with due dates
    tasks.forEach(task => {
      if (task.due_date) {
        timelineEvents.push({
          id: `task-${task.id}`,
          title: task.title,
          date: new Date(task.due_date),
          type: 'task',
          priority: task.priority,
          status: task.status,
          projectId: task.related_project_id
        })
      }
    })

    // Add project deadlines
    projects.forEach(project => {
      if (project.target_eta) {
        timelineEvents.push({
          id: `project-${project.id}`,
          title: `${project.name} Deadline`,
          date: new Date(project.target_eta),
          type: 'project',
          status: project.status
        })
      }
    })

    // Sort by date
    timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime())
    setEvents(timelineEvents)
  }, [tasks, projects])

  // Get week dates
  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  // Get month dates
  const getMonthDates = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const dates = []

    // Add previous month's trailing days
    const firstDayOfWeek = firstDay.getDay()
    for (let i = firstDayOfWeek; i > 0; i--) {
      const day = new Date(firstDay)
      day.setDate(day.getDate() - i)
      dates.push(day)
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(year, month, i))
    }

    // Add next month's leading days to complete the grid
    const remainingDays = 42 - dates.length // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      dates.push(new Date(year, month + 1, i))
    }

    return dates
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      return event.date.toDateString() === date.toDateString()
    })
  }

  // Navigate timeline
  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Timeline</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    )
  }

  const dates = view === 'week' ? getWeekDates(currentDate) : getMonthDates(currentDate)
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Timeline</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Visual overview of deadlines and tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === 'week' ? 'month' : 'week')}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            {view === 'week' ? 'Month View' : 'Week View'}
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Today
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('prev')}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold">{monthYear}</h2>
        <button
          onClick={() => navigate('next')}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0 border-b border-zinc-200 dark:border-zinc-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {day}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className={`grid grid-cols-7 gap-0 ${view === 'month' ? 'auto-rows-fr' : ''}`}>
          {dates.map((date, index) => {
            const dateEvents = getEventsForDate(date)
            const isToday = date.toDateString() === new Date().toDateString()
            const isCurrentMonth = date.getMonth() === currentDate.getMonth()
            const isWeekend = date.getDay() === 0 || date.getDay() === 6

            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 border-r border-b border-zinc-200 dark:border-zinc-800
                  ${!isCurrentMonth && view === 'month' ? 'bg-zinc-50 dark:bg-zinc-950' : ''}
                  ${isWeekend ? 'bg-zinc-50/50 dark:bg-zinc-900/50' : ''}
                  ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors
                `}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-sm ${
                    !isCurrentMonth && view === 'month' ? 'text-zinc-400' : 
                    isToday ? 'font-bold text-blue-600 dark:text-blue-400' : 
                    'text-zinc-600 dark:text-zinc-300'
                  }`}>
                    {date.getDate()}
                  </span>
                  {dateEvents.length > 0 && (
                    <span className="text-xs bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">
                      {dateEvents.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dateEvents.slice(0, 3).map(event => (
                    <button
                      key={event.id}
                      onClick={() => {
                        if (event.type === 'task') {
                          router.push(`/tasks?highlight=${event.id.replace('task-', '')}`)
                        } else if (event.type === 'project') {
                          router.push(`/projects?highlight=${event.id.replace('project-', '')}`)
                        }
                      }}
                      className={`
                        w-full text-left text-xs p-1 rounded truncate
                        ${event.type === 'task' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : ''}
                        ${event.type === 'project' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' : ''}
                        ${event.type === 'deadline' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' : ''}
                        hover:opacity-80 transition-opacity
                      `}
                      title={event.title}
                    >
                      {event.type === 'task' && '✓ '}
                      {event.type === 'project' && '📁 '}
                      {event.title}
                    </button>
                  ))}
                  {dateEvents.length > 3 && (
                    <button 
                      className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      onClick={() => {
                        // Could open a modal with all events for this date
                        router.push(`/tasks?date=${date.toISOString().split('T')[0]}`)
                      }}
                    >
                      +{dateEvents.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded"></div>
          <span className="text-zinc-600 dark:text-zinc-400">Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/30 rounded"></div>
          <span className="text-zinc-600 dark:text-zinc-400">Project Deadlines</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
          <span className="text-zinc-600 dark:text-zinc-400">Today</span>
        </div>
      </div>
    </div>
  )
}
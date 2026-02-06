import { NextResponse } from 'next/server'
import { getAllTasks, createTask, updateTask, deleteTask, searchTasks, getTasksByProject, getTasksByStatus } from '@/lib/tasks'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const projectId = searchParams.get('project')
    const status = searchParams.get('status')
    
    if (query) {
      const tasks = searchTasks(query)
      return NextResponse.json(tasks)
    }
    
    if (projectId) {
      const tasks = getTasksByProject(projectId)
      return NextResponse.json(tasks)
    }
    
    if (status) {
      const tasks = getTasksByStatus(status as any)
      return NextResponse.json(tasks)
    }
    
    const tasks = getAllTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const task = createTask(body)
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }
    const task = updateTask(id, updates)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }
    deleteTask(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const NOTIFICATIONS_FILE = path.join(
  process.env.HOME || '/Users/daisydukes',
  'openclaw-projects/mission-control-data/notifications.json'
)

interface Notification {
  id: string
  title: string
  description: string
  type: 'agent-completion' | 'review' | 'feedback' | 'alert' | 'pipeline-stage'
  link: string
  priority: 'low' | 'medium' | 'high'
  read: boolean
  createdAt: string
}

function readNotifications(): Notification[] {
  try {
    if (!fs.existsSync(NOTIFICATIONS_FILE)) {
      return []
    }
    const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading notifications:', error)
    return []
  }
}

function writeNotifications(notifications: Notification[]): void {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2))
  } catch (error) {
    console.error('Error writing notifications:', error)
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const unreadOnly = searchParams.get('unread') === 'true'
  
  let notifications = readNotifications()
  
  if (unreadOnly) {
    notifications = notifications.filter(n => !n.read)
  }
  
  // Sort by createdAt descending (newest first)
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  return NextResponse.json(notifications)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, type, link, priority } = body
    
    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      )
    }
    
    const notifications = readNotifications()
    
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      title,
      description: description || '',
      type,
      link: link || '/',
      priority: priority || 'medium',
      read: false,
      createdAt: new Date().toISOString()
    }
    
    notifications.push(newNotification)
    writeNotifications(notifications)
    
    return NextResponse.json(newNotification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, markAllRead } = body
    
    let notifications = readNotifications()
    
    if (markAllRead) {
      // Mark all as read
      notifications = notifications.map(n => ({ ...n, read: true }))
    } else if (id) {
      // Mark specific notification as read
      notifications = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    } else {
      return NextResponse.json(
        { error: 'Either id or markAllRead is required' },
        { status: 400 }
      )
    }
    
    writeNotifications(notifications)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

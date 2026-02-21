/**
 * TypeScript interfaces for Mission Control data structures
 * Generated from JSON data files in mission-control-data/
 * 
 * Note: These schemas extend the existing types in lib/types.ts
 */

// Social Posts Schema
export interface SocialPost {
  id: string
  title: string
  scheduledDate: string
  platforms: {
    linkedin?: {
      content: string
      status: 'draft' | 'ready' | 'sent' | 'scheduled'
    }
    x?: {
      content: string
      status: 'draft' | 'ready' | 'sent' | 'scheduled'
    }
  }
  tags: string[]
  createdAt: string
  updatedAt: string
  archivedAt?: string | null
  feedback?: string | null
  feedbackStatus?: 'pending' | 'done' | 'relayed'
}

export interface SocialPostsData {
  posts: SocialPost[]
}

// Stories Schema
export interface Story {
  id: string
  title: string
  year?: number
  creator?: string
  type: 'video' | 'audio' | 'interactive' | 'book'
  duration?: string
  ageRange: string
  copyrightStatus?: string
  synopsis: string
  rationale?: string
  ratings?: {
    developmental?: number
    therapeutic?: number
    emotionalArc?: number
    bedtime?: number
    nostalgia?: number
    cmsCompatibility?: number
    readTogether?: number
  }
  overall?: string
  status: 'Showcase' | 'Draft' | 'Review' | 'Archive'
  wave?: number
  sourceUrl?: string
  thumbnail?: string
  cmsNotes?: string
  parentHandoff?: string | null
  showcaseLayers?: string[]
}

// Lab Items Schema
export interface LabItem {
  id: string
  title: string
  description: string
  type: 'improvement' | 'feature' | 'fix' | 'experiment'
  status: 'shipped' | 'in-progress' | 'queued' | 'archived'
  builtBy: string
  builtDate?: string
  notes?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
}

// Pipeline Feedback Schema
export interface PipelineFeedback {
  id: string
  briefId: string
  feedback: string
  requestedBy?: string
  timestamp: string
  status: 'pending' | 'relayed' | 'resolved'
  relayedTo?: string | null
  resolvedAt?: string | null
}

// PRD Queue Schema
export interface PRDQueueItem {
  id: string
  briefId: string
  status: 'queued' | 'in-progress' | 'completed' | 'on-hold'
  requestedAt: string
  stages: {
    research: 'pending' | 'in-progress' | 'completed'
    clinical: 'pending' | 'in-progress' | 'completed'
    positioning: 'pending' | 'in-progress' | 'completed'
    synthesis: 'pending' | 'in-progress' | 'completed'
  }
}

// Agent Roster Schema
export interface Agent {
  name: string
  model: string
  status: 'active' | 'idle' | 'dormant' | 'completed' | 'approved'
  lastActivity: string | null
  task: string | null
}

// Sprint Metrics Schema
export interface SprintMetrics {
  lastUpdated: string
  currentSprint: {
    id: string
    name: string
    startDate: string
    totalTasks: number
    completedTasks: number
    inProgress: number
    blocked: number
    velocity: number
    estimatedCompletion: string
  }
  previousSprints: Array<{
    id: string
    name: string
    startDate: string
    completedDate: string
    totalTasks: number
    completedTasks: number
    velocity: number
    durationDays: number
  }>
  buildFrequency: {
    last7Days: number
    last30Days: number
    avgPerDay: number
  }
  contentOutput: {
    postsCreated: number
    postsSent: number
    blogDrafts: number
    videoScripts: number
    approvalsPending: number
    approvalsResolved: number
  }
  agentActivity: Record<string, Record<string, number>>
  milestones: Array<{
    date: string
    label: string
    type: 'achievement' | 'decision' | 'milestone'
  }>
}

// Decision Interactions Schema (currently empty but keeping structure)
export interface DecisionInteraction {
  id: string
  type: 'decision' | 'feedback' | 'approval'
  content: string
  context?: string
  timestamp: string
  outcome?: string
}

// Pipeline Stage Schema (from sprint pipeline files)
export interface PipelineStage {
  name: string
  items: Array<{
    title: string
    agent: string
    status: 'queued' | 'in-progress' | 'completed' | 'blocked'
  }>
}

export interface SprintPipeline {
  sprintId: string
  updatedAt: string
  stages: PipelineStage[]
}
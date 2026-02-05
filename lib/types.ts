export interface Project {
  id: string
  name: string
  codename?: string
  vision: string
  status: ProjectStatus
  priority: Priority
  category: Category
  started: string
  target_eta?: string
  last_active: string
  tags: string[]
  created_at?: string
  updated_at?: string
}

export type ProjectStatus =
  | '💡 Idea / Brainstorming'
  | '🔬 Research & Discovery'
  | '📐 Architecture & Planning'
  | '🏗 In Development'
  | '🧪 Testing / Review'
  | '✅ Completed'
  | '⏸️ Paused'
  | '🗄 Archived'

export type Priority = '🔴 Critical' | '🟠 High' | '🟡 Medium' | '🟢 Low'

export type Category = 'Personal' | 'Business' | 'Learning' | 'Client Work' | 'Side Project'

export interface Document {
  id: string
  title: string
  type: DocumentType
  file_format?: string
  content?: string
  word_count?: number
  summary?: string
  source_context?: string
  related_project_id?: string
  tags: string[]
  created_at?: string
  updated_at?: string
}

export type DocumentType =
  | '📝 Note / Scratchpad'
  | '📓 Journal Entry'
  | '📄 Document / Report'
  | '📜 Script'
  | '💻 Code / Technical'
  | '🔬 Research Summary'
  | '📧 Template'
  | '📊 Analysis / Data'
  | '🎯 Strategy / Plan'
  | '💡 Ideas / Brainstorm'

export interface Person {
  id: string
  name: string
  nickname?: string
  relationship: Relationship
  organization?: string
  profile_notes?: string
  contact_info?: ContactInfo
  last_contact?: string
  followup_reminder?: string
  tags: string[]
  created_at?: string
  updated_at?: string
}

export type Relationship =
  | '👥 Friend / Family'
  | '🤝 Collaborator / Partner'
  | '💼 Professional Contact'
  | '🎓 Mentor / Advisor'
  | '💰 Client / Customer'
  | '🌐 Community Member'
  | '📧 One-time Contact'

export interface ContactInfo {
  email?: string
  phone?: string
  linkedin?: string
  twitter?: string
  other?: string
}

export interface Memory {
  id: string
  title: string
  category: MemoryCategory
  content: string
  why_it_matters?: string
  memory_date: string
  related_project_id?: string
  source?: string
  tags: string[]
  created_at?: string
}

export type MemoryCategory =
  | '🎯 Decision Made (and reasoning)'
  | '📚 Learning / Insight'
  | '💡 Idea Captured'
  | '🔑 Key Context (background info)'
  | '⚠️ Mistake / Lesson Learned'
  | '🏆 Win / Achievement'
  | '📌 Reference'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  due_date?: string
  completed_date?: string
  notes?: string
  subtasks?: Subtask[]
  related_project_id?: string
  created_at?: string
  updated_at?: string
}

export type TaskStatus =
  | '📥 Backlog (captured but not started)'
  | '🎯 Up Next (queued for soon)'
  | '🔄 In Progress (actively working)'
  | '👀 Review / Waiting (blocked or needs input)'
  | '✅ Done'

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

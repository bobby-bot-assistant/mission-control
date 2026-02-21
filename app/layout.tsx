import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import CommandPalette from '@/components/CommandPalette'
import QuickCaptureWidget from '@/components/QuickCaptureWidget'
import NotificationBell from '@/components/NotificationBell'

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'External memory system for Daisy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { href: '/command', label: 'Command', icon: '🎯' },
    { href: '/approvals', label: 'Approvals', icon: '✅' },
    { href: '/pipeline', label: 'Pipeline', icon: '🚀' },
    { href: '/org', label: 'Organization', icon: '🏢' },
    { href: '/knowledge', label: 'Knowledge', icon: '📚' },
    { href: '/network', label: 'Network', icon: '👥' },
    { href: '/documents', label: 'Documents', icon: '📎' },
    { href: '/litigation', label: 'Litigation Intel', icon: '⚖️' },
    { href: '/briefings', label: 'Briefings', icon: '🔍' },
    { href: '/build-tracker', label: 'Build Tracker', icon: '🔨' },
    { href: '/lab', label: 'R&D Lab', icon: '🔬' },
    { href: '/insights', label: 'Insights', icon: '📊' },
    { href: '/content-studio', label: 'Content Studio', icon: '✍️' },
    { href: '/stories', label: 'Stories', icon: '🌙' },
    { href: '/review', label: 'CMS Review', icon: '📋' },
    { href: '/strategy', label: 'Strategy', icon: '🗺️' },
    { href: '/research', label: 'Research & Intel', icon: '🔬' },
    { href: '/research-briefs', label: 'NotebookLM Briefs', icon: '📚' },
    { href: '/agents', label: 'Agent Studio', icon: '🤖' },
    { href: '/design-lab', label: 'Design Lab', icon: '🎨' },
  ]

  return (
    <html lang="en">
      <body className="bg-background-subtle text-foreground min-h-screen flex">
        <CommandPalette />
        <QuickCaptureWidget />
        {/* Navigation Sidebar */}
        <nav className="w-64 bg-surface border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg font-semibold">Mission Control</h1>
              <ThemeToggle />
            </div>
            <p className="text-xs text-foreground-subtle">External Memory System</p>
          </div>
          <div className="flex-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <p className="text-xs text-foreground-subtle">Running on localhost:3002</p>
          </div>
        </nav>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-end px-6 py-3 border-b border-border bg-surface">
            <NotificationBell />
          </div>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}

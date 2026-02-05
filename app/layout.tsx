import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import CommandPalette from '@/components/CommandPalette'

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
    { href: '/executive', label: 'Executive', icon: '🎯' },
    { href: '/projects', label: 'Projects', icon: '📁' },
    { href: '/docs', label: 'Documents', icon: '📄' },
    { href: '/people', label: 'People', icon: '👥' },
    { href: '/memory', label: 'Memory', icon: '🧠' },
    { href: '/tasks', label: 'Tasks', icon: '✅' },
    { href: '/activity', label: 'Activity', icon: '📊' },
  ]

  return (
    <html lang="en">
      <body className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen flex">
        <CommandPalette />
        {/* Navigation Sidebar */}
        <nav className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg font-semibold">Mission Control</h1>
              <ThemeToggle />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">External Memory System</p>
          </div>
          <div className="flex-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Running on localhost:3001</p>
          </div>
        </nav>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  )
}

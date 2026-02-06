'use client'

import { useEffect, useState } from 'react'
import { Person, Relationship } from '@/lib/types'
import PersonModal from '@/components/people/PersonModal'

const RELATIONSHIP_FILTERS: (Relationship | 'All')[] = [
  'All',
  '👥 Friend / Family',
  '🤝 Collaborator / Partner', 
  '💼 Professional Contact',
  '🎓 Mentor / Advisor',
  '💰 Client / Customer',
  '🌐 Community Member',
  '📧 One-time Contact',
]

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editPerson, setEditPerson] = useState<Person | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [relationshipFilter, setRelationshipFilter] = useState<Relationship | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'lastContact' | 'recent'>('name')

  async function fetchPeople() {
    try {
      const url = searchQuery 
        ? `/api/people?q=${encodeURIComponent(searchQuery)}`
        : '/api/people'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setPeople(data)
      }
    } catch (error) {
      console.error('Failed to fetch people:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeople()
  }, [searchQuery])

  async function handleSave(personData: Partial<Person>) {
    if (editPerson) {
      // Update existing person
      await fetch('/api/people', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editPerson.id, ...personData }),
      })
    } else {
      // Create new person
      await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personData),
      })
    }
    fetchPeople()
    setEditPerson(null)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/people?id=${id}`, { method: 'DELETE' })
    setDeleteId(null)
    fetchPeople()
  }

  function openCreateModal() {
    setEditPerson(null)
    setModalOpen(true)
  }

  function openEditModal(person: Person) {
    setEditPerson(person)
    setModalOpen(true)
  }

  const filteredPeople = people.filter(p => {
    const matchesRelationship = relationshipFilter === 'All' || p.relationship === relationshipFilter
    return matchesRelationship
  })

  // Sort filtered people
  const sortedPeople = [...filteredPeople].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'lastContact':
        if (!a.last_contact && !b.last_contact) return 0
        if (!a.last_contact) return 1
        if (!b.last_contact) return -1
        return new Date(b.last_contact).getTime() - new Date(a.last_contact).getTime()
      case 'recent':
        return new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime()
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">People CRM</h1>
        <p className="text-zinc-500">Loading people...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">People CRM</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{people.length} person{people.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          + New Person
        </button>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search people..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 w-64 text-zinc-900 dark:text-zinc-100"
        />
        
        <select
          value={relationshipFilter}
          onChange={e => setRelationshipFilter(e.target.value as Relationship | 'All')}
          className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-zinc-900 dark:text-zinc-100"
        >
          {RELATIONSHIP_FILTERS.map(rel => (
            <option key={rel} value={rel}>
              {rel === 'All' ? 'All Relationships' : rel}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'lastContact' | 'recent')}
          className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-zinc-900 dark:text-zinc-100"
        >
          <option value="name">Sort by Name</option>
          <option value="lastContact">Sort by Last Contact</option>
          <option value="recent">Sort by Recently Added</option>
        </select>

        {(relationshipFilter !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setRelationshipFilter('All')
              setSearchQuery('')
            }}
            className="text-zinc-400 hover:text-zinc-200 text-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* People Grid */}
      {sortedPeople.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <p className="text-4xl mb-4">👥</p>
          <p className="text-lg font-medium mb-2">
            {people.length === 0 ? 'No people yet' : 'No matching people'}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {people.length === 0 
              ? 'Add your first contact to get started'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedPeople.map((person) => (
            <div 
              key={person.id}
              className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-lg">{person.name}</h3>
                    {person.nickname && (
                      <span className="text-sm text-zinc-400">({person.nickname})</span>
                    )}
                    <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded">
                      {person.relationship}
                    </span>
                  </div>
                  
                  {person.organization && (
                    <p className="text-zinc-400 text-sm mb-2">🏢 {person.organization}</p>
                  )}
                  
                  {person.profile_notes && (
                    <p className="text-zinc-400 mb-3">{person.profile_notes}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    {person.last_contact && (
                      <span className="px-2 py-1 bg-green-900/30 text-green-300 rounded">
                        Last contact: {new Date(person.last_contact).toLocaleDateString()}
                      </span>
                    )}
                    {person.followup_reminder && (
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded">
                        Remind: {new Date(person.followup_reminder).toLocaleDateString()}
                      </span>
                    )}
                    {person.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-zinc-800 rounded text-zinc-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(person)}
                    className="px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(person.id)}
                    className="px-3 py-1 text-sm bg-red-900/50 hover:bg-red-900 text-red-200 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 max-w-md">
            <h3 className="text-lg font-bold mb-2">Delete Person?</h3>
            <p className="text-zinc-400 mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-900 text-red-200 rounded hover:bg-red-900/80"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <PersonModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditPerson(null)
        }}
        onSave={handleSave}
        editPerson={editPerson}
      />
    </div>
  )
}
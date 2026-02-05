'use client'

import { useState, useEffect } from 'react'
import { Person, Relationship, ContactInfo } from '@/lib/types'

interface PersonModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (person: Partial<Person>) => Promise<void>
  editPerson?: Person | null
}

const RELATIONSHIP_OPTIONS: Relationship[] = [
  '👥 Friend / Family',
  '🤝 Collaborator / Partner',
  '💼 Professional Contact',
  '🎓 Mentor / Advisor',
  '💰 Client / Customer',
  '🌐 Community Member',
  '📧 One-time Contact',
]

export default function PersonModal({ isOpen, onClose, onSave, editPerson }: PersonModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    relationship: '💼 Professional Contact' as Relationship,
    organization: '',
    profile_notes: '',
    contact_info: {
      email: '',
      phone: '',
      linkedin: '',
      twitter: '',
      other: '',
    } as ContactInfo,
    last_contact: '',
    followup_reminder: '',
    tags: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editPerson) {
      setFormData({
        name: editPerson.name,
        nickname: editPerson.nickname || '',
        relationship: editPerson.relationship,
        organization: editPerson.organization || '',
        profile_notes: editPerson.profile_notes || '',
        contact_info: editPerson.contact_info || {
          email: '',
          phone: '',
          linkedin: '',
          twitter: '',
          other: '',
        },
        last_contact: editPerson.last_contact || '',
        followup_reminder: editPerson.followup_reminder || '',
        tags: editPerson.tags.join(', '),
      })
    } else {
      setFormData({
        name: '',
        nickname: '',
        relationship: '💼 Professional Contact',
        organization: '',
        profile_notes: '',
        contact_info: {
          email: '',
          phone: '',
          linkedin: '',
          twitter: '',
          other: '',
        },
        last_contact: '',
        followup_reminder: '',
        tags: '',
      })
    }
  }, [editPerson, isOpen])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      // Filter out empty contact info fields
      const cleanContactInfo: ContactInfo = {}
      if (formData.contact_info.email) cleanContactInfo.email = formData.contact_info.email
      if (formData.contact_info.phone) cleanContactInfo.phone = formData.contact_info.phone
      if (formData.contact_info.linkedin) cleanContactInfo.linkedin = formData.contact_info.linkedin
      if (formData.contact_info.twitter) cleanContactInfo.twitter = formData.contact_info.twitter
      if (formData.contact_info.other) cleanContactInfo.other = formData.contact_info.other

      await onSave({
        name: formData.name,
        nickname: formData.nickname || undefined,
        relationship: formData.relationship,
        organization: formData.organization || undefined,
        profile_notes: formData.profile_notes || undefined,
        contact_info: Object.keys(cleanContactInfo).length > 0 ? cleanContactInfo : undefined,
        last_contact: formData.last_contact || undefined,
        followup_reminder: formData.followup_reminder || undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      onClose()
    } catch (error) {
      console.error('Failed to save person:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-2xl p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {editPerson ? 'Edit Person' : 'Add New Person'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nickname</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
                placeholder="What you call them"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Relationship</label>
              <select
                value={formData.relationship}
                onChange={e => setFormData({ ...formData, relationship: e.target.value as Relationship })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              >
                {RELATIONSHIP_OPTIONS.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Organization</label>
              <input
                type="text"
                value={formData.organization}
                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
                placeholder="Company, group, etc."
              />
            </div>
          </div>

          {/* Profile Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Profile Notes</label>
            <textarea
              rows={3}
              value={formData.profile_notes}
              onChange={e => setFormData({ ...formData, profile_notes: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              placeholder="Background, interests, how you know them..."
            />
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-sm font-medium mb-2">Contact Information</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="email"
                value={formData.contact_info.email}
                onChange={e => setFormData({ 
                  ...formData, 
                  contact_info: { ...formData.contact_info, email: e.target.value }
                })}
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
                placeholder="Email"
              />
              <input
                type="text"
                value={formData.contact_info.phone}
                onChange={e => setFormData({ 
                  ...formData, 
                  contact_info: { ...formData.contact_info, phone: e.target.value }
                })}
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
                placeholder="Phone"
              />
              <input
                type="text"
                value={formData.contact_info.linkedin}
                onChange={e => setFormData({ 
                  ...formData, 
                  contact_info: { ...formData.contact_info, linkedin: e.target.value }
                })}
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
                placeholder="LinkedIn"
              />
              <input
                type="text"
                value={formData.contact_info.twitter}
                onChange={e => setFormData({ 
                  ...formData, 
                  contact_info: { ...formData.contact_info, twitter: e.target.value }
                })}
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
                placeholder="Twitter/X"
              />
            </div>
            <input
              type="text"
              value={formData.contact_info.other}
              onChange={e => setFormData({ 
                ...formData, 
                contact_info: { ...formData.contact_info, other: e.target.value }
              })}
              className="w-full mt-2 bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              placeholder="Other contact info"
            />
          </div>

          {/* Interaction Tracking */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Last Contact</label>
              <input
                type="date"
                value={formData.last_contact}
                onChange={e => setFormData({ ...formData, last_contact: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Follow-up Reminder</label>
              <input
                type="date"
                value={formData.followup_reminder}
                onChange={e => setFormData({ ...formData, followup_reminder: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
              placeholder="colleague, mentor, investor"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editPerson ? 'Save Changes' : 'Add Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
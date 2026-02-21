'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface OpportunitySource {
  id: string
  name: string
  icon: string
  description: string
  frequency: string
  lastChecked?: string
  opportunities: number
  status: 'active' | 'pending' | 'error' | 'disabled'
  color: string
}

interface Opportunity {
  id: string
  title: string
  source: string
  timestamp: string
  crisis?: string
  initialScore?: number
  status: 'new' | 'reviewing' | 'captured'
}

export default function MonitoringPage() {
  const router = useRouter()
  const [sources, setSources] = useState<OpportunitySource[]>([])
  const [recentOpportunities, setRecentOpportunities] = useState<Opportunity[]>([])
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [showCaptureModal, setShowCaptureModal] = useState(false)
  const [captureData, setCaptureData] = useState({
    title: '',
    source: '',
    crisis: '',
    description: '',
    initialScore: 0
  })

  useEffect(() => {
    loadSources()
    loadRecentOpportunities()
  }, [])

  const loadSources = () => {
    setSources([
      {
        id: 'grants',
        name: 'Government Grants',
        icon: '🏛️',
        description: 'NIH, NIMH, NSF funding opportunities',
        frequency: 'Daily',
        lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        opportunities: 3,
        status: 'active',
        color: 'bg-blue-500'
      },
      {
        id: 'litigation',
        name: 'Active Litigation',
        icon: '⚖️',
        description: 'Social media harm cases, cy pres opportunities',
        frequency: 'Daily during trials',
        lastChecked: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), // 30 min ago
        opportunities: 1,
        status: 'active',
        color: 'bg-purple-500'
      },
      {
        id: 'conferences',
        name: 'Conference Coverage',
        icon: '🎙️',
        description: 'Mental health, pediatric, and tech conferences',
        frequency: 'As scheduled',
        lastChecked: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        opportunities: 0,
        status: 'pending',
        color: 'bg-green-500'
      },
      {
        id: 'research',
        name: 'Academic Research',
        icon: '🔬',
        description: 'PubMed alerts, breakthrough studies',
        frequency: 'Weekly',
        lastChecked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        opportunities: 2,
        status: 'active',
        color: 'bg-amber-500'
      },
      {
        id: 'partnerships',
        name: 'Partnership Leads',
        icon: '🤝',
        description: 'Inbound interest, strategic connections',
        frequency: 'As received',
        opportunities: 0,
        status: 'pending',
        color: 'bg-teal-500'
      },
      {
        id: 'gaps',
        name: 'Internal Gaps',
        icon: '💡',
        description: 'Mission needs, Bobby requests, strategic gaps',
        frequency: 'Continuous',
        opportunities: 1,
        status: 'active',
        color: 'bg-pink-500'
      }
    ])
  }

  const loadRecentOpportunities = () => {
    setRecentOpportunities([
      {
        id: '1',
        title: 'NIMH Digital Mental Health NOFO PA-23-265',
        source: 'grants',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        crisis: 'Pediatric Mental Health',
        initialScore: 28,
        status: 'new'
      },
      {
        id: '2',
        title: 'Meta/YouTube Trial - LA County Superior Court',
        source: 'litigation',
        timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
        crisis: 'Screen Time & Attention',
        initialScore: 31,
        status: 'reviewing'
      },
      {
        id: '3',
        title: 'Infant Mental Health Detection Gap',
        source: 'gaps',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        crisis: 'Pediatric Mental Health',
        initialScore: 29.5,
        status: 'captured'
      }
    ])
  }

  const getTimeSince = (isoString?: string) => {
    if (!isoString) return 'Never'
    
    const now = Date.now()
    const then = new Date(isoString).getTime()
    const diff = now - then
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  const handleCapture = () => {
    // Create a new opportunity with initial SDS score
    const newOpp: Opportunity = {
      id: Date.now().toString(),
      title: captureData.title,
      source: captureData.source,
      timestamp: new Date().toISOString(),
      crisis: captureData.crisis,
      initialScore: captureData.initialScore,
      status: 'new'
    }
    
    setRecentOpportunities([newOpp, ...recentOpportunities])
    setShowCaptureModal(false)
    setCaptureData({
      title: '',
      source: '',
      crisis: '',
      description: '',
      initialScore: 0
    })
    
    // Navigate to pipeline with the new opportunity
    router.push('/pipeline')
  }

  const getStatusColor = (status: OpportunitySource['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400'
      case 'pending': return 'text-amber-600 dark:text-amber-400'
      case 'error': return 'text-red-600 dark:text-red-400'
      default: return 'text-foreground-subtle'
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-foreground-subtle'
    if (score >= 30) return 'text-green-600 dark:text-green-400'
    if (score >= 25) return 'text-amber-600 dark:text-amber-400'
    if (score >= 18) return 'text-blue-600 dark:text-blue-400'
    return 'text-foreground-muted'
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">📡 Monitoring Dashboard</h1>
            <p className="text-foreground-muted">6 sources, continuous opportunity capture</p>
          </div>
          <button
            onClick={() => setShowCaptureModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            + Manual Capture
          </button>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {sources.map(source => (
          <div
            key={source.id}
            className={`bg-surface border border-border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer ${
              selectedSource === source.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedSource(source.id === selectedSource ? null : source.id)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{source.icon}</span>
                <div>
                  <h3 className="font-semibold">{source.name}</h3>
                  <p className="text-sm text-foreground-muted">{source.description}</p>
                </div>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(source.status)}`}>
                {source.status}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-foreground-subtle mb-1">Frequency</p>
                <p className="font-medium">{source.frequency}</p>
              </div>
              <div>
                <p className="text-sm text-foreground-subtle mb-1">Last Check</p>
                <p className="font-medium">{getTimeSince(source.lastChecked)}</p>
              </div>
            </div>

            {/* Opportunities Count */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm text-foreground-muted">Open opportunities</span>
              <span className={`text-2xl font-bold ${source.opportunities > 0 ? 'text-primary' : 'text-foreground-subtle'}`}>
                {source.opportunities}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        
        {recentOpportunities.length === 0 ? (
          <p className="text-foreground-subtle text-center py-8">No recent opportunities captured</p>
        ) : (
          <div className="space-y-3">
            {recentOpportunities.map(opp => {
              const source = sources.find(s => s.id === opp.source)
              
              return (
                <div
                  key={opp.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (opp.status === 'captured') {
                      router.push('/pipeline')
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{source?.icon || '❓'}</span>
                    <div>
                      <h4 className="font-medium">{opp.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-foreground-muted">
                        <span>{source?.name}</span>
                        {opp.crisis && (
                          <>
                            <span>•</span>
                            <span>{opp.crisis}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{getTimeSince(opp.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {opp.initialScore && (
                      <span className={`font-bold ${getScoreColor(opp.initialScore)}`}>
                        SDS: {opp.initialScore}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      opp.status === 'new' ? 'bg-info text-white' :
                      opp.status === 'reviewing' ? 'bg-warning text-white' :
                      'bg-success text-white'
                    }`}>
                      {opp.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Capture Modal */}
      {showCaptureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Capture Opportunity</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={captureData.title}
                  onChange={e => setCaptureData({ ...captureData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  placeholder="Brief description of the opportunity"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Source</label>
                <select
                  value={captureData.source}
                  onChange={e => setCaptureData({ ...captureData, source: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                >
                  <option value="">Select source...</option>
                  {sources.map(source => (
                    <option key={source.id} value={source.id}>
                      {source.icon} {source.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Crisis Alignment</label>
                <select
                  value={captureData.crisis}
                  onChange={e => setCaptureData({ ...captureData, crisis: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                >
                  <option value="">Select crisis...</option>
                  <option value="Pediatric Mental Health">Crisis 1: Pediatric Mental Health</option>
                  <option value="Screen Time & Attention">Crisis 2: Screen Time & Attention</option>
                  <option value="AI Identity Collapse">Crisis 3: AI Identity Collapse</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={captureData.description}
                  onChange={e => setCaptureData({ ...captureData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  rows={3}
                  placeholder="Additional details about the opportunity..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Initial SDS Score: {captureData.initialScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={captureData.initialScore}
                  onChange={e => setCaptureData({ ...captureData, initialScore: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground-subtle mt-1">
                  <span>0</span>
                  <span>Low (18)</span>
                  <span>Med (25)</span>
                  <span>High (30)</span>
                  <span>40</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCapture}
                disabled={!captureData.title || !captureData.source}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
              >
                Capture
              </button>
              <button
                onClick={() => setShowCaptureModal(false)}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client';

import { useState } from 'react';

interface AgentNode {
  id: string;
  name: string;
  title: string;
  role: string[];
  model: string;
  modelCost: string;
  status: 'active' | 'idle' | 'error' | 'proposed' | 'dormant';
  channel: string;
  workspace: string;
  autonomy: 'default-yes' | 'light-confirm' | 'always-approve';
  reportsTo: string;
  description: string;
}

const agents: AgentNode[] = [
  {
    id: 'daisy',
    name: 'Daisy 🌼',
    title: 'AI Co-Founder & Chief of Staff',
    role: ['Strategy', 'Orchestration', 'Coordinator'],
    model: 'Claude Opus 4.6 / Anthropic',
    modelCost: '$15/$75 per 1M',
    status: 'active',
    channel: 'Telegram (main)',
    workspace: '/workspace',
    autonomy: 'light-confirm',
    reportsTo: '',
    description: 'AI Co-Founder & Chief of Staff. Strategy & orchestration (coordinator, no code).'
  },
  {
    id: 'kobe',
    name: 'Kobe',
    title: 'LinkedIn Thought Leader',
    role: ['LinkedIn Content Strategy', 'Content Drafting', 'Social Media'],
    model: 'Claude Opus 4.6 / Anthropic',
    modelCost: '$15/$75 per 1M',
    status: 'active',
    channel: 'Internal only',
    workspace: '/workspace/content (W), /workspace/research (R)',
    autonomy: 'default-yes',
    reportsTo: 'daisy',
    description: 'LinkedIn Thought Leader. Opus 4.6/Anthropic, LinkedIn content strategy.'
  },
  {
    id: 'billy',
    name: 'Billy',
    title: 'Lead Engineer',
    role: ['MC Code & Infrastructure', 'Code Implementation', 'Technical Docs'],
    model: 'MiniMax M2.5 / MiniMax',
    modelCost: '$0.40/$0.60 per 1M',
    status: 'active',
    channel: 'Internal only',
    workspace: '/workspace/code, /workspace/mission-control',
    autonomy: 'default-yes',
    reportsTo: 'daisy',
    description: 'Lead Engineer. MiniMax M2.5/MiniMax, MC code & infrastructure.'
  },
  {
    id: 'milo',
    name: 'Milo',
    title: 'CMS Engineer',
    role: ['Story Hour CMS & Player', 'CMS Creator Tool', 'API Pipeline', 'Timeline Editor'],
    model: 'MiniMax M2.5 / MiniMax',
    modelCost: '$0.40/$0.60 per 1M',
    status: 'active',
    channel: 'Internal only',
    workspace: '/workspace/code/cms, /workspace/content/episodes',
    autonomy: 'default-yes',
    reportsTo: 'daisy',
    description: 'CMS Engineer. MiniMax M2.5/MiniMax, Story Hour CMS & player.'
  },
  {
    id: 'bolt',
    name: 'Bolt ⚡',
    title: 'Deploy Pipeline',
    role: ['CI/CD', 'Build Pipeline', 'Deployment', 'Verification'],
    model: 'MiniMax M2.5 / MiniMax',
    modelCost: '$0.40/$0.60 per 1M',
    status: 'proposed',
    channel: 'Internal only',
    workspace: '/workspace/code',
    autonomy: 'light-confirm',
    reportsTo: 'daisy',
    description: 'Deploy Pipeline. MiniMax M2.5/MiniMax, CI/CD (approved, not built yet).'
  },
  {
    id: 'fern',
    name: 'Fern',
    title: 'Developmental Reviewer',
    role: ['Child Psych Reviews', 'Developmental Review', 'Interactive Layer Design'],
    model: 'MiniMax M2.5 / MiniMax',
    modelCost: '$0.40/$0.60 per 1M',
    status: 'active',
    channel: 'Internal only',
    workspace: '/workspace/content-research, /workspace/code/story-hour',
    autonomy: 'default-yes',
    reportsTo: 'daisy',
    description: 'Developmental Reviewer. MiniMax M2.5/MiniMax, child psych reviews.'
  },
  {
    id: 'iris',
    name: 'Iris',
    title: 'Illustration Artist',
    role: ['Needle-felted Art Generation', 'Illustrations', 'Visual Design'],
    model: 'Gemini 3 Pro / Google',
    modelCost: '$1.25/$5.00 per 1M',
    status: 'active',
    channel: 'Internal only',
    workspace: '/workspace/content/library, /workspace/research',
    autonomy: 'default-yes',
    reportsTo: 'daisy',
    description: 'Illustration Artist. Gemini 3 Pro/Google, needle-felted art generation.'
  },
  {
    id: 'scout',
    name: 'Scout',
    title: 'Research & Briefings',
    role: ['Competitive Intel', 'Social Listening', 'Research Briefings'],
    model: 'Brave Search + Gemini',
    modelCost: '~$0.50/$1.50 per 1M (blended)',
    status: 'active',
    channel: 'Internal only',
    workspace: '/workspace/research (R), /workspace/monitoring (W)',
    autonomy: 'default-yes',
    reportsTo: 'daisy',
    description: 'Research & Briefings. Brave Search + Gemini, competitive intel.'
  },
  {
    id: 'river',
    name: 'River 🌊',
    title: 'PM & Relay',
    role: ['MC Sync', 'Cron Jobs', 'Feedback Relay', 'Program Management'],
    model: 'Qwen 3 8B / LM Studio (local)',
    modelCost: '$0 (local)',
    status: 'active',
    channel: 'Internal only',
    workspace: '/workspace/mission-control-data',
    autonomy: 'default-yes',
    reportsTo: 'daisy',
    description: 'PM & Relay. Qwen 3 8B/LM Studio (local, $0), MC sync, cron jobs, feedback relay.'
  },
  {
    id: 'harper',
    name: 'Harper',
    title: 'QA Engineer',
    role: ['Automated Testing', 'Quality Assurance', 'UX Evaluation', 'Playwright'],
    model: 'Playwright + multi-model (Gemini 3 Pro, GPT-5.2-Codex, M2.5, DeepSeek R1 Distill)',
    modelCost: 'Blended ~$2-5 per 1M',
    status: 'active',
    channel: 'Internal only',
    workspace: '/workspace/code/story-hour/tests',
    autonomy: 'default-yes',
    reportsTo: 'daisy',
    description: 'QA Engineer. Playwright + multi-model (Gemini 3 Pro, GPT-5.2-Codex, M2.5, DeepSeek R1 Distill), automated testing.'
  }
];

function getStatusColor(status: string) {
  switch(status) {
    case 'active': return 'bg-green-500';
    case 'idle': return 'bg-amber-500';
    case 'error': return 'bg-red-500';
    case 'proposed': return 'bg-blue-500';
    case 'dormant': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
}

function getNodeBorderColor(id: string) {
  switch(id) {
    case 'daisy': return 'border-emerald-500';
    case 'scout': return 'border-blue-500';
    case 'billy': return 'border-orange-500';
    case 'kobe': return 'border-pink-500';
    case 'harper': return 'border-teal-500';
    case 'iris': return 'border-amber-500';
    case 'milo': return 'border-indigo-500';
    case 'fern': return 'border-green-500';
    case 'river': return 'border-cyan-500';
    case 'bolt': return 'border-red-500';
    default: return 'border-border';
  }
}

export default function OrgChart() {
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(null);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">👥 Organization Chart</h1>
        <p className="text-foreground-muted">
          Agent hierarchy and reporting structure
        </p>
      </div>

      {/* Visual Org Chart */}
      <div className="bg-surface border border-border rounded-lg p-12 mb-6">
        <div className="flex flex-col items-center space-y-12">
          
          {/* Daisy - AI Co-Founder & Chief of Staff */}
          <div 
            className={`relative bg-surface border-2 ${getNodeBorderColor('daisy')} rounded-lg p-6 w-80 cursor-pointer transform hover:scale-105 transition-all shadow-lg`}
            onClick={() => setSelectedAgent(agents[0])}
          >
            <div className="absolute -top-2 -right-2">
              <div className={`w-4 h-4 ${getStatusColor('active')} rounded-full animate-pulse`} />
            </div>
            <h3 className="text-xl font-bold mb-1 text-foreground">🌼 {agents[0].name}</h3>
            <p className="text-sm text-foreground-muted mb-3">{agents[0].title}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {agents[0].role.map(r => (
                <span key={r} className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full">
                  {r}
                </span>
              ))}
            </div>
            <p className="text-xs text-foreground-muted">{agents[0].model} · {agents[0].modelCost}</p>
          </div>

          {/* Connection Line */}
          <div className="w-0.5 h-16 bg-surface-hover" />

          {/* Branch to sub-agents */}
          <div className="relative w-full max-w-6xl">
            <div className="absolute top-0 left-1/2 w-0.5 h-12 bg-surface-hover -translate-x-1/2" />
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-surface-hover" />
            {agents.filter(a => a.reportsTo === 'daisy').map((_, i, arr) => (
              <div key={i} className="absolute top-12 w-0.5 h-12 bg-surface-hover" style={{ left: `${((i + 0.5) / arr.length) * 100}%` }} />
            ))}
            
            <div className="grid grid-cols-3 gap-4 pt-24">
              {agents.filter(a => a.reportsTo === 'daisy').map(agent => {
                const emojis: Record<string, string> = { scout: '🔍', billy: '🔨', kobe: '✍️', harper: '🔎', iris: '🌸', milo: '⚙️', fern: '🌿', river: '🌊', bolt: '⚡' };
                const tagColors: Record<string, string> = {
                  scout: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
                  billy: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
                  kobe: 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
                  harper: 'bg-teal-500/20 text-teal-700 dark:text-teal-300',
                  iris: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
                  milo: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
                  fern: 'bg-green-500/20 text-green-700 dark:text-green-300',
                  river: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
                  bolt: 'bg-red-500/20 text-red-700 dark:text-red-300',
                };
                const isInactive = agent.status === 'proposed' || agent.status === 'dormant';
                const badgeLabel = agent.status === 'proposed' ? 'PROPOSED' : agent.status === 'dormant' ? 'DORMANT' : '';
                const badgeColor = agent.status === 'proposed' ? 'bg-blue-500' : 'bg-gray-500';
                return (
                  <div 
                    key={agent.id}
                    className={`relative bg-surface border-2 ${getNodeBorderColor(agent.id)} rounded-lg p-5 cursor-pointer transform hover:scale-105 transition-all shadow-lg ${isInactive ? 'opacity-75' : ''}`}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <div className="absolute -top-2 -right-2">
                      <div className={`w-4 h-4 ${getStatusColor(agent.status)} rounded-full ${agent.status === 'active' ? 'animate-pulse' : ''}`} />
                    </div>
                    {isInactive && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <span className={`text-xs ${badgeColor} text-white px-2 py-0.5 rounded-full`}>{badgeLabel}</span>
                      </div>
                    )}
                    <h3 className="text-lg font-bold mb-1 text-foreground">{emojis[agent.id] || '🤖'} {agent.name}</h3>
                    <p className="text-sm text-foreground-muted mb-2">{agent.title}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {agent.role.map(r => (
                        <span key={r} className={`text-xs px-2 py-0.5 rounded-full ${tagColors[agent.id] || 'bg-gray-500/20 text-gray-300'}`}>
                          {r}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-foreground-muted">{agent.model}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">{agent.modelCost}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Agent Details: {selectedAgent.name}</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-foreground-subtle mb-2">Technical Specifications</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-foreground-muted">Model</dt>
                  <dd className="text-sm">{selectedAgent.model} · {selectedAgent.modelCost}</dd>
                </div>
                <div>
                  <dt className="text-xs text-foreground-muted">Channel</dt>
                  <dd className="text-sm">{selectedAgent.channel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-foreground-muted">Workspace</dt>
                  <dd className="text-sm font-mono">{selectedAgent.workspace}</dd>
                </div>
                <div>
                  <dt className="text-xs text-foreground-muted">Autonomy Level</dt>
                  <dd className="text-sm">{selectedAgent.autonomy.replace('-', ' ').toUpperCase()}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground-subtle mb-2">Role & Responsibilities</h3>
              <p className="text-sm mb-3">{selectedAgent.description}</p>
              <div className="flex flex-wrap gap-2">
                {selectedAgent.role.map(r => (
                  <span key={r} className="text-xs px-2 py-1 bg-background-subtle text-foreground-muted rounded">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
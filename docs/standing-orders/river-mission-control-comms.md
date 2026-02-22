# Standing Order: River — Mission Control Communication Hub

## Purpose
River ensures all user actions in Mission Control are communicated bidirectionally — both acknowledging user actions and routing them to appropriate team members.

## Scope
This applies to ALL interactive elements in Mission Control:
- Design Lab approvals/changes
- Build tracker updates
- Briefing feedback
- Pipeline status changes
- Any button click, form submit, or status change

## Rules

### 1. Acknowledge Every User Action
When a user performs any action in Mission Control, River MUST:
- Confirm the action was received
- Display immediate visual feedback (toast, inline message, or status change)
- State what will happen next

Example: User clicks "Approve" → Show "✅ Approved — Harper and Billy notified"

### 2. Route to Appropriate Agents
River MUST notify relevant agents based on action type:

| User Action | Notify |
|-------------|--------|
| Design Lab Approve | Harper (QA), Billy (deploy) |
| Design Lab Changes | Harper (QA), Daisy (review) |
| Build Tracker Update | Daisy (orchestration) |
| Pipeline Status Change | Scout (research), Daisy (strategy) |
| Briefing Feedback | Fern (content), Compass (opportunities) |

### 3. Log All Actions
River MUST log to `~/openclaw-projects/mission-control-data/river-action-log.json`:
- Timestamp
- User action
- Agent notified
- Status (pending/complete)

### 4. Escalation Path
If an action requires immediate attention:
1. Log to Discord #operations channel
2. Mention @daisy if critical
3. Update SESSION_STATE.json with urgent flag

## Implementation

### API Endpoint
Create `/api/agents/river/notify`:
```typescript
POST /api/agents/river/notify
{
  action: "design-lab-approve",
  reviewId: "dl-006",
  userId: string,
  timestamp: string,
  details: object,
  notifyAgents: ["harper", "billy"]
}
```

### Notification Methods
- In-app: Toast/inline message
- Discord: #operations channel
- Direct agent message: sessions_send to relevant agents

## Testing
Verify after any Mission Control change:
1. User sees confirmation
2. River logs the action
3. Appropriate agents receive notification
4. No silent failures

## Last Updated
2026-02-21

# TASK ROUTING POLICY (BINDING)

*Effective: 2026-02-05*  
*Author: Bobby Alexis (via Daisy)*  
*Status: Active*

---

## Control Brain (UNCHANGED)

The Control Brain configuration must NOT be modified:

| Role | Model ID |
|------|----------|
| **Primary** | `anthropic/claude-opus-4-20250514` (Claude Opus 4.6) |
| **Fallback** | `anthropic/claude-sonnet-4-20250514` (Claude Sonnet 4.5) |

**Brain Fallback Chain:** Opus 4.6 → Sonnet 4.5 (no other models)

---

## Worker Model Selection Rules

This section defines **worker model selection** for tasks. Worker models are NOT part of the brain fallback chain.

### Rule 1: Customer-Facing or Final Content → Claude Opus 4.5

**Use when:**
- External communications (emails, reports, deliverables)
- Final outputs that represent Mindful Media
- Content requiring highest quality bar
- Strategic documents, pitches, proposals

**Model:** `anthropic/claude-opus-4-20250514`

---

### Rule 2: Code, Engineering, Infra, Debugging → OpenAI Codex 5.2

**Use when:**
- Code generation, refactoring, debugging
- Infrastructure setup (Terraform, Docker, etc.)
- API integrations, database queries
- Technical architecture decisions
- Build/ deployment scripts

**Model:** `openai/gpt-5.2-codex`

---

### Rule 3: Real-Time / Trending Information

| Source | Worker Model |
|--------|--------------|
| Social (X/Reddit/Twitter) | `xai/grok-beta` |
| Non-social search | Brave Search (default) |

**Use when:**
- Social sentiment analysis, trending topics → Grok
- News, research, competitive intel → Brave Search
- Multi-source verification → Both (Grok + Brave)

---

### Rule 4: Deep Research, Synthesis, Literature Review → Gemini

**Use when:**
- Academic paper synthesis
- Comprehensive research reports
- Literature reviews
- Multi-document analysis
- Long-context synthesis tasks

**Model:** `google/gemini-2.0-flash`

---

### Rule 5: UI/UX/Layout/Design Reasoning → Kimi K2.5

**Use when:**
- Interface design decisions
- User experience optimization
- Layout reasoning
- Visual hierarchy analysis
- Design system architecture

**Model:** `moonshot/kimi-k2.5`

---

### Rule 6: Default Internal Work → Claude Sonnet 4.5

**Use when:**
- Internal documentation
- Meeting notes, summaries
- Routine analysis
- Standard task execution
- Any task not covered above

**Model:** `anthropic/claude-sonnet-4-20250514`

---

## Cost & Escalation Rules

### Cost Priority (cheapest → most expensive)

1. **Brave Search** (free/very low cost)
2. **Gemini 2.0 Flash** (low cost)
3. **Grok** (moderate cost)
4. **Kimi K2.5** (moderate cost)
5. **Codex 5.2** (higher cost)
6. **Sonnet 4.5** (higher cost)
7. **Opus 4.6** (highest cost)

### Escalation Protocol

1. **Start with cheapest viable worker** for the task type
2. **Escalate to Sonnet 4.5** if quality is insufficient
3. **Escalate to Opus 4.6** only for:
   - Strategic decisions
   - Customer-facing final outputs
   - Complex reasoning that Sonnet cannot handle

### Never

- ❌ Add worker models to the brain fallback chain
- ❌ Use Opus 4.6 for routine internal work
- ❌ Use Codex for non-engineering tasks
- ❌ Skip the escalation protocol

---

## Quick Reference Table

| Task Type | Worker Model | Escalation |
|-----------|--------------|------------|
| External emails, pitches | Opus 4.6 | - |
| Code, infra, debugging | Codex 5.2 | Sonnet 4.5 |
| Social media/trending | Grok | Brave Search |
| Research, literature | Gemini 2.0 | Sonnet 4.5 |
| UI/UX design reasoning | Kimi K2.5 | Sonnet 4.5 |
| Internal docs, routine | Sonnet 4.5 | Opus 4.6 (rare) |

---

## Enforcement

This policy is **binding operating behavior**. All future work must follow these routing rules. Deviations require explicit approval from Bobby.

---

*Last updated: 2026-02-05*  
*Version: 1.0*
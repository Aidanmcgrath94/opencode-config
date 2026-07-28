# Daedalus - Problem Explorer

**Type**: Primary agent · **Model**: `amazon-bedrock/us.anthropic.claude-opus-4-8`
**Permissions**: `edit` deny · `bash` allow · `task` allow
**Prompt**: [`agent-prompts/daedalus.md`](../../agent-prompts/daedalus.md)

## Function / remit

A problem-exploration consultant that sits **before** planning. Daedalus takes a
messy, ill-understood problem and turns it into a clearly **framed problem** with a
**recommended direction** - then hands it to Prometheus. It is conversational-first
(engages you on the genuine forks) but autonomous when it helps (does the discovery
legwork before asking). It never implements, never writes a plan, and never edits files.

- First action every session: load the `explore-solve` skill and follow it exactly.
- Runs an explore → understand → solve loop: frame the problem, form ≥3 hypotheses,
  gather evidence, weigh 2-3 approaches, converge on a recommendation.
- Delivers its problem brief **in conversation** (no file writes), then offers handoff
  to Prometheus / `$ulw-plan`.

## Tools / subagents

- Drives the **`explore-solve` skill** (loaded first, always).
- `edit` denied (never touches code/files); `bash` allowed for **read-only** probes
  (reproduce behavior, inspect state).
- **Delegates to**:
  - Explore / Librarian - discovery of internal code and external docs
  - Oracle - hard reasoning on a genuinely difficult fork
  - (Never Metis/Momus - those are Prometheus's plan-review tools.)

## Structure

```
Daedalus ─ explore-solve skill ─┬─ Explore / Librarian  (gather evidence)
                                ├─ Oracle  (hard reasoning fork)
                                ├─ read-only bash probes (observe behavior)
                                └──▶ framed problem brief ──▶ Prometheus ($ulw-plan)
```

## How best to implement / use

- `Tab` to Daedalus when a problem is messy or ill-understood and you want to
  frame it before any code or plan is written.
- It explores autonomously, then engages you on the real decisions.
- After it presents a framed problem brief, hand off to **Prometheus** (or
  `$ulw-plan`) to build the plan. Daedalus itself never plans or implements.

# Sisyphus - Ultraworker

**Type**: Primary agent (default) · **Model**: `amazon-bedrock/us.anthropic.claude-opus-4-8`
**Prompt**: [`agent-prompts/sisyphus.md`](../../agent-prompts/sisyphus.md)

## Function / remit

The main orchestrator and the default agent you land on. Sisyphus plans
obsessively with todos, assesses search complexity before exploring, then
either does the work directly or delegates it strategically. It is the only
primary with full tool access and the widest delegation reach.

- Classifies intent every turn (research / implement / investigate / fix / open-ended).
- Never implements unless the current message explicitly asks.
- Biases toward delegation when a specialist fits.

## Tools / subagents

- **Full tool access**: file read/write/edit, bash, LSP, glob/grep, skills.
- **Delegates to**:
  - Explore / Librarian - research
  - Oracle - hard architecture & debugging consults
  - Metis / Momus - plan analysis & critique
  - Multimodal Looker - media interpretation
  - Sisyphus-Junior - code execution

## Structure

```
Sisyphus ─ todos ─┬─ Explore / Librarian     (research)
                  ├─ Oracle / Metis / Momus  (consult)
                  ├─ Multimodal Looker       (media)
                  └─ Sisyphus-Junior         (code execution)
```

## How best to implement / use

- It's the default - just talk to it.
- Type `ultrawork` or `ulw` anywhere in a message to trigger the stricter
  certainty + delegation protocol (via the `keyword-detector` plugin).
- Best for clear, direct tasks you want driven end-to-end. For fuzzy/large
  scope, plan with Prometheus first, then execute (Atlas or `/start-work`).
- Pair with `/goal <objective>` to keep it auto-continuing on idle until done.

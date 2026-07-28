# Multimodal Looker - Vision

**Type**: Subagent (`task()` only, hidden) · **Model**: `amazon-bedrock/us.anthropic.claude-sonnet-4-6`
**Permissions**: `edit` deny · `bash` deny · `task` deny (no tools at all)
**Prompt**: [`agent-prompts/multimodal-looker.md`](../../agent-prompts/multimodal-looker.md)

## Function / remit

Interprets media files that can't be read as plain text - PDFs, images,
diagrams. It analyzes an **attached** file directly and returns only the
requested extraction, saving the main agent's context tokens.

- PDFs/documents: extract text, structure, tables, data from specific sections.
- Images: describe layouts, UI elements, text, charts.
- Diagrams: explain relationships, flows, architecture depicted.
- Multiple files: analyzes each; compares/contrasts if the goal asks.

## Tools / subagents

- **None.** It never calls tools, never spawns agents, never loads files by path.
- Works purely on the attachment(s) already in its context.

## Structure

```
Multimodal Looker ─ attached media + goal ─▶ extracted info only ─▶ main agent
```

## How best to implement / use

- **Attach the file(s)** to its context and state exactly what to extract.
- Use when you need *analyzed/extracted* data, not literal file contents.
- Do NOT use for source code / plain text (main agent should read those
  directly), or for files that need editing afterward.
- Be specific in the goal - it's thorough on the goal, concise on everything else.

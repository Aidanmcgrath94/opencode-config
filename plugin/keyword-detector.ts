import type { Plugin } from "@opencode-ai/plugin"

// Adapted from oh-my-openagent's keyword-detector hook, trimmed to the
// "ultrawork"/"ulw" trigger only (team-mode and hyperplan triggers dropped -
// they depend on plugin-only team infrastructure that isn't ported here).
//
// When the user types "ultrawork" or "ulw" as a whole word in a message,
// prepend a banner instructing the agent to apply a stricter certainty +
// delegation protocol before it starts working.

const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g
const INLINE_CODE_PATTERN = /`[^`]+`/g
const ULTRAWORK_PATTERN = /\b(ultrawork|ulw)\b/i
const SLASH_COMMAND_LEAD_PATTERN = /^\s*\/[a-zA-Z][\w-]*(?:\s|$)/

// Subagents that shouldn't get the banner injected into their own internal
// task-delegation turns - only the agent you're actually talking to should.
const SUBAGENT_NAMES = new Set([
  "Explore - Codebase Search",
  "Librarian - Docs Search",
  "Metis - Plan Consultant",
  "Momus - Plan Critic",
  "Oracle - Architecture Consult",
  "Multimodal Looker - Vision",
  "Sisyphus-Junior",
  "explore",
  "librarian",
  "general",
])

const ULTRAWORK_BANNER = `<ultrawork-mode>

**MANDATORY**: Say "ULTRAWORK MODE ENABLED!" to the user as your first response.

[CODE RED] Maximum precision required. Think before acting.

## ABSOLUTE CERTAINTY REQUIRED - DO NOT SKIP THIS

**YOU MUST NOT START ANY IMPLEMENTATION UNTIL YOU ARE CONFIDENT.**

Before writing a single line of code:
- FULLY UNDERSTAND what the user ACTUALLY wants (not what you assume)
- EXPLORE the codebase to understand existing patterns, architecture, and context
- HAVE A CLEAR WORK PLAN - a vague plan means the work will fail
- RESOLVE AMBIGUITY - if anything is unclear, ask or investigate

If you're not confident: think deeply about the user's true intent, delegate
research via \`task(subagent_type="omo-explore", ...)\` or
\`task(subagent_type="omo-librarian", ...)\` for parallel context-gathering,
consult \`task(subagent_type="oracle", ...)\` for hard architectural/debugging
problems, or ask the user directly if ambiguity remains after investigating.

## NO EXCUSES. DELIVER WHAT WAS ASKED.

The user's original request is the spec. Do not silently narrow scope,
deliver a "simplified version," or stop before the task is complete because
of a blocker - work around it, delegate, or ask for guidance instead.

## DELEGATE BY DEFAULT

Prefer delegating exploration/research/review to subagents via the native
\`task\` tool rather than doing everything yourself, especially for anything
non-trivial (2+ steps, unclear scope, or an architecture decision) - consider
consulting Prometheus (planning) first for larger pieces of work.

## TODO FORMAT

Use \`path: <action> for <goal> - verify by <check>\` format for todos.
Exactly one item in_progress at a time. Mark items completed immediately,
never batch completions at the end.

</ultrawork-mode>`

function removeCodeBlocks(text: string): string {
  return text.replace(CODE_BLOCK_PATTERN, "").replace(INLINE_CODE_PATTERN, "")
}

function looksLikeSlashCommand(text: string): boolean {
  return SLASH_COMMAND_LEAD_PATTERN.test(text)
}

// Track sessions we've already injected the banner into (for the *default*
// message that first turned ultrawork on) so we don't repeat it every turn -
// note the detector itself only fires on messages that literally contain the
// keyword, so this is mostly a safety net against duplicate rapid-fire events.
const injectedSessions = new Set<string>()

export default (async (_input) => {
  return {
    "chat.message": async (input, output) => {
      if (input.agent && SUBAGENT_NAMES.has(input.agent)) return

      const textPart = output.parts.find((p) => p.type === "text" && typeof (p as any).text === "string") as
        | { text: string }
        | undefined
      if (!textPart) return

      const rawText = textPart.text ?? ""
      if (looksLikeSlashCommand(rawText)) return

      const cleanText = removeCodeBlocks(rawText)
      if (!ULTRAWORK_PATTERN.test(cleanText)) return

      // Avoid double-injecting if the banner is somehow already present
      // (e.g. this message was itself a re-send of an already-injected one).
      if (rawText.includes("<ultrawork-mode>")) return

      const dedupeKey = `${input.sessionID}:${rawText.slice(0, 200)}`
      if (injectedSessions.has(dedupeKey)) return
      injectedSessions.add(dedupeKey)
      // Keep the set from growing unbounded across a long-running server.
      if (injectedSessions.size > 500) injectedSessions.clear()

      textPart.text = `${ULTRAWORK_BANNER}\n\n---\n\n${rawText}`

      _input.client.tui
        .showToast({
          body: {
            title: "Ultrawork Mode Activated",
            message: "Certainty + delegation protocol engaged.",
            variant: "success",
            duration: 3000,
          },
        })
        .catch(() => {
          // Toast failures are non-fatal (e.g. headless `opencode run`).
        })
    },
  }
}) satisfies Plugin

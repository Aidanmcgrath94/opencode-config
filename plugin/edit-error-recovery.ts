import type { Plugin } from "@opencode-ai/plugin"

// Ported from oh-my-openagent's edit-error-recovery hook.
// When an Edit tool call fails with a known "I guessed the file content wrong"
// error, append a reminder telling the agent to stop and re-read the file
// before trying again, instead of guessing again blindly.

const EDIT_ERROR_PATTERNS = [
  "oldstring and newstring must be different",
  "oldstring not found",
  "oldstring found multiple times",
]

const EDIT_ERROR_REMINDER = `
[EDIT ERROR - IMMEDIATE ACTION REQUIRED]

You made an Edit mistake. STOP and do this NOW:

1. READ the file immediately to see its ACTUAL current state
2. VERIFY what the content really looks like (your assumption was wrong)
3. APOLOGIZE briefly to the user for the error
4. CONTINUE with corrected action based on the real file content

DO NOT attempt another edit until you've read and verified the file state.
`

export default (async (_input) => {
  return {
    "tool.execute.after": async (input, output) => {
      if (input.tool.toLowerCase() !== "edit") return
      if (typeof output.output !== "string") return
      const outputLower = output.output.toLowerCase()
      const hasEditError = EDIT_ERROR_PATTERNS.some((pattern) => outputLower.includes(pattern))
      if (hasEditError) {
        output.output += `\n${EDIT_ERROR_REMINDER}`
      }
    },
  }
}) satisfies Plugin

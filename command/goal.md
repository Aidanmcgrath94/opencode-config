---
description: Set, check, pause, resume, or clear this session's persistent thread goal.
argument-hint: "[objective | pause | resume | clear | status]"
---
The user ran `/goal $ARGUMENTS`.

Parse `$ARGUMENTS` and call the `goal` tool accordingly:

- If it's exactly `pause`, `resume`, `clear`, or `status` (case-insensitive, ignoring surrounding whitespace), call `goal` with `action` set to that word.
- Otherwise, treat the entire argument text as the objective and call `goal` with `action="set"` and `objective="$ARGUMENTS"`.
- If `$ARGUMENTS` is empty, call `goal` with `action="status"` and report the result - don't ask the user to repeat themselves.

After calling the tool, briefly confirm the result to the user in one line. Do not do anything else unless the user asks a follow-up question.

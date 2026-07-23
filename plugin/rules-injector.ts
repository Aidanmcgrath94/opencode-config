import type { Plugin } from "@opencode-ai/plugin"
import { existsSync, readFileSync } from "fs"
import { dirname, join, relative, sep } from "path"

// Simplified version of oh-my-openagent's rules-injector hook.
//
// OpenCode natively loads a single root-level AGENTS.md for a project. This
// hook adds the thing native support doesn't do: when you Read a file deep
// in a subdirectory, walk UP from that file to the project root and inject
// the content of any *nested* AGENTS.md files found along the way (e.g.
// packages/api/AGENTS.md, packages/api/src/AGENTS.md) - the kind of
// per-directory convention docs you'd want surfaced automatically.
//
// Dropped from the original for simplicity: content-hash/mtime caching,
// distance-based tie-breaking across many candidate files, frontmatter-based
// glob matching, and cross-session persistence - this just dedupes by exact
// file path within the current process's lifetime, which is good enough for
// personal use.

const RULE_FILENAMES = ["AGENTS.md", "CLAUDE.md"]
const MAX_RULE_BYTES = 32 * 1024

// sessionID -> set of rule file paths already injected in this session.
const injectedPerSession = new Map<string, Set<string>>()

function findAncestorRuleFiles(startDir: string, projectRoot: string): string[] {
  const found: string[] = []
  let dir = startDir
  // Walk from the file's directory up to (and including) the project root.
  // Skip the root itself - OpenCode already injects the root AGENTS.md
  // natively, no need to duplicate it here.
  while (true) {
    if (dir !== projectRoot) {
      for (const name of RULE_FILENAMES) {
        const candidate = join(dir, name)
        if (existsSync(candidate)) {
          found.push(candidate)
          break // only one rule file per directory, prefer AGENTS.md order
        }
      }
    }
    if (dir === projectRoot || dir === dirname(dir)) break
    dir = dirname(dir)
  }
  // found is currently root-ward to leaf-ward in reverse (closest dir first
  // since we started at startDir and walked up) - reverse so root-most
  // nested rule comes first, closest-to-file rule comes last (most specific
  // wins visually by appearing last, closest to where the model is reading).
  return found.reverse()
}

export default (async ({ directory }) => {
  return {
    "tool.execute.after": async (input, output) => {
      if (input.tool.toLowerCase() !== "read") return
      const filePath = (output.metadata as any)?.filePath ?? (output as any)?.args?.filePath
      if (typeof filePath !== "string" || !filePath) return

      let already = injectedPerSession.get(input.sessionID)
      if (!already) {
        already = new Set()
        injectedPerSession.set(input.sessionID, already)
      }

      const ruleFiles = findAncestorRuleFiles(dirname(filePath), directory).filter((f) => !already!.has(f))
      if (ruleFiles.length === 0) return

      for (const ruleFile of ruleFiles) {
        let content: string
        try {
          content = readFileSync(ruleFile, "utf-8")
        } catch {
          continue
        }
        if (Buffer.byteLength(content, "utf8") > MAX_RULE_BYTES) {
          content = content.slice(0, MAX_RULE_BYTES) + "\n\n[...truncated, read the file directly for the rest]"
        }
        const relPath = relative(directory, ruleFile).split(sep).join("/")
        output.output += `\n\n[Nested rule file: ${relPath}]\n${content}`
        already.add(ruleFile)
      }
    },
    event: async ({ event }) => {
      if (event.type === "session.deleted") {
        const props = event.properties as { sessionID?: string; id?: string } | undefined
        const sessionID = props?.sessionID ?? props?.id
        if (sessionID) injectedPerSession.delete(sessionID)
      }
    },
  }
}) satisfies Plugin

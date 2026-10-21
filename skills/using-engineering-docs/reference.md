# Engineering-Docs Orchestrator — Reference Material

Detailed reference material for the `using-engineering-docs` orchestrator. The operational core lives in `SKILL.md`; the sections here are deeper guidance to read on demand — the rationalization trap table before you cut corners, the subagent recipes for long pipelines, the error-handling playbook when something goes wrong, and the context-window thresholds for large document sets.

---

## Anti-Rationalization

These thoughts mean STOP — you're rationalizing a shortcut:

| Thought | Reality |
|:---|:---|
| "This project is simple enough to skip idea intake" | Simple projects have the most unexamined assumptions. The intake takes 5 minutes. |
| "I can batch all the clarifying questions at once" | One question at a time produces better answers. Batching overwhelms the user. |
| "I'll generate all conditional documents just to be thorough" | Right-sizing is the point. Generating unnecessary docs wastes time and dilutes quality. |
| "I'll do the consistency check at the end" | Incremental checks catch errors when they're cheap to fix. End-of-run checks find compounding problems. |
| "The user probably knows what they want, I'll skip the interview" | The interview IS the value. Without it, you're guessing. |
| "This document looks good enough, I'll move on" | Quality gates exist for a reason. "Good enough" without verification is not good enough. |
| "I remember the skill, I don't need to read it" | Skills evolve. Always read the current SKILL.md before invoking. |
| "I'll just generate the template without the interview" | The interview produces the content. The template is just the structure. |
| "I'll ask inline in the conversation" | Use tool calls for interviews. Inline questions pollute conversation context and force users to type responses. |

---

## Subagent Delegation

For projects requiring 10+ documents, consider delegating document generation to subagents to preserve the orchestrator's context for coordination.

### When to Use Subagents

- **Independent documents:** After the architecture is complete, database design and API design can often be generated in parallel since they depend on the same source (the architecture) but not on each other.
- **Long sessions:** If the context window is getting large, delegate the next document generation to a subagent that starts fresh.
- **Complex documents:** Documents like system-architecture-document (8 phases, 4-8 hours) benefit from a dedicated subagent with focused context.

### How to Delegate

1. **Prepare the context:** Write the necessary prior documents to files (they should already be in `.engineering-docs/`).
2. **Craft the subagent prompt:** Include:
   - The skill path to invoke
   - The business concept and standing constraints (from `1-business-plan.md`)
   - Any prior documents this document depends on (reference by filename)
   - The output file path
3. **Collect the result:** The subagent writes the document to the specified file. The orchestrator reads it and updates the index.

### Parallel Generation

Documents that can be generated in parallel (once architecture is complete):
- `database-design-document` and `api-design-document` (both depend on architecture, not on each other)
- `admin-access-control-specification` and `security-threat-model` (both depend on architecture and API design)
- Multiple `technical-blueprint` documents for independent features

Documents that MUST be sequential:
- `business-concept` → `project-plan` → `user-personas-behavior` → `technical-specification` → `system-architecture-document` (each depends on the previous)
- `implementation-plan` → `test-strategy-document` → `deployment-plan` (each depends on the previous)

---

## Error Handling

### Template Missing
If a skill's template file is not found:
1. Check the skill's directory for the template — it may have been renamed or moved
2. If truly missing, use the skill's SKILL.md as the structural guide and generate the document from its Key Concepts and Phase descriptions
3. Log the missing template in `index.md` so it can be addressed
4. Continue the pipeline — do not block on a missing template

### Document Generation Fails
If a document generation step fails mid-way:
1. Save any partial output to the target file with `status: draft` and a note in `index.md`
2. Report the failure to the user with the specific error or blocker
3. Offer to retry, skip the document, or generate it in a fresh session
4. If skipped, mark it as `status: skipped` in `index.md` with the reason — it can be revisited later

### User Wants to Skip a Document
If the user wants to skip a conditional document:
1. Confirm the skip and explain what downstream documents may be affected
2. Mark it as `status: skipped` in `index.md` with the user's stated reason
3. Continue with the next document in the sequence
4. Note in any downstream document that depends on the skipped one that assumptions were made without it

### User Wants to Revisit an Earlier Document
If the user wants to go back and revise a document already marked `final`:
1. Create a new version (do not overwrite) per the versioning rules
2. Run the consistency check against all downstream documents
3. Flag any downstream documents that may need updates due to the change

---

## Context Window Thresholds

For large projects (10+ documents), manage context window proactively:

- **After 5-7 documents:** Suggest starting a fresh session. The orchestrator's context accumulates with each interview and generation cycle, and quality degrades when context is too large.
- **Signal to watch for:** If the agent starts re-asking questions already answered, or loses track of entity names established in earlier documents, context is too full — start a fresh session immediately.
- **How to resume:** The `index.md` file is the anchor. A fresh session reads `index.md` first, loads the most recent 2-3 documents for context, and resumes exactly where the previous session left off.
- **Between complex documents:** For documents with 6+ phases (e.g., system-architecture-document, disaster-recovery-plan), consider generating them in a dedicated subagent session to keep the orchestrator's context focused on coordination.

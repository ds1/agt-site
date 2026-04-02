<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Work Tracking — GitHub Issues as Source of Truth

**All TODOs, features, enhancements, bugs, and roadmap items live in GitHub Issues.** Do not maintain parallel lists in STATUS.md, backlog files, or planning docs. GitHub Issues is the single source of truth for what needs to be done.

## Default behaviors

- **When discussing new work:** Create a GitHub issue with `gh issue create`. Apply appropriate labels (`phase-1`–`phase-4`, `launch-blocker`, `launch-important`, `enhancement`, `bug`, `compliance`, etc.).
- **When completing work:** Close the relevant issue with `gh issue close <number>` and reference it in the commit message (e.g., `feat: add refund policy page (closes #83)`).
- **When checking status:** Run `gh issue list` with label/milestone filters rather than reading a local status file. Use `gh issue view <number>` for details.
- **When prioritizing or triaging:** Use labels and milestones in GitHub Issues, not local markdown files.
- **When the user says "add a TODO" or "we should...":** Default to creating a GitHub issue, not appending to a file.

## STATUS.md

STATUS.md should be a lightweight summary pointing to GitHub Issues — not a duplicate of the issue tracker. Keep it to: current high-level state, active blockers, and links/queries into Issues. Do not enumerate individual issues in STATUS.md.

## Useful queries

```bash
# All open launch blockers
gh issue list --label launch-blocker --state open

# Open issues by phase
gh issue list --label phase-1 --state open

# Compliance items
gh issue list --label compliance --state open

# Everything assigned or in progress
gh issue list --state open --assignee @me
```

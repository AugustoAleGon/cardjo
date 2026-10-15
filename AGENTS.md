# Project instructions

Read `.agents/skills/asd-ste100/SKILL.md` before you change this project.
Apply that skill to documentation, comments, instructions, and game text.
Use consistent game terms.
Keep all game text in `src/messages.json`.

Keep game rules in pure TypeScript functions.
Keep game state in a Zustand store.
Create separate store instances for tests.
Use Tailwind utilities for the interface.
Use the stylesheet for board geometry, tile depth, and motion preferences.

Run these checks before a release:

1. Run `pnpm lint`.
2. Run `pnpm lint:prose`.
3. Run `pnpm test`.
4. Run `pnpm build`.
5. Run `pnpm test:browser`.

Review advisory prose findings manually.
Do not claim official dictionary compliance.
Keep the copied skill unchanged.

Use atomic commits with Conventional Commit messages.
Keep each commit focused on one change.

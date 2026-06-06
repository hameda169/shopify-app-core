# Workflow rules (all repos in this folder)

## Git workflow — branches, not worktrees
- Do NOT create git worktrees for tasks.
- For any task that changes code: create a branch from `main` (name it after the task, e.g. `core-0.1.1` or `fix-webhook-auth`), switch the main checkout to that branch, and work there.
- Commit on that branch as you go. Plain `git commit` — author identity comes from `.git/config`, never pass `-c user.name/email` or `--author`.
- When the task is done: leave the branch checked out and unmerged, and tell me it is ready. I review the branch myself and decide when to merge. Only merge to `main` if I explicitly approve.

## Package management
- Use **yarn** (v1), never npm, in the app repos. No `package-lock.json`.
- `@hameda169/*` packages come from GitHub Packages. Auth lives in each part's **gitignored** `.npmrc` (created from the committed `.npmrc.example`). Never commit a real token; never rely on `~/.npmrc`.

## Core packages (shopify-app-core)
- Shared code lives in `@hameda169/shopify-core-{backend,frontend,sdk,shared}`.
- Migrations always live in the app, never in core. Framework deps are peerDependencies in core.
- Publishing: bump version, `yarn build` / `npm run build`, `npm publish -w <pkg>` (publishConfig points at npm.pkg.github.com).

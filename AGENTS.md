# Agent Instructions

These instructions are for coding agents and contributors working in this repository.

## Project Shape

- Use pnpm from the repository root.
- The main runnable app is `artifacts/cosmos-forge`.
- The API server scaffold is `artifacts/api-server`.
- Shared/generated packages live under `lib/`.

## Local Commands

```sh
pnpm install --config.confirm-modules-purge=false
pnpm run dev
pnpm run test
pnpm run typecheck
pnpm run build:app
```

Use `pnpm run build` only when you need the full workspace build.

## Development Notes

- Keep Replit compatibility where practical, but local development on macOS ARM needs the Darwin ARM native packages that are allowed in `pnpm-workspace.yaml`.
- Do not re-add overrides that exclude:
  - `@esbuild/darwin-arm64`
  - `@rollup/rollup-darwin-arm64`
  - `@tailwindcss/oxide-darwin-arm64`
  - `lightningcss-darwin-arm64`
- The root package blocks npm and yarn installs. Use pnpm.
- The frontend defaults to `PORT=5173` and `BASE_PATH=/`.
- The API server requires `PORT` and `DATABASE_URL`.
- For meaningful progress checkpoints on a feature branch, use `pnpm run progress:push -- "short message"` after confirming the worktree scope.
- PRs labeled `automerge` may be merged by GitHub Actions after CI passes. Do not apply this label to risky, draft, or externally sourced PRs.

## Verification

Before handing off code changes, run:

```sh
pnpm run test
pnpm run typecheck
pnpm run build:app
```

If backend or workspace package changes were made, also run:

```sh
pnpm run build
```

## Git Hygiene

- Do not commit generated dependency folders or local env files.
- Leave unrelated user changes alone.
- Keep docs updated when changing commands, ports, or workspace layout.

# Cosmos Forge

Cosmos Forge is a React/Vite civilization simulation game exported from Replit and adjusted to run locally from this pnpm workspace.

## Quick Start

Prerequisites:

- Node.js 24
- pnpm 11

```sh
pnpm install --config.confirm-modules-purge=false
pnpm run dev
```

Open http://localhost:5173/ in your browser.

The frontend defaults to:

- `PORT=5173`
- `BASE_PATH=/`

You can override those values when needed:

```sh
PORT=3000 BASE_PATH=/ pnpm run dev
```

## Useful Commands

```sh
pnpm run dev        # run the Cosmos Forge Vite app
pnpm run test       # run unit tests
pnpm run build:app  # build only the Cosmos Forge frontend
pnpm run serve      # preview the built frontend
pnpm run typecheck  # typecheck the whole workspace
pnpm run build      # typecheck and build every package
```

The API server is optional for normal local play, but it is required for daily universe emails. Run it in a second terminal:

```sh
PORT=5000 pnpm run dev:api
```

Daily email subscriptions use `POST /api/universe-emails/subscribe`. Set `RESEND_API_KEY` and `UNIVERSE_EMAIL_FROM` to send real emails with the subject `Your Universe Awaits!`. Without `RESEND_API_KEY`, local email messages are written to `artifacts/api-server/.data/universe-email-outbox.jsonl` so you can inspect them without sending anything.

## Project Map

- `artifacts/cosmos-forge` - main React/Vite game app
- `artifacts/api-server` - Express API scaffold
- `artifacts/mockup-sandbox` - Replit mockup sandbox artifact
- `lib/api-client-react` - generated React API client package
- `lib/api-spec` - OpenAPI spec and codegen config
- `lib/api-zod` - generated Zod schemas
- `lib/db` - Drizzle/Postgres package
- `scripts` - workspace scripts package

## Docs

- [Local development](docs/LOCAL_DEVELOPMENT.md)
- [Architecture diagram](docs/ARCHITECTURE.md)
- [Agent and contributor instructions](AGENTS.md)

## Progress Pushes and Auto-Merge

Use this helper from a feature branch when you want to save good progress:

```sh
pnpm run progress:push -- "describe the progress"
```

Agents can also use the automatic-message form:

```sh
pnpm run progress:auto
```

Both forms run typecheck and the app build, commit local changes, and push the current branch. They refuse to run on `main` or `master`.

Pull requests with the `automerge` label are merged by GitHub Actions after CI passes, as long as they are not drafts and come from the same repository.

## Notes From the Replit Export

The original workspace pruned non-Linux native packages for Replit. Local macOS ARM development needs the Darwin ARM builds for esbuild, Rollup, Lightning CSS, and Tailwind oxide, so those exclusions are intentionally removed from `pnpm-workspace.yaml`.

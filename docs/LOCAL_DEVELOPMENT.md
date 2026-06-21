# Local Development

This project is a pnpm workspace. Run commands from the repository root unless a command says otherwise.

## Setup

```sh
pnpm install --config.confirm-modules-purge=false
```

Why the extra flag? Replit downloads can include a `node_modules` tree created on another machine. pnpm may need to recreate it locally, and the flag lets that happen in non-interactive shells.

## Run the Game

```sh
pnpm run dev
```

Then open:

```text
http://localhost:5173/
```

The root `dev` script runs `@workspace/cosmos-forge`, which is the main game app.

## Environment Variables

Frontend defaults:

```sh
PORT=5173
BASE_PATH=/
```

API server variables:

```sh
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/cosmos_forge
LOG_LEVEL=info
```

Copy `.env.example` if you want a local reference file:

```sh
cp .env.example .env.local
```

The frontend does not currently require the API server to play the game locally.

## Validate Changes

```sh
pnpm run typecheck
pnpm run test
pnpm run build:app
```

Use `pnpm run build` when you want to build every workspace package.

## Save Good Progress

From a feature branch:

```sh
pnpm run progress:push -- "short commit message"
```

The helper runs `typecheck` and `build:app`, commits local changes, and pushes the current branch. It refuses to commit directly on `main` or `master`.

Agents may use the automatic-message form at good checkpoints:

```sh
pnpm run progress:auto
```

## Common Issues

### `Use pnpm instead`

Install or run scripts with pnpm. npm and yarn are blocked by the root `preinstall` guard.

### `PORT environment variable is required`

This should no longer happen for the main `cosmos-forge` app because it defaults to `5173`. The `mockup-sandbox` and API server still expect explicit Replit-style environment variables.

### Native package or esbuild errors

Run:

```sh
pnpm install --config.confirm-modules-purge=false
```

The workspace allows the `esbuild` postinstall and keeps the macOS ARM native packages needed for local development on Apple Silicon.

### API server fails on `DATABASE_URL`

The API server imports the database package and requires `DATABASE_URL`. The game frontend does not need this server for the current local workflow.

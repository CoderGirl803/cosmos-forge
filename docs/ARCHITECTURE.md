# Architecture

## Workspace Diagram

```mermaid
flowchart TD
  Browser[Browser] --> Vite[Vite dev server<br/>@workspace/cosmos-forge]
  Vite --> React[React app<br/>artifacts/cosmos-forge/src]
  React --> Store[Zustand game store<br/>hooks/useGameStore.ts]
  React --> UI[UI components<br/>components/]
  React --> Data[Static game data<br/>data/gameData.ts]

  ApiClient[lib/api-client-react] -. available package .-> React
  ApiSpec[lib/api-spec<br/>OpenAPI] --> ApiClient
  ApiSpec --> ApiZod[lib/api-zod]

  ApiServer[Express API scaffold<br/>@workspace/api-server] --> ApiZod
  ApiServer --> DB[lib/db<br/>Drizzle + Postgres]
  DB --> Postgres[(Postgres)]
```

## Local Runtime Flow

```mermaid
sequenceDiagram
  participant Dev as Developer
  participant PNPM as pnpm
  participant Vite as Vite
  participant App as Cosmos Forge React App
  participant Browser as Browser

  Dev->>PNPM: pnpm run dev
  PNPM->>Vite: run @workspace/cosmos-forge dev script
  Vite->>App: compile TS/React/Tailwind
  Browser->>Vite: http://localhost:5173/
  Vite-->>Browser: index.html and bundled modules
  Browser->>App: render game UI
```

## Main App Pieces

- `src/main.tsx` mounts the React application.
- `src/App.tsx` wires React Query, tooltips, toast UI, and routing.
- `src/pages/Game.tsx` is the main game screen.
- `src/hooks/useGameStore.ts` owns game state and simulation actions.
- `src/data/gameData.ts` contains static game configuration.
- `src/components/` contains the visual panels, alerts, intro, death screen, particles, and shared UI primitives.

## API Scaffold

The API server and database packages are included in the workspace for future backend work. They are not required for the current local game loop.

To run the API server, provide:

```sh
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/cosmos_forge
```

# ELTYCA

A card game (hot-seat and real online multiplayer) built as an npm-workspaces monorepo. Full design rules: [regras_v0.9.md](regras_v0.9.md) (Portuguese, authoritative game rules). Full technical architecture: [ARCHITECTURE.md](ARCHITECTURE.md) — read that before making non-trivial changes; this file is a fast-loading index, not a substitute.

## Packages

| Package | What it is | Depends on |
|---|---|---|
| `packages/engine` (`@eltyca/engine`) | Pure TypeScript rules engine. Zero UI, zero network, zero DOM. Every rule (placement, capture, scoring, draft, redaction) is a pure function over `GameState`. | nothing |
| `packages/server` (`@eltyca/server`) | Online multiplayer backend: a `partyserver`-based Durable Object (`EltycaRoom`), deployed as a Cloudflare Worker via `wrangler`. One room per shared code. | `@eltyca/engine` |
| `packages/web` (`@eltyca/web`) | Vite + React UI. Hot-seat (`/game`) and online (`/online`, `/online/:code`) both render the same `LiveMatch` component. | `@eltyca/engine`, `@eltyca/server` (type-only, wire protocol) |

## Non-negotiable invariants

- **The engine never imports React, DOM, or network code.** Rule logic lives in `packages/engine/src/rules/*.ts` as pure `(state, ...) => newState` functions. If you're tempted to mutate `GameState` from `packages/web` or `packages/server` directly instead of calling an engine function, stop — add the function to the engine instead. Both the local hot-seat reducer and the server's `applyAction.ts` are thin callers of the same engine functions; they must never duplicate rule logic.
- **Real server-side redaction, not UI-hiding.** `packages/engine/src/rules/redact.ts`'s `redactGameStateForPlayer` is the *only* place opponent data gets stripped, and it happens only at the network-broadcast boundary in `packages/server/src/server.ts`. Anything added to `GameState`/`Player`/`Cell` needs an explicit decision: does this leak strategy info to an opponent who shouldn't see it yet? If yes, redact it; if no, say why in a comment. Verify with a raw WebSocket frame inspection (see the `run-and-verify` skill and `multiplayer-safety-check` skill), not by checking what the UI renders — hot-seat already "hides" things by rendering discipline alone, which is not the bar here.
- **Content (cards/ships/captains) is data, not code.** `packages/engine/src/content/{cards,ships,captains}.json` are hand-edited JSON files — arrows/shields are authored as direction *indices* (`[0, 2]`), not the length-8 boolean arrays the engine actually uses; `sampleCards.ts`/`sampleShips.ts` do that conversion. Adding a card/ship/captain is a JSON edit, never a `.ts` change. Every entry needs a real `imageUrl` pointing at a file under `packages/web/public/{creatures,ships,captains}/`.
- **2 players only.** `PlayerId = 'P1' | 'P2'` is hardcoded throughout the engine. Scaling to 3+ players is a real refactor, not a parameter.

## Commands

```
npm run dev:web              # Vite dev server, packages/web, :5173
npm run dev:server           # wrangler dev, packages/server, :1999 (matches web's default VITE_PARTYKIT_HOST)
npm test                     # engine + server test suites (vitest)
npm run simulate             # one headless bot match via CLI
npm run batch -- N           # N simulated matches per bot pairing, CSV report
npm run deploy:server        # wrangler deploy (packages/server) — needs CLOUDFLARE_ACCOUNT_ID/API_TOKEN env vars for a first-time or own-account deploy
npm run deploy:web           # wrangler deploy (packages/web) — static assets Worker
```

Typecheck per package (no root tsconfig): `cd packages/<name> && npx tsc -b --noEmit`.

## Conventions

- **Phased commits.** Never one giant commit for a whole feature. Each commit is a coherent, independently-revertable unit — one rule change + its tests, one UI component group, one bugfix found while verifying. See git log for the pattern already established.
- **Verify in the browser, not just tests.** Type checks and unit tests confirm correctness of logic, not that a feature actually works end-to-end. For UI/multiplayer changes, drive the real app (dev servers + Playwright) before calling something done — see the `run-and-verify` skill.
- **Two real browser contexts for online testing**, not two tabs — `browser.newContext()` twice, never `newPage()` on the same context, because online play depends on per-browser `localStorage` (`clientId`) being genuinely isolated.

## Known environment gotchas

- Repeated `wrangler dev`/Vite restarts across a long session can leave orphaned `workerd`/`vite` processes bound to stale ports, which then silently makes a fresh dev server bind to a fallback port instead of the expected one (breaking the client's hardcoded default). If a dev server seems to hang or a page shows nothing, check `lsof -ti :1999` / `lsof -ti :5173` for more than one PID, `pkill -9 -f "wrangler dev"` / `pkill -9 -f vite` / `pkill -9 -f workerd`, then restart clean.
- `packages/server`'s local dev port is pinned to `1999` (`wrangler dev --port 1999` in its `dev` script) specifically so it matches `packages/web`'s `VITE_PARTYKIT_HOST` default — don't change one without the other.

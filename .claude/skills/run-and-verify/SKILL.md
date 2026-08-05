---
name: run-and-verify
description: Start ELTYCA's dev servers and drive the actual app (hot-seat and/or online multiplayer) to confirm a change works end-to-end, not just that it typechecks or passes unit tests. Use before calling any UI or multiplayer change done.
---

Typecheck and `npm test` confirm the engine's logic is correct. They do not confirm a UI change renders, or that an online change actually works over the network — both need the real app driven with Playwright. See [ARCHITECTURE.md](../../../ARCHITECTURE.md) for what the two dev servers are.

## Start the dev servers

```bash
# From repo root, in the background:
npm run dev:web      # Vite, :5173
npm run dev:server   # wrangler dev, :1999 — only needed for online multiplayer testing
```

**Before starting, check for stale processes** — this repo's dev servers have a history of orphaned processes from repeated restarts silently rebinding to a fallback port:

```bash
lsof -ti :5173 | while read pid; do ps -p $pid -o pid,command; done
lsof -ti :1999 | while read pid; do ps -p $pid -o pid,command; done
```

If more than one PID shows up, or a page loads blank/hangs: `pkill -9 -f "wrangler dev"; pkill -9 -f vite; pkill -9 -f workerd`, then restart clean and re-check `lsof` shows exactly one PID per port.

## Hot-seat verification (`/game`)

Single `browser.newPage()` is fine — it's one screen by design. Drive: choice screen (2 clicks × 2 players) → Porto draft (repeatedly click the first `.card-mini-button` until `.draft-screen` disappears) → setup (`.ship-pickup` or `.setup-panel .cargo-chip`, then a `.board-cell.selectable`, then "Bury it here, face-down") → main phase. Watch for `button:has-text("ready")` (the "Pass the device to Px" handoff screen) appearing between phases — it will silently stall a script that doesn't handle it.

## Online verification (`/online`)

**Use two separate `browser.newContext()`, never two tabs on one context.** Online play depends on `localStorage`'s `clientId` being genuinely per-browser; two tabs would share one context's storage and both connect as the same player.

```js
const contextA = await browser.newContext();
const contextB = await browser.newContext();
const pageA = await contextA.newPage();
const pageB = await contextB.newPage();
```

Flow: `pageA` creates a room (`/online` → "Create room"), copy the resulting URL, `pageB` navigates to it directly. Wait for "Your friend is here." on A before clicking "Start". From there the choice/draft/setup/main flow is the same as hot-seat, except both pages act independently — check `.start-tagline`/the header's "waiting for..." text to know whose turn it actually is before clicking on either page.

## The security-critical check: raw WebSocket frames, not the rendered DOM

Hot-seat "hides" the opponent's hand purely by not rendering it — that proves nothing about online play, where the server is supposed to never *send* it in the first place. Verify redaction by inspecting the actual frames a client's browser receives, attached **before** the page ever connects (attaching after means missing whatever frame already arrived):

```js
const framesReceivedByB = [];
pageB.on('websocket', (ws) => {
  ws.on('framereceived', (frame) => {
    try { framesReceivedByB.push(JSON.parse(frame.payload)); } catch {}
  });
});
// ... now navigate pageB and play ...

// Check every game-update/welcome frame: B is P2, so P1's data must never appear un-redacted.
for (const frame of framesReceivedByB) {
  if (frame.type !== 'game-update' && frame.type !== 'welcome') continue;
  const p1 = frame.game?.players.find((p) => p.id === 'P1');
  if (p1?.hand?.some((i) => 'cardId' in i)) throw new Error('LEAK: P1 hand cardId visible to P2');
  if (Array.isArray(p1?.deck)) throw new Error('LEAK: P1 deck sent as a real array to P2');
}
```

Run this any time a change touches `GameState`, `Player`, `Cell`, or `packages/server/src/server.ts`'s broadcast logic — see the `multiplayer-safety-check` skill for the full checklist of what else to consider before that.

## Common selectors

`.choice-grid .choice-card`, `.draft-screen .card-mini-button`, `.setup-panel`, `.ship-pickup`, `.setup-panel .cargo-chip`, `.board-cell.selectable`, `.hand-strip .card-mini-button`, `.settings-gear` / `.settings-popover` (battle settings menu), `.app-end` / `.surrender-note` (end screen).

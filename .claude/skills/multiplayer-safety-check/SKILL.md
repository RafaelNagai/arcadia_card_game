---
name: multiplayer-safety-check
description: Checklist to run through whenever a change adds or touches a field on GameState/Player/Cell/HandItem, or touches packages/server's broadcast logic. Use before considering such a change finished — the online mode's whole security model depends on this being deliberate, not incidental.
---

ELTYCA's online mode has one firm, standing requirement (see [ARCHITECTURE.md](../../../ARCHITECTURE.md#sigilo--a-redação-de-estado)): the server only ever sends a client what that player is genuinely allowed to see — not "hidden by the UI," actually never transmitted. This is easy to silently break by adding a new field to shared state without thinking about who should see it.

## When to run this checklist

Any diff that touches: `packages/engine/src/types.ts` (`GameState`, `Player`, `Cell`, `HandItem`, `CellContent`), `packages/engine/src/rules/redact.ts`, or `packages/server/src/server.ts`'s `broadcastRoomState`/`onConnect` broadcast logic.

## The checklist

1. **Does the new/changed field reveal something an opponent shouldn't know yet?** If it's derived from or reveals hand contents, deck contents, or a still-hidden setup piece — it needs redacting. If it's public information (board state, log of things that already happened openly, turn number) — it's fine to pass through as-is.

2. **If it needs redaction:** add the stripped/summarized version to `RedactedGameState`/`RedactedPlayer`/`RedactedCellContent` in `redact.ts`, and update `redactGameStateForPlayer`'s non-`'end'` branch (it's a manual object literal, not a spread — TypeScript will catch a missing field, but only because the literal is exhaustive on purpose, so don't "fix" a compile error there by casting instead of actually deciding what to redact).

3. **If it's genuinely public, add it to the non-`'end'` branch's literal too** (even if the value is always trivial pre-`'end'`, e.g. `null`) — that branch does not spread `state`, so a forgotten field silently vanishes for every online client until `phase === 'end'`.

4. **Check `phase === 'end'`'s exception still makes sense.** That branch returns the entire unredacted state (`{ ...state }`) on the theory that nothing is worth hiding once the match is over. If the new field is meaningful *after* end too and shouldn't leak even then, `redactGameStateForPlayer` needs a real third case, not just the two that exist today — don't assume the `'end'` shortcut is automatically correct for a new kind of information.

5. **If a client needs to derive something from the field that only works on real (non-redacted) data** — e.g. any function that pattern-matches `content.kind` or reads `player.hand[i].cardId` — check whether that function still gives a correct answer when called against a redacted opponent's data. If not (this has happened before: `nextSetupPlayer`/`isShipPlaced` silently misread a hidden opponent piece), the server needs to compute and ship the derived value explicitly instead, the way `SetupProgressSummary` already does — never let the client re-derive turn/progress logic from data it might only have a redacted view of.

6. **Verify with a raw WebSocket frame inspection**, not the rendered DOM — see the `run-and-verify` skill's section on this. Attach the frame listener before the page connects, drive real gameplay through the phase that exercises the new field, and assert the opponent's raw JSON never contains the sensitive value.

## Reminder: don't duplicate rule logic to avoid this

If the temptation is "just compute the redacted view differently in `applyAction.ts`/`server.ts` instead of touching the engine" — don't. `redactGameStateForPlayer` is the one and only redaction boundary on purpose (see CLAUDE.md's invariants). A second, ad-hoc redaction path is exactly how a leak gets introduced later by someone editing the first one and not knowing the second exists.

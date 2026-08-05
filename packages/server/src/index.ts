/** The only thing packages/web needs from this package: the wire protocol types, imported
 *  type-only so nothing server-specific (partyserver, room storage, etc.) ever ends up in
 *  the browser bundle. server.ts itself is the actual Worker entry point (see
 *  wrangler.jsonc's "main") and is never imported from here. */
export type { ClientMessage, ServerMessage, RoomPhase, SetupProgressSummary } from './protocol';

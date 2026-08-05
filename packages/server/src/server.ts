import { Server, routePartykitRequest, type Connection, type ConnectionContext } from 'partyserver';
import type { Config, PlayerId } from '@eltyca/engine';
import { redactGameStateForPlayer, sampleContent } from '@eltyca/engine';
import { assignPlayerSlot, createNewRoom, loadExistingRoom, savePersistedRoom, RoomFullError, type PersistedRoomState } from './room';
import { applyAction } from './applyAction';
import { summarizeSetupProgress } from './setupProgress';
import type { ClientMessage, ServerMessage } from './protocol';

interface ConnectionState {
  clientId: string;
  playerId: PlayerId;
}

interface Env {
  Main: DurableObjectNamespace<EltycaRoom>;
}

function send(connection: Connection, message: ServerMessage) {
  connection.send(JSON.stringify(message));
}

/** Lobby + Porto draft + full setup/main-phase gameplay — see protocol.ts. A room is a single
 *  Durable Object instance whose name (the URL's :name segment, routed by
 *  routePartykitRequest below) *is* the shareable code; state lives in ctx.storage so a room
 *  survives the Durable Object hibernating between messages, not just one connection. */
export class EltycaRoom extends Server<Env> {
  static options = { hibernate: true };

  private state: PersistedRoomState | undefined;

  async onStart() {
    // Only rehydrates a room that already exists — never fabricates a default one here,
    // which would pre-empt the first connection's chance to supply its config (see
    // createNewRoom's doc comment).
    this.state = await loadExistingRoom(this.ctx.storage);
  }

  async onConnect(connection: Connection, ctx: ConnectionContext) {
    const url = new URL(ctx.request.url);
    const clientId = url.searchParams.get('clientId');
    if (!clientId) {
      send(connection, { type: 'error', message: 'clientId ausente' });
      connection.close();
      return;
    }

    if (!this.state) {
      const configOverrides = parseConfigOverrides(url.searchParams.get('config'));
      this.state = (await loadExistingRoom(this.ctx.storage)) ?? createNewRoom(this.name, configOverrides);
    }

    let playerId: PlayerId;
    try {
      playerId = assignPlayerSlot(this.state, clientId);
    } catch (err) {
      send(connection, { type: 'error', message: err instanceof RoomFullError ? err.message : String(err) });
      connection.close();
      return;
    }
    await savePersistedRoom(this.ctx.storage, this.state);

    connection.setState({ clientId, playerId } satisfies ConnectionState);
    send(connection, {
      type: 'welcome',
      you: playerId,
      phase: this.state.phase,
      opponentConnected: this.isOpponentConnected(connection.id, playerId),
      config: this.state.config,
      draft: this.state.draft,
      game: this.state.game ? redactGameStateForPlayer(this.state.game, playerId) : null,
      setupProgress: this.state.game?.phase === 'setup' ? summarizeSetupProgress(this.state.game) : null,
      playerSetups: this.state.game?.phase === 'end' ? this.state.playerSetups : null,
    });
    this.broadcastPresence();
  }

  async onMessage(sender: Connection, message: string) {
    const senderState = this.connectionState(sender);
    if (!senderState || !this.state) return;

    try {
      const msg = JSON.parse(message) as ClientMessage;
      this.state = applyAction(this.state, senderState.playerId, msg, sampleContent);
      await savePersistedRoom(this.ctx.storage, this.state);
      this.broadcastRoomState();
    } catch (err) {
      send(sender, { type: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  }

  onClose() {
    this.broadcastPresence();
  }

  private connectionState(connection: Connection): ConnectionState | undefined {
    return connection.state as ConnectionState | undefined;
  }

  private isOpponentConnected(selfConnectionId: string, selfPlayerId: PlayerId): boolean {
    for (const conn of this.getConnections()) {
      if (conn.id === selfConnectionId) continue;
      if (this.connectionState(conn)?.playerId !== selfPlayerId) return true;
    }
    return false;
  }

  private broadcastPresence() {
    for (const conn of this.getConnections()) {
      const state = this.connectionState(conn);
      if (!state) continue;
      send(conn, { type: 'room-update', opponentConnected: this.isOpponentConnected(conn.id, state.playerId) });
    }
  }

  private broadcastRoomState() {
    if (!this.state) return;

    // Draft state has nothing secret in it (choice picks are revealed on the spot, the Porto
    // pool is a shared face-up table — see rules/draft.ts) so every connection gets the exact
    // same broadcast.
    if (this.state.phase === 'draft' && this.state.draft) {
      this.broadcast(JSON.stringify({ type: 'draft-update', draft: this.state.draft } satisfies ServerMessage));
      return;
    }

    // Game state is the opposite — each connection needs its own redacted view, so this has
    // to be a per-connection send rather than one shared broadcast payload.
    if (this.state.phase === 'game' && this.state.game) {
      const game = this.state.game;
      const setupProgress = game.phase === 'setup' ? summarizeSetupProgress(game) : null;
      const playerSetups = game.phase === 'end' ? this.state.playerSetups : null;
      for (const conn of this.getConnections()) {
        const connState = this.connectionState(conn);
        if (!connState) continue;
        send(conn, { type: 'game-update', game: redactGameStateForPlayer(game, connState.playerId), setupProgress, playerSetups });
      }
    }
  }
}

function parseConfigOverrides(raw: string | null): Partial<Config> | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Partial<Config>;
  } catch {
    return undefined;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return (await routePartykitRequest(request, env)) ?? new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;

import type * as Party from 'partykit/server';
import type { PlayerId } from '@eltyca/engine';
import { assignPlayerSlot, loadPersistedRoom, savePersistedRoom, RoomFullError } from './room';
import type { ServerMessage } from './protocol';

interface ConnectionState {
  clientId: string;
  playerId: PlayerId;
}

function send(connection: Party.Connection, message: ServerMessage) {
  connection.send(JSON.stringify(message));
}

/** Lobby phase only — see protocol.ts. A room is a single PartyKit "party" whose room id
 *  *is* the shareable code; state lives in room.storage so a room survives the server
 *  hibernating between messages, not just for the lifetime of one connection. */
export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    const clientId = new URL(ctx.request.url).searchParams.get('clientId');
    if (!clientId) {
      send(connection, { type: 'error', message: 'Missing clientId' });
      connection.close();
      return;
    }

    const state = await loadPersistedRoom(this.room);
    let playerId: PlayerId;
    try {
      playerId = assignPlayerSlot(state, clientId);
    } catch (err) {
      send(connection, { type: 'error', message: err instanceof RoomFullError ? err.message : String(err) });
      connection.close();
      return;
    }
    await savePersistedRoom(this.room, state);

    connection.setState({ clientId, playerId } satisfies ConnectionState);
    send(connection, { type: 'welcome', you: playerId, opponentConnected: this.isOpponentConnected(connection.id, playerId) });
    this.broadcastPresence();
  }

  onClose() {
    this.broadcastPresence();
  }

  private connectionState(connection: Party.Connection): ConnectionState | undefined {
    return connection.state as ConnectionState | undefined;
  }

  private isOpponentConnected(selfConnectionId: string, selfPlayerId: PlayerId): boolean {
    for (const conn of this.room.getConnections()) {
      if (conn.id === selfConnectionId) continue;
      if (this.connectionState(conn)?.playerId !== selfPlayerId) return true;
    }
    return false;
  }

  private broadcastPresence() {
    for (const conn of this.room.getConnections()) {
      const state = this.connectionState(conn);
      if (!state) continue;
      send(conn, { type: 'room-update', opponentConnected: this.isOpponentConnected(conn.id, state.playerId) });
    }
  }
}

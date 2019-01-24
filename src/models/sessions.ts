import { Session } from './session';
import { PeerConnectionClient } from '../rtc/peer-connection-client';

export namespace Sessions {
  export interface SessionHash {
    [details: string] : Session;
  }

  const sessions:SessionHash = {};

  export function add(session: Session) {
    sessions[session.id] = session;
  }

  export function get(id: string) {
    return sessions[id];
  }

  export function countOfSessions() {
    return Object.keys(sessions).length;
  }

  export function getPeerConnection(id: string):Promise<PeerConnectionClient> {
    return sessions[id] ? Promise.resolve(sessions[id].peerConnectionClient) : Promise.reject(`session ${id} not found`);
  }

  export function destroy(id: string) {
    if (sessions[id]) {
      sessions[id].destroy();
      delete sessions[id];
    }
  }

  export function clearAll() {
    Object.keys(sessions).forEach((id) => {
      sessions[id].destroy();
      delete sessions[id];
    });
  }
}

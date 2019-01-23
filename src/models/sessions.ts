import { Session } from './session';

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

  export function destroy(id: string) {
    if (sessions[id]) {
      sessions[id].destroy();
      delete sessions[id];
    }
  }
}

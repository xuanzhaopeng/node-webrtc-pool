import { DELETE, Path, POST, QueryParam } from 'typescript-rest';
import { Session } from '../models/session';
import { Sessions } from '../models/sessions';

@Path('/sessions')
export class SessionsService {

  @POST
  createSession(rtcConfiguration: RTCConfiguration):Session {
    const session = new Session(rtcConfiguration);
    Sessions.add(session);
    return session;
  }

  @DELETE
  deleteSession(@QueryParam('id') id: string):void {
    Sessions.destroy(id);
  }
}

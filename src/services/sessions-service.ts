import { DELETE, Path, POST, QueryParam } from 'typescript-rest';
import { Session } from '../models/session';
import { Sessions } from '../models/sessions';
import { IncomeTrackStrategy } from '../rtc/income-track-strategy';

@Path('/sessions')
export class SessionsService {

  @POST
  createSession(rtcConfiguration: RTCConfiguration, @QueryParam('trackStrategy') trackStrategy?: IncomeTrackStrategy): Session {
    const session = new Session(rtcConfiguration, trackStrategy);
    Sessions.add(session);
    return session;
  }

  @DELETE
  deleteSession(@QueryParam('id') id: string):void {
    Sessions.destroy(id);
  }
}

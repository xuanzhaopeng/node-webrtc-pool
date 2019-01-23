import { SessionsService } from '../../src/services/sessions-service';
import { Session } from '../../src/models/session';
import { Sessions } from '../../src/models/sessions';
const expect = require('chai').expect;

describe('sessions service', () => {
  const sessionsService = new SessionsService();
  let session:Session;

  it('create session', () => {
    session = sessionsService.createSession({});
    expect(session).to.not.be.undefined.and.null;
    expect(session.id).to.not.be.empty;
    expect(session.createTime).to.be.greaterThan(0);
    expect(session.peerConnectionClient).to.not.be.undefined.and.null;
    expect(Sessions.get(session.id)).to.not.be.undefined.and.null;

    const pc = session.peerConnectionClient;
    expect(pc.getConnectionState()).to.equal('new');
  });

  it('delete session', () => {
    sessionsService.deleteSession(session.id);
    expect(Sessions.get(session.id)).to.be.undefined;
  });

  after(() => {
    if (session) {
      session.destroy();
    }
  });
});

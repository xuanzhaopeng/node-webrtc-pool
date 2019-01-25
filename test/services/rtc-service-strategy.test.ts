import { SessionsService } from '../../src/services/sessions-service';
import { IncomeTrackStrategy } from '../../src/rtc/income-track-strategy';
import { mockedPeerConnectionConfig, sleep } from '../mock';
import { RtcService } from '../../src/services/rtc-service';
import { Sessions } from '../../src/models/sessions';
import { Session } from '../../src/models/session';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('rtc service strategy', () => {
  const sessionsService = new SessionsService();
  const rtcService = new RtcService();
  const createSession: (strategy: IncomeTrackStrategy) => Session = (strategy: IncomeTrackStrategy) => {
    return sessionsService.createSession(mockedPeerConnectionConfig, strategy);
  };

  it('support loop back', (done) => {
    const loopBackSession = createSession(IncomeTrackStrategy.LOOP_BACK);
    const sendTrackSession = createSession(IncomeTrackStrategy.NONE);

    rtcService.setFakeTrack(sendTrackSession.id, { audio: true, video:true }).then(() => {
      return rtcService.createOffer(sendTrackSession.id);
    }).then((offer) => {
      return rtcService.setRemoteSdp(loopBackSession.id, offer);
    }).then(() => {
      return sleep(500).then(() => {
        return rtcService.getLocalCandidates(loopBackSession.id);
      });
    }).then((candidatesOfLoopBackSession) => {
      return Promise.all(candidatesOfLoopBackSession.map(candidate => rtcService.addRemoteCandidate(sendTrackSession.id, candidate)));
    }).then(() => {
      return sleep(500).then(() => {
        return rtcService.getLocalCandidates(sendTrackSession.id);
      });
    }).then((candidatesOfSenderSession) => {
      return Promise.all(candidatesOfSenderSession.map(candidate => rtcService.addRemoteCandidate(loopBackSession.id, candidate)));
    }).then(() => {
      return sleep(500).then(() => {
        expect(loopBackSession.getPC().getSenders()).to.have.length(2);
        done();
      });
    }).catch((err) => {
      done(err);
    });
  });

  afterEach(() => {
    Sessions.clearAll();
  });
});

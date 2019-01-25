import { SessionsService } from '../../src/services/sessions-service';
import { RtcService } from '../../src/services/rtc-service';
import { Sessions } from '../../src/models/sessions';
import { mockedCandidate, mockedPeerConnectionClient, mockedPeerConnectionConfig, mockedSdp, sleep } from '../mock';
import { PeerConnectionClient } from '../../src/rtc/peer-connection-client';
import { IncomeTrackStrategy } from '../../src/rtc/income-track-strategy';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('rtc service', () => {
  const sessionsService = new SessionsService();
  const rtcService = new RtcService();
  let sessionId: string;

  it('set fake track', (done) => {
    expect(rtcService.setFakeTrack(sessionId, { audio: true, video: true })).to.be.fulfilled.then(() => {
      expect(Sessions.get(sessionId).getPC().getSenders()).to.have.lengthOf(2);
      done();
    }).catch((err:any) => {
      done(err);
    });
  });

  it('create offer success', (done) => {
    expect(rtcService.createOffer(sessionId, {})).to.be.fulfilled.then(() => {
      const localSdp = Sessions.get(sessionId).getPC().getLocalSdp();
      expect(localSdp).to.not.be.undefined.and.null;
      expect(localSdp.sdp).to.not.be.empty;
      expect(localSdp.type).to.equal('offer');
      done();
    }).catch((err:any) => {
      done(err);
    });
  });

  it('create offer failed when peer connection has been closed', (done) => {
    Sessions.get(sessionId).getPC().close();
    expect(rtcService.createOffer(sessionId, {})).to.be.rejectedWith(Error).notify(done);
  });

  it('create answer failed', (done) => {
    expect(rtcService.createAnswer(sessionId, {})).to.be.rejectedWith(Error).notify(done);
  });

  it('create answer success after remote sdp has been configured', (done) => {
    expect(rtcService.setRemoteSdp(sessionId, mockedSdp)).to.be.fulfilled.notify(done);
  });

  it('get empty local candidates', (done) => {
    expect(rtcService.getLocalCandidates(sessionId)).to.be.fulfilled.then((candidates:RTCIceCandidate[]) => {
      expect(candidates).to.have.length(0);
      done();
    }).catch((err:any) => {
      done(err);
    });
  });

  it('get non-empty local candidates', (done) => {
    rtcService.setFakeTrack(sessionId, { audio: true, video:true })
      .then(() => {
        return rtcService.createOffer(sessionId);
      }).then(() => {
        return expect(rtcService.getLocalCandidates(sessionId)).to.be.fulfilled.then((candidates:RTCIceCandidate[]) => {
          return sleep(500).then(() => {
            expect(candidates).to.have.lengthOf.above(0);
            done();
          });
        });
      }).catch((err:any) => {
        done(err);
      });
  });

  it('set remote candidate failed when the candidate is closed', (done) => {
    expect(rtcService.addRemoteCandidate(sessionId, mockedCandidate)).to.be.rejectedWith(Error).notify(done);
  });

  it('set remote candidate success when the candidate is valid', (done) => {
    let tmpCandidate:PeerConnectionClient;
    rtcService.setFakeTrack(sessionId, { audio: true, video: true }).then(() => {
      return mockedPeerConnectionClient('p2');
    }).then((p2) => {
      tmpCandidate = p2;
      return tmpCandidate.createOffer();
    }).then((p2Offer) => {
      return Promise.all([rtcService.setRemoteSdp(sessionId, p2Offer), tmpCandidate.setLocalSDP(p2Offer)]);
    }).then(() => {
      return rtcService.createAnswer(sessionId);
    }).then((p1Answer) => {
      return tmpCandidate.setRemoteSDP(p1Answer);
    }).then(() => {
      return sleep(500).then(() => {
        return tmpCandidate.getLocalCandidates();
      });
    }).then((p2Candidates) => {
      expect(p2Candidates).to.have.lengthOf.above(0);
      return expect(rtcService.addRemoteCandidate(sessionId, p2Candidates[0])).to.be.fulfilled.then(() => {
        expect(Sessions.get(sessionId).getPC().getRemoteCandidates()).to.have.length(1);
        done();
      });
    }).then(() => {
      tmpCandidate.close();
    }).catch((err) => {
      if (tmpCandidate) {
        tmpCandidate.close();
      }
      done(err);
    });
  });

  beforeEach(() => {
    const session = sessionsService.createSession(mockedPeerConnectionConfig, IncomeTrackStrategy.NONE);
    sessionId = session.id;
  });

  afterEach(() => {
    sessionsService.deleteSession(sessionId);
  });
});

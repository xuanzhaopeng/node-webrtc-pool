import { PeerConnectionClient } from '../../src/rtc/peer-connection-client';
import { mockPeerConnectionClient, sleep } from '../mock';
const expect = require('chai').expect;

describe('ice candidate', () => {

  let me: PeerConnectionClient;
  let you: PeerConnectionClient;

  it('local candidate received', async () => {
    me = await mockPeerConnectionClient('p1');
    const offer = await me.createOffer();
    await me.setLocalSDP(offer);
    await sleep(1000);
    expect(me.getLocalCandidates()).to.have.lengthOf.above(1);
  });

  it('remote candidate received', async () => {
    me = await mockPeerConnectionClient('p1');
    you = await mockPeerConnectionClient('p2');

    const callerOffer = await you.createOffer();
    await you.setLocalSDP(callerOffer);
    await me.setRemoteSDP(callerOffer);

    const calleeAnswer = await me.createAnswer();
    await me.setLocalSDP(calleeAnswer);
    await you.setRemoteSDP(calleeAnswer);

    you.getLocalCandidates().forEach((localCandidate) => {  me.addRemoteIceCandidate(localCandidate); });
    me.getLocalCandidates().forEach((localCandidate) => {  you.addRemoteIceCandidate(localCandidate); });

    await sleep(500);

    expect(you.getRemoteCandidates()).to.have.lengthOf.above(0);
    expect(me.getRemoteCandidates()).to.have.lengthOf.above(0);
  });

  afterEach(() => {
    if (me) {
      me.close();
    }
    if (you) {
      you.close();
    }
  });
});

import { PeerConnectionClient } from '../../src/rtc/peer-connection-client';
import { mockedPeerConnectionClient, sleep } from '../mock';
const expect = require('chai').expect;

describe('peer connection client', () => {

  let me: PeerConnectionClient;
  let you: PeerConnectionClient;

  it('receive local candidate', async () => {
    me = await mockedPeerConnectionClient('p1');
    const offer = await me.createOffer();
    await me.setLocalSDP(offer);
    await sleep(1000);
    expect(me.getLocalCandidates()).to.have.lengthOf.above(1);
  });

  it('receive remote candidate', async () => {
    me = await mockedPeerConnectionClient('p1');
    you = await mockedPeerConnectionClient('p2');

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

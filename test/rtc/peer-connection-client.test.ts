import { PeerConnectionClient } from '../../src/rtc/peer-connection-client';
import { defaultPeerConnectionConfig, mockSdp, mockStream } from '../mock';
const expect = require('chai').expect;

describe('peer connection client',  () => {
  {
    let pcc:PeerConnectionClient;
    const pccNickName = 'p1';
    const mockedSdp = mockSdp();
    const mockedStreamF: Promise<MediaStream> = mockStream();

    it('get connection state', () => {
      expect(pcc.getConnectionState()).equal('new');
    });

    it('add tracks from media stream', async () => {
      expect(pcc.getSenders()).to.have.lengthOf(0);
      const mediaStream: MediaStream = await mockedStreamF;
      await pcc.addTracksFromMediaStream(mediaStream);
      expect(pcc.getSenders()).to.have.lengthOf(2);
    });

    it('create offer success and set local sdp', async () => {
      const offer = await pcc.createOffer();
      expect(offer).to.not.be.undefined.and.not.an('error');
      expect(offer.sdp).to.not.be.undefined.and.empty;
      expect(offer.type).to.be.equal('offer');
      await pcc.setLocalSDP(offer);
      expect(pcc.getLocalSdp().sdp).equals(offer.sdp);
      expect(pcc.getLocalSdp().type).equals(offer.type);
    });

    it('create answer with error', async () => {
      const answer = await pcc.createAnswer();
      expect(answer).is.an('error');
    });

    it('create answer successfully', async () => {
      await pcc.setRemoteSDP(mockedSdp);
      const answer = await pcc.createAnswer();
      expect(answer).to.not.be.undefined.and.not.an('error');
      expect(answer.sdp).to.not.be.undefined.and.empty;
      expect(answer.type).to.be.equal('answer');
    });

    beforeEach(async () => {
      pcc = await new PeerConnectionClient(pccNickName, defaultPeerConnectionConfig);
    });

    afterEach(async () => {
      pcc.close();
    });
  }
});

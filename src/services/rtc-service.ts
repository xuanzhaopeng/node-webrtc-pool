import { GET, Path, PathParam, POST, PUT } from 'typescript-rest';
import { Sessions } from '../models/sessions';
import { Rtc } from '../rtc/rtc';
import { BaseService } from './base-service';

@Path('/session/:sessionId/rtc')
export class RtcService extends BaseService {

  @Path('/empty-stream')
  @POST
  setFakeTrack(@PathParam('sessionId') id: string, mediaStreamConstrains: MediaStreamConstraints): Promise<void> {
    return Promise.all([Sessions.getPeerConnection(id), Rtc.getFakeUserMediaStream(mediaStreamConstrains)])
      .then(([pc, stream]) => {
        return pc.addTracksFromMediaStream(stream);
      }).catch(this.onError);
  }

  @Path('/offer')
  @POST
  createOffer(@PathParam('sessionId') id: string, rtcOfferOptions?: RTCOfferOptions):Promise<RTCSessionDescriptionInit> {
    return Sessions.getPeerConnection(id).then((pc) => {
      return pc.createOffer(rtcOfferOptions)
        .then((sdp) => {
          return pc.setLocalSDP(sdp);
        }).then(() => {
          return pc.getLocalSdp();
        });
    }).catch(this.onError);
  }

  @Path('/remote-sdp')
  @PUT
  setRemoteSdp(@PathParam('sessionId') id: string, remoteSdp: RTCSessionDescriptionInit):Promise<void> {
    return Sessions.getPeerConnection(id).then((pc) => {
      return pc.setRemoteSDP(remoteSdp);
    }).catch(this.onError);
  }

  @Path('/answer')
  @POST
  createAnswer(@PathParam('sessionId') id: string, rtcOfferOptions?: RTCOfferOptions): Promise<RTCSessionDescriptionInit> {
    return Sessions.getPeerConnection(id).then((pc) => {
      return pc.createAnswer(rtcOfferOptions).then((sdp) => {
        return pc.setLocalSDP(sdp);
      }).then(() => {
        return pc.getLocalSdp();
      });
    }).catch(this.onError);
  }

  @Path('/local-candidates')
  @GET
  getLocalCandidates(@PathParam('sessionId') id: string): Promise<RTCIceCandidateInit[]> {
    return Sessions.getPeerConnection(id).then((pc) => {
      return pc.getLocalCandidates();
    }).catch(this.onError);
  }

  @Path('/remote-candidates')
  @POST
  addRemoteCandidate(@PathParam('sessionId') id: string, remoteCandidate: RTCIceCandidateInit): Promise<void> {
    return Sessions.getPeerConnection(id).then((pc) => {
      return pc.addRemoteIceCandidate(remoteCandidate);
    }).catch(this.onError);
  }
}

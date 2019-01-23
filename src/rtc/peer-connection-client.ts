import { Rtc } from './rtc';
import { PCLogger } from '../logger';

export class PeerConnectionClient {
  private peerConnection: any;
  private readonly nickName: string;
  private readonly localCandidates:RTCIceCandidate[];
  private readonly remoteCandidates: RTCIceCandidate[];
  private readonly streams:MediaStream[];

  constructor(nickName: string, configuration:RTCConfiguration) {
    this.nickName = nickName;
    this.localCandidates = [];
    this.remoteCandidates = [];
    this.streams = [];

    this.peerConnection = Rtc.createPeerConnection(this.nickName, configuration);
    this.peerConnection.onsignalingstatechange = this.onStateChange.bind(this);
    this.peerConnection.oniceconnectionstatechange = this.onStateChange.bind(this);
    this.peerConnection.onicegatheringstatechange = this.onStateChange.bind(this);
    this.peerConnection.onicecandidate = this.onIceCandidate.bind(this);
    this.peerConnection.ontrack = this.onTrack.bind(this);
  }

  close():void {
    this.streams.forEach((stream) => {
      stream.getTracks().forEach(track => track.stop());
    });
    this.peerConnection.close();
    PCLogger.debug(`[${this.nickName}] connection closed`);
  }

  createOffer(options?: RTCOfferOptions):Promise<RTCSessionDescription> {
    return this.peerConnection.createOffer(options).then((offer: RTCSessionDescription) => {
      PCLogger.debug(`[${this.nickName}] offer has been created: ${JSON.stringify(offer)}`);
      return offer;
    },                                                   (err: Error) => {
      PCLogger.error(`[${this.nickName}] offer created failed: ${err.message}`);
      return err;
    });
  }

  createAnswer(options?: RTCOfferOptions):Promise<RTCSessionDescription> {
    return this.peerConnection.createAnswer(options).then((answer:RTCSessionDescription) => {
      PCLogger.debug(`[${this.nickName}] answer has been created: ${JSON.stringify(answer)}`);
      return answer;
    },                                                    (err: Error) => {
      PCLogger.error(`[${this.nickName}] answer created failed - ${err.message}`);
      return err;
    });
  }

  getLocalSdp():RTCSessionDescription {
    return this.peerConnection.localDescription;
  }

  getRemoteSdp():RTCSessionDescription {
    return this.peerConnection.remoteDescription;
  }

  getConnectionState():string {
    return this.peerConnection.connectionState;
  }

  getSenders(): RTCRtpSender[] {
    return this.peerConnection.getSenders();
  }

  addTracksFromMediaStream(stream: MediaStream):void {
    this.streams.push(stream);
    return stream.getTracks().forEach(track => this.peerConnection.addTrack(track, stream));
  }

  addTracksFromMediaStreamPromise(streamF: Promise<MediaStream>):Promise<any> {
    return streamF.then((stream:MediaStream) => {
      this.streams.push(stream);
      return stream.getTracks().forEach(track => this.peerConnection.addTrack(track, stream));
    }).catch((error: any) => {
      PCLogger.error(error);
      return error;
    });
  }

  // TODO: handle error properly
  setLocalSDP(offer: RTCSessionDescription):Promise<void> {
    return this.peerConnection.setLocalDescription(offer, () => {
      PCLogger.debug(`[${this.nickName}] local sdp has been successfully set:${JSON.stringify(this.getLocalSdp())}`);
    },                                             (err: any) => {
      PCLogger.error(`[${this.nickName}] local sdp set failed: ${JSON.stringify(err)}`);
    });
  }

  // TODO: handle error properly
  setRemoteSDP(remoteOffer: RTCSessionDescription):Promise<void> {
    return this.peerConnection.setRemoteDescription(remoteOffer, () => {
      PCLogger.debug(`[${this.nickName}] remote sdp has been successfully set:${JSON.stringify(this.getRemoteSdp())}`);
    },                                              (err: any) => {
      PCLogger.error(`[${this.nickName}] remote sdp set failed: ${err}`);
    });
  }

  getLocalCandidates():RTCIceCandidate[] {
    return this.localCandidates;
  }

  getRemoteCandidates(): RTCIceCandidate[] {
    return this.remoteCandidates;
  }

  addRemoteIceCandidate(candidate: RTCIceCandidate):Promise<void> {
    return this.peerConnection.addIceCandidate(candidate).then(() => {
      this.remoteCandidates.push(candidate);
      PCLogger.debug(`[${this.nickName}] remote ice candidate has been added successfully => ${JSON.stringify(candidate)}`);
    }).catch((err:Error) => {
      PCLogger.error(`[${this.nickName}] remote ice candidate added failed => ${JSON.stringify(candidate)}`);
      return err;
    });
  }

  private onTrack(trackEvent: RTCTrackEvent) {
    PCLogger.debug(`[${this.nickName}] Receive Track: Kind = ${trackEvent.track.kind} , ID = ${trackEvent.track.id}`);
  }

  private onIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      this.localCandidates.push(event.candidate);
      PCLogger.debug(`[${this.nickName}] Receive local candidate : ${JSON.stringify(event.candidate)}`);
    }
  }

  private onStateChange(event: Event) {
    PCLogger.debug(`[${this.nickName}] State '${event.type}' has been changed`);
    switch (event.type) {
      case 'signalingstatechange':
        break;
      case 'iceconnectionstatechange':
        break;
      case 'icegatheringstatechange':
        break;
      default:
        PCLogger.error(`[${this.nickName}] Unknown type of state change - ${event.type}`);
    }
  }
}

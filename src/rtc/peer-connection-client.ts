import { Rtc } from './rtc';
import { PCLogger } from '../logger';
import { IncomeTrackStrategy } from './income-track-strategy';

export class PeerConnectionClient {
  private peerConnection: any;
  private readonly nickName: string;
  private readonly localCandidates:RTCIceCandidateInit[];
  private readonly remoteCandidates: RTCIceCandidateInit[];
  private readonly streams:MediaStream[];
  private readonly incomeTrackStrategy: IncomeTrackStrategy;

  constructor(nickName: string, configuration:RTCConfiguration, incomeTrackStrategy: IncomeTrackStrategy = IncomeTrackStrategy.NONE) {
    this.nickName = nickName;
    this.localCandidates = [];
    this.remoteCandidates = [];
    this.streams = [];
    this.incomeTrackStrategy = incomeTrackStrategy;

    this.peerConnection = Rtc.createPeerConnection(this.nickName, configuration);
    this.peerConnection.onsignalingstatechange = this.onStateChange.bind(this);
    this.peerConnection.oniceconnectionstatechange = this.onStateChange.bind(this);
    this.peerConnection.onicegatheringstatechange = this.onStateChange.bind(this);
    this.peerConnection.onicecandidate = this.onIceCandidate.bind(this);
    this.peerConnection.ontrack = this.onTrack.bind(this);
  }

  close():void {
    PCLogger.debug(`[${this.nickName}] connection closing`);
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
    }).catch((err: Error) => {
      PCLogger.error(`[${this.nickName}] offer created failed: ${err.message}`);
      return Promise.reject(err);
    });
  }

  createAnswer(options?: RTCOfferOptions):Promise<RTCSessionDescription> {
    return this.peerConnection.createAnswer(options).then((answer:RTCSessionDescription) => {
      PCLogger.debug(`[${this.nickName}] answer has been created: ${JSON.stringify(answer)}`);
      return answer;
    }).catch((err: Error) => {
      PCLogger.error(`[${this.nickName}] answer created failed - ${err.message}`);
      return Promise.reject(err);
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
    stream.getTracks().forEach(track => this.peerConnection.addTrack(track, stream));
  }

  setLocalSDP(offer: RTCSessionDescriptionInit):Promise<void> {
    return this.peerConnection.setLocalDescription(offer).then(() => {
      PCLogger.debug(`[${this.nickName}] local sdp has been successfully set:${JSON.stringify(this.getLocalSdp())}`);
    }).catch((err:any) => {
      PCLogger.error(`[${this.nickName}] local sdp set failed: ${err}`);
      return Promise.reject(err);
    });
  }

  setRemoteSDP(remoteOffer: RTCSessionDescriptionInit):Promise<void> {
    return this.peerConnection.setRemoteDescription(remoteOffer).then(() => {
      PCLogger.debug(`[${this.nickName}] remote sdp has been successfully set:${JSON.stringify(this.getRemoteSdp())}`);
    }).catch((err: any) => {
      PCLogger.error(`[${this.nickName}] remote sdp set failed: ${err}`);
      return Promise.reject(err);
    });
  }

  getLocalCandidates():RTCIceCandidateInit[] {
    return this.localCandidates;
  }

  getRemoteCandidates(): RTCIceCandidateInit[] {
    return this.remoteCandidates;
  }

  addRemoteIceCandidate(candidate: RTCIceCandidateInit):Promise<void> {
    return this.peerConnection.addIceCandidate(candidate).then(() => {
      this.remoteCandidates.push(candidate);
      PCLogger.debug(`[${this.nickName}] remote ice candidate has been added successfully => ${JSON.stringify(candidate)}`);
    }).catch((err:Error) => {
      PCLogger.error(`[${this.nickName}] remote ice candidate added failed => ${JSON.stringify(candidate)}`);
      return Promise.reject(err);
    });
  }

  private onTrack(trackEvent: RTCTrackEvent) {
    PCLogger.debug(`[${this.nickName}] Receive Track: Kind = ${trackEvent.track.kind} , ID = ${trackEvent.track.id}`);
    if (this.incomeTrackStrategy === IncomeTrackStrategy.LOOP_BACK) {
      this.peerConnection.addTrack(trackEvent.track, ...trackEvent.streams);
      PCLogger.debug(`[${this.nickName}] Received track will be looped back`);
    }
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

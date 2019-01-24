import { Rtc } from '../src/rtc/rtc';
import {PeerConnectionClient} from "../src/rtc/peer-connection-client";

export const mockedPeerConnectionConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export const mockedSdp:RTCSessionDescriptionInit = {
  sdp:'v=0\r\no=- 296125848539423303 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=msid-semantic: WMS\r\n',
  type: 'offer'
};

export const mockedCandidate:RTCIceCandidateInit = {
  candidate : "candidate:1019731727 1 udp 2122260223 192.168.1.104 54828 typ host generation 0 ufrag 7X+t network-id 1 network-cost 50",
  sdpMid: "audio",
  sdpMLineIndex: 0
};

export function mockStream():Promise<MediaStream> {
  return Rtc.getFakeUserMediaStream({ audio: true, video: true })
}

export function mockedPeerConnectionClient(nickName: string):Promise<PeerConnectionClient> {
  let pcc = new PeerConnectionClient(nickName, mockedPeerConnectionConfig);
  return mockStream().then((stream) => {
    pcc.addTracksFromMediaStream(stream);
    return pcc;
  });
}

export async function sleep(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

import { Rtc } from '../src/rtc/rtc';
import {PeerConnectionClient} from "../src/rtc/peer-connection-client";

export const defaultPeerConnectionConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export function mockStream():Promise<MediaStream> {
  return Rtc.getFakeUserMediaStream({ audio: true, video: true })
}

export function mockSdp():RTCSessionDescription {
  return {
    sdp:'v=0\r\no=- 296125848539423303 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=msid-semantic: WMS\r\n',
    type: 'offer',
    toJSON: () => {},
  };
}

export async function mockPeerConnectionClient(nickName: string):Promise<PeerConnectionClient> {
  let pcc = await new PeerConnectionClient(nickName, defaultPeerConnectionConfig);
  await pcc.addTracksFromMediaStreamPromise(mockStream());
  return pcc;
}

export async function sleep(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

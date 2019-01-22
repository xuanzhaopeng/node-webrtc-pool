import { PCLogger } from '../logger';

export namespace Rtc {
  const webrtc:any = require('wrtc');
  export function createPeerConnection(nickName:string, configuration = {}):any {
    PCLogger.debug(`[${nickName}] creating RTC Peer connection with:configuration:${JSON.stringify(configuration)}}`);
    return new webrtc.RTCPeerConnection(configuration);
  }

  export function getFakeUserMediaStream(constraints: MediaStreamConstraints)
    : Promise<MediaStream> {
    PCLogger.debug(`create fake user media stream: ${JSON.stringify(constraints)}`);
    return webrtc.getUserMedia(constraints);
  }
}

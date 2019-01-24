import { v4 as uuid } from 'uuid';
import { PeerConnectionClient } from '../rtc/peer-connection-client';
import { IncomeTrackStrategy } from '../rtc/income-track-strategy';

export class Session {
  public readonly id: string;
  public readonly createTime: number;
  public readonly peerConnectionClient: PeerConnectionClient;

  constructor(rtcConfiguration: RTCConfiguration, trackStrategy: IncomeTrackStrategy) {
    this.id = uuid();
    this.createTime = Date.now();
    this.peerConnectionClient = new PeerConnectionClient(this.id, rtcConfiguration, trackStrategy);
  }

  destroy() {
    this.peerConnectionClient.close();
  }

  toJSON() {
    return {
      id: this.id,
      createTime: this.createTime,
    };
  }
}

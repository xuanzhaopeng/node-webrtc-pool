import { Errors, Path, PathParam, POST } from 'typescript-rest';
import { Sessions } from '../models/sessions';

@Path('/session/:session/rtc')
export class RtcService {

  @Path('/create-offer')
  @POST
  createOffer(@PathParam('session') id: string, rtcOfferOptions: RTCOfferOptions):Promise<RTCSessionDescription> {
    if (!Sessions.get(id)) {
      throw new Errors.NotFoundError(`session ${id} not found`);
    }
    const pc = Sessions.get(id).peerConnectionClient;
    return pc.createOffer(rtcOfferOptions).then((sdp) => {
      return pc.setLocalSDP(sdp);
    }).then(() => {
      return pc.getLocalSdp();
    }).catch((err) => {
      throw new Errors.BadRequestError(err);
    });
  }
}

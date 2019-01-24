import { Errors, HttpError } from 'typescript-rest';
import { ServerLogger } from '../logger';

export class BaseService {
  protected onError(reason: any):never {
    ServerLogger.error(`Error: ${reason}`);
    if (reason instanceof Error) {
      throw (reason instanceof HttpError) ? reason : new Errors.BadRequestError(reason.message);
    } else {
      throw new Errors.BadRequestError(reason);
    }
  }
}

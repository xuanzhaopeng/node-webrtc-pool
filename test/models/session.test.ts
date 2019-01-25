import { Session } from '../../src/models/session';
import { IncomeTrackStrategy } from '../../src/rtc/income-track-strategy';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('session', () => {
  let session: Session;
  it('to json', () => {
    session = new Session({}, IncomeTrackStrategy.NONE);
    expect(JSON.stringify(session)).to.include('id').and.include('createTime').not.to.include('peerConnectionClient');
  });

  afterEach(() => {
    if (session) {
      session.destroy();
    }
  });
});

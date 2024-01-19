import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { describe } from 'mocha';
import { HttpException } from './http-exception';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

describe('HttpException', () => {
    it('should create a simple HTTPException', () => {
        const createdMessage = 'Course created successfuly';
        const httpException: HttpException = new HttpException(createdMessage);

        expect(httpException.message).to.equals(createdMessage);
    });
});

import { authenticateToken } from './authentificate-token';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@app/classes/http-exception/http-exception';
import * as jwt from 'jsonwebtoken';
import * as sinon from 'sinon';
import * as virtualPlayerUtils from '@app/utils/is-id-virtual-player/is-id-virtual-player';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

describe('authenticateToken', () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;
    let virtualPlayerUtilsStub: sinon.SinonStub;

    beforeEach(() => {
        req = {
            headers: {
                authorization: '',
            },
            body: {},
        } as unknown as Request;
        res = {} as unknown as Response;
        next = sinon.spy();

        virtualPlayerUtilsStub = sinon.stub(virtualPlayerUtils, 'doesRequestComeFromVirtualPlayer');
        virtualPlayerUtilsStub.returns(false);
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
    });

    it('Should throw HTTP exception - 401 if user has invalid token', () => {
        next = sinon.spy((error: HttpException) => {
            throw error;
        }) as unknown as NextFunction;
        try {
            authenticateToken(req, res, next);
        } catch (error) {
            expect(error).to.be.an.instanceOf(HttpException);
        }
    });

    it('should verify token', () => {
        sinon.stub(jwt, 'verify');
        req.headers.authorization = 'Bearer valid_token';
        authenticateToken(req, res, next);
        expect(req.body).to.have.property('idUser');
    });

    it('should next if request comes from virtual player', () => {
        virtualPlayerUtilsStub.returns(true);

        authenticateToken(req, res, next);

        expect(req.body).not.to.have.property('idUser');
    });
});

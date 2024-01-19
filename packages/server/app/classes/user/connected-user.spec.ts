/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { SOCKET_ID_IS_REQUIRED, USER_ID_IS_REQUIRED } from '@app/constants/controllers-errors';
import { expect } from 'chai';
import { ConnectedUser } from './connected-user';

const DEFAULT_SOCKET_ID = 'socket-id';
const DEFAULT_USER_ID = 1;

describe('ConnectedUser', () => {
    let connectedUser: ConnectedUser;

    beforeEach(() => {
        connectedUser = new ConnectedUser();
    });

    describe('connect', () => {
        it('should set user as connected', () => {
            connectedUser.connect(DEFAULT_SOCKET_ID, DEFAULT_USER_ID);

            expect(connectedUser.isConnected(DEFAULT_SOCKET_ID)).to.be.true;
            expect(connectedUser.isConnected(DEFAULT_USER_ID)).to.be.true;
        });

        it('should throw if socketId is not provided', () => {
            expect(() => connectedUser.connect(undefined as unknown as string, DEFAULT_USER_ID)).to.throw(SOCKET_ID_IS_REQUIRED);
        });

        it('should throw if userId is not provided', () => {
            expect(() => connectedUser.connect(DEFAULT_SOCKET_ID, undefined as unknown as number)).to.throw(USER_ID_IS_REQUIRED);
        });
    });

    describe('disconnect', () => {
        it('should set user as disconnected when disconnect with socketId', () => {
            connectedUser.connect(DEFAULT_SOCKET_ID, DEFAULT_USER_ID);
            connectedUser.disconnect(DEFAULT_SOCKET_ID);

            expect(connectedUser.isConnected(DEFAULT_SOCKET_ID)).to.be.false;
            expect(connectedUser.isConnected(DEFAULT_USER_ID)).to.be.false;
        });

        it('should set user as disconnected when disconnect with userId', () => {
            connectedUser.connect(DEFAULT_SOCKET_ID, DEFAULT_USER_ID);
            connectedUser.disconnect(DEFAULT_USER_ID);

            expect(connectedUser.isConnected(DEFAULT_SOCKET_ID)).to.be.false;
            expect(connectedUser.isConnected(DEFAULT_USER_ID)).to.be.false;
        });
    });

    describe('isConnected', () => {
        it('should return true if is connected', () => {
            connectedUser.connect(DEFAULT_SOCKET_ID, DEFAULT_USER_ID);

            expect(connectedUser.isConnected(DEFAULT_SOCKET_ID)).to.be.true;
            expect(connectedUser.isConnected(DEFAULT_USER_ID)).to.be.true;
        });

        it('should return false if is not connected', () => {
            expect(connectedUser.isConnected(DEFAULT_SOCKET_ID)).to.be.false;
            expect(connectedUser.isConnected(DEFAULT_USER_ID)).to.be.false;
        });
    });

    describe('getSocketId', () => {
        it('it should return socketId if is connected', () => {
            connectedUser.connect(DEFAULT_SOCKET_ID, DEFAULT_USER_ID);

            expect(connectedUser.getSocketId(DEFAULT_SOCKET_ID)).to.equal(DEFAULT_SOCKET_ID);
            expect(connectedUser.getSocketId(DEFAULT_USER_ID)).to.equal(DEFAULT_SOCKET_ID);
        });

        it('it should throw if is not connected', () => {
            expect(() => connectedUser.getSocketId(DEFAULT_USER_ID)).to.throw();
        });
    });

    describe('getUserId', () => {
        it('it should return userId if is connected', () => {
            connectedUser.connect(DEFAULT_SOCKET_ID, DEFAULT_USER_ID);

            expect(connectedUser.getUserId(DEFAULT_SOCKET_ID)).to.equal(DEFAULT_USER_ID);
            expect(connectedUser.getUserId(DEFAULT_USER_ID)).to.equal(DEFAULT_USER_ID);
        });

        it('it should throw if is not connected', () => {
            expect(() => connectedUser.getUserId(DEFAULT_SOCKET_ID)).to.throw();
        });
    });
});

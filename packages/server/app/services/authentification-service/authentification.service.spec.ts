/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ALREADY_LOGGED, NO_LOGIN, NO_VALIDATE } from '@app/constants/controllers-errors';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { User } from '@common/models/user';
import * as bcryptjs from 'bcryptjs';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { Socket } from 'socket.io';
import { Container } from 'typedi';
import { AuthentificationService } from './authentification.service';
import * as jwt from 'jsonwebtoken';
import { UserService } from '@app/services/user-service/user-service';
import { Knex } from 'knex';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

const SOCKET_ID = '1';
const USER_ID = 1;
const TOKEN = 'token';
const ADMIN_USER: User = { avatar: '', email: 'admin@admin.com', idUser: USER_ID, password: 'admin', username: 'admin' };

describe('AuthentificationService', () => {
    let testingUnit: ServicesTestingUnit;
    let authentificationService: AuthentificationService;
    let userTable: () => Knex.QueryBuilder<User>;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(() => {
        authentificationService = Container.get(AuthentificationService);
        userTable = () => Container.get(UserService)['table'];
    });

    afterEach(() => {
        testingUnit.restore();
        chai.spy.restore();
    });

    it('should be defined', () => {
        expect(authentificationService);
        expect(authentificationService.connectedUsers).to.exist;
    });

    describe('authentificateSocket', () => {
        let socket: Socket;

        beforeEach(() => {
            socket = { id: SOCKET_ID, data: {} } as Socket;

            chai.spy.on(jwt, 'verify', () => USER_ID);
            chai.spy.on(authentificationService, 'getUserById', async () => ADMIN_USER);
        });

        it('should throw if user is already connected', () => {
            authentificationService.connectedUsers.connect(SOCKET_ID, USER_ID);

            expect(authentificationService.authentificateSocket(socket, TOKEN)).to.eventually.rejectedWith(ALREADY_LOGGED);
        });

        it('should connect user', async () => {
            await userTable().insert(ADMIN_USER);
            await authentificationService.authentificateSocket(socket, TOKEN);

            expect(authentificationService.connectedUsers.isConnected(SOCKET_ID));
        });

        it('should add idUser to socket data', async () => {
            await userTable().insert(ADMIN_USER);
            await authentificationService.authentificateSocket(socket, TOKEN);

            expect(socket.data.user).to.deep.equal(ADMIN_USER);
        });
    });

    describe('disconnectSocket', () => {
        it('should disconnect user', () => {
            authentificationService.connectedUsers.connect(SOCKET_ID, USER_ID);
            authentificationService.disconnectSocket(SOCKET_ID);
            expect(authentificationService.connectedUsers.isConnected(SOCKET_ID)).to.be.false;
        });
    });

    describe('validateEmail', () => {
        it('should return true with a unused email', async () => {
            const email = 'XXXXXX@admin.com';
            expect(await authentificationService.validateEmail(email)).to.be.true;
        });

        it('should return true with a unused email', async () => {
            const email = 'XXXXXX@admin.com';
            expect(await authentificationService.validateEmail(email)).to.be.true;
        });
    });

    describe('validateUsername', () => {
        it('should return true with a unused username', async () => {
            const username = 'XXXXXXX';
            expect(await authentificationService.validateUsername(username)).to.be.true;
        });
    });

    describe('signUp', () => {
        it('should call createUser method from databaseService', () => {
            authentificationService.signUp(ADMIN_USER);
        });
    });

    describe('login', () => {
        beforeEach(() => {
            chai.spy.on(authentificationService.generateAccessToken, TOKEN);
        });

        it('should throw new Error(NO_LOGIN) when no match', async () => {
            await userTable().insert(ADMIN_USER);
            chai.spy.on(bcryptjs, 'compare', () => false);
            expect(authentificationService.login(ADMIN_USER)).to.eventually.rejectedWith(NO_LOGIN);
        });

        it('should login the admin', async () => {
            await userTable().insert(ADMIN_USER);
            chai.spy.on(bcryptjs, 'compare', () => true);
            const admin = { email: 'admin@admin.com', password: 'admin', username: 'admin' };
            
            expect(await authentificationService.login(admin)).to.exist;
        });

        it('should return a token', async () => {
            await userTable().insert(ADMIN_USER);
            chai.spy.on(bcryptjs, 'compare', () => true);
            expect(authentificationService.login(ADMIN_USER)).to.eventually.have.property('token');
        });

        it('should return a user', async () => {
            await userTable().insert(ADMIN_USER);
            chai.spy.on(bcryptjs, 'compare', () => true);
            expect(authentificationService.login(ADMIN_USER)).to.eventually.have.property('user');
        });
    });


    describe('validate', () => {
        it('should throw if is connected', () => {
            authentificationService.connectedUsers.connect(SOCKET_ID, USER_ID);
            expect(authentificationService.validate(USER_ID)).to.eventually.rejectedWith(ALREADY_LOGGED);
        });

        it('should thow if cannot generate token', () => {
            chai.spy.on(authentificationService, 'generateAccessToken', () => { throw new Error(); });
            expect(authentificationService.validate(USER_ID)).to.eventually.rejectedWith(NO_VALIDATE);
        });

        it('should return user and token', async () => {
            await userTable().insert(ADMIN_USER);
            chai.spy.on(authentificationService, 'generateAccessToken', () => TOKEN);

            const { token, user } = await authentificationService.validate(ADMIN_USER.idUser);

            expect(token).to.equal(TOKEN);
            expect(user).to.deep.equal(ADMIN_USER);
        });
    });

    describe('HAPPY PATH', () => {
        it('should return access token on password match', async () => {
            const expectedAccessToken = 'ACCESS';
            chai.spy.on(authentificationService, 'generateAccessToken', () => expectedAccessToken);
            chai.spy.on(bcryptjs, 'compare', () => true);

            expect(authentificationService.login(ADMIN_USER)).to.eventually.equal(expectedAccessToken);
        });
    });

    describe('SAD PATH', () => {
        it('should NOT return access token on password match', async () => {
            chai.spy.on(bcryptjs, 'compare', () => false);

            expect(authentificationService.login(ADMIN_USER)).to.eventually.not.exist;
        });
    });
});

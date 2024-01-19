/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { USER_NOT_FOUND } from '@app/constants/services-errors';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { User } from '@common/models/user';
import { expect } from 'chai';
import { Knex } from 'knex';
import { Container } from 'typedi';
import { UserSearchService } from './user-search-service';

const DEFAULT_USER: User = {
    idUser: 1,
    avatar: 'the-way-of-the-water',
    email: 'me@me.com',
    password: '123',
    username: 'username',
};

describe('UserSearchService', () => {
    let service: UserSearchService;
    let testingUnit: ServicesTestingUnit;
    let userTable: () => Knex.QueryBuilder<User>;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(() => {
        service = Container.get(UserSearchService);
        userTable = () => service['table'];
    });

    beforeEach(async () => {
        await userTable().insert({ ...DEFAULT_USER, idUser: 1, username: 'user1', email: 'user1@me.com' });
        await userTable().insert({ ...DEFAULT_USER, idUser: 2, username: 'user2', email: 'user2@me.com' });
        await userTable().insert({ ...DEFAULT_USER, idUser: 3, username: 'user3', email: 'user3@me.com' });
        await userTable().insert({ ...DEFAULT_USER, idUser: 4, username: 'user4', email: 'user4@me.com' });
        await userTable().insert({ ...DEFAULT_USER, idUser: 5, username: 'user5', email: 'user5@me.com' });
        await userTable().insert({ ...DEFAULT_USER, idUser: 6, username: 'different', email: 'different@me.com' });
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    describe('search', () => {
        it('should return all matching users 1', async () => {
            expect(service.search('user')).to.eventually.have.length(5);
        });

        it('should return all matching users 2', async () => {
            expect(service.search('different')).to.eventually.have.length(1);
        });

        it('should exclude user', async () => {
            expect(service.search('user', 2)).to.eventually.have.length(4);
        });

        it('should return nothing if no matching', () => {
            expect(service.search('notmatching')).to.eventually.have.length(0);
        });
    });

    describe('findProfileWithUsername', () => {
        it('should return user with gameHistory and statistics', async () => {
            const userResult = await service.findProfileWithUsername('user1');

            expect(userResult).to.exist;
            expect(userResult).to.haveOwnProperty('username');
            expect(userResult).to.haveOwnProperty('avatar');
            expect(userResult).to.haveOwnProperty('gameHistory');
            expect(userResult).to.haveOwnProperty('statistics');
            expect(userResult).to.haveOwnProperty('achievements');
        });

        it('should return a 404 if not found', async () => {
            expect(service.findProfileWithUsername('notmatching')).to.eventually.be.rejectedWith(USER_NOT_FOUND);
        });
    });
});

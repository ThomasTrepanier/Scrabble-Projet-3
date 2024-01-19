/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Container } from 'typedi';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { ServerActionService } from './server-action.service';
import { expect } from 'chai';
import { Knex } from 'knex';
import { ServerAction, ServerActionType } from '@common/models/server-action';
import { User } from '@common/models/user';
import { UserService } from '@app/services/user-service/user-service';

const DEFAULT_USER: User = {
    avatar: '1',
    email: '1',
    idUser: 1,
    password: '1',
    username: '1',
};
const DEFAULT_USER_2: User = {
    avatar: '2',
    email: '2',
    idUser: 2,
    password: '2',
    username: '2',
};
const DEFAULT_ACTION: ServerAction = {
    actionType: ServerActionType.LOGIN,
    idUser: DEFAULT_USER.idUser,
    timestamp: new Date(),
};

describe('ServerActionService', () => {
    let service: ServerActionService;
    let table: () => Knex.QueryBuilder<ServerAction>;
    let userTable: () => Knex.QueryBuilder<User>;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(() => {
        service = Container.get(ServerActionService);
        table = () => service['table'];
        userTable = () => Container.get(UserService)['table'];
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    describe('addAction', () => {
        it('should add action', async () => {
            await userTable().insert(DEFAULT_USER);

            await service.addAction(DEFAULT_ACTION);

            expect(await table().select('*')).to.have.length(1);
        });
    });

    describe('getActions', () => {
        it('should return actions', async () => {
            await userTable().insert(DEFAULT_USER);
            await userTable().insert(DEFAULT_USER_2);

            await service.addAction(DEFAULT_ACTION);
            await service.addAction({ ...DEFAULT_ACTION, actionType: ServerActionType.LOGOUT });
            await service.addAction({ ...DEFAULT_ACTION, idUser: DEFAULT_USER_2.idUser });

            expect(await service.getActions(DEFAULT_ACTION.idUser)).to.have.length(2);
        });
    });
});

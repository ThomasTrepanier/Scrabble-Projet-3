import { Knex } from 'knex';
import { Service } from 'typedi';
import { PublicServerAction, ServerAction, ServerActionCreation } from '@common/models/server-action';
import DatabaseService from '@app/services/database-service/database.service';
import { SERVER_ACTION_TABLE } from '@app/constants/services-constants/database-const';
import { TypeOfId } from '@common/types/id';
import { User } from '@common/models/user';

@Service()
export class ServerActionService {
    constructor(private readonly databaseService: DatabaseService) {}

    async addAction(action: ServerActionCreation): Promise<void> {
        await this.table.insert({ ...action, timestamp: new Date() });
    }

    async getActions(idUser: TypeOfId<User>): Promise<PublicServerAction[]> {
        return this.table.select(['actionType', 'timestamp']).where({ idUser }).orderBy('timestamp', 'desc');
    }

    private get table(): Knex.QueryBuilder<ServerAction> {
        return this.databaseService.knex<ServerAction>(SERVER_ACTION_TABLE);
    }
}

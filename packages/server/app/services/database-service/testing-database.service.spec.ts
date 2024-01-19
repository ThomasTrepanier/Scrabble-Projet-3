import { env } from '@app/utils/environment/environment';
import { Knex } from 'knex';
import { newDb } from 'pg-mem';
import { Service } from 'typedi';
import DatabaseService from './database.service';

@Service()
export default class TestingDatabaseService implements DatabaseService {
    knex: Knex;

    constructor() {
        if (!env.isTest) throw new Error('TestingDatabaseService should only be used in a test environment');
    }

    async setup(): Promise<void> {
        const db = newDb();
        this.knex = db.adapters.createKnex();
        await this.knex.migrate.latest();
    }

    async pingDb(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.knex
                .raw('SELECT 1')
                .then(() => resolve())
                .catch(reject);
        });
    }
}

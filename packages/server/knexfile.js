/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const { cleanEnv, str, num } = require('envalid');

const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ['development', 'test', 'production', 'staging'],
        default: 'development'
    }),
    PG_HOST: str({ example: 'localhost' }),
    PG_PORT: num({ default: 5432 }),
    PG_USER: str(),
    PG_PASSWORD: str(),
    PG_DATABASE: str(),

    // TODO: remove after sql migration completed
    DB_PASSWORD: str({ default: '' }),
    DB_DATABASE: str({ default: '' }),
    DB_USER: str({ default: '' }),

    PG_HOST_PORT: num({ default: undefined }),
    PG_DEV_PORT: num({ default: undefined }),
});

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: env.PG_HOST_PORT ?? 'localhost',
            port: env.PG_DEV_PORT ?? 5432,
            user: 'root',
            password: 'root',
            database: 'scrabble',
        },
    },

    test: {
        client: 'pg',
        connection: {
            host: env.PG_HOST_PORT ?? 'localhost',
            port: env.PG_DEV_PORT ?? 5432,
            user: 'root',
            password: 'root',
            database: 'scrabble-test',
        },
    },

    production: {
        client: 'pg',
        connection: {
            host: env.DB_PASSWORD,
            database: env.DB_DATABASE,
            user: env.DB_USER,
            password: env.DB_PASSWORD,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    },
};

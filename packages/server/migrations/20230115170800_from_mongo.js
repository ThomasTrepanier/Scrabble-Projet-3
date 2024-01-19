/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('GameHistory', (table) => {
        table.increments('idGameHistory').notNullable().primary();
        table.dateTime('startTime').notNullable();
        table.dateTime('endTime').notNullable();
        table.string('gameType', 20).notNullable();
        table.string('gameMode', 20).notNullable();
        table.boolean('hasBeenAbandoned').notNullable();
    });

    await knex.schema.createTable('GameHistoryPlayer', (table) => {
        table.increments('idGameHistoryPlayer').notNullable()
        table.integer('playerIndex').notNullable();
        table.integer('idGameHistory').notNullable();
        table.string('name', 40).notNullable();
        table.integer('score').notNullable();
        table.boolean('isVirtualPlayer').notNullable();
        table.boolean('isWinner').notNullable();

        table.primary(['idGameHistoryPlayer', 'playerIndex', 'idGameHistory']);
        table.foreign('idGameHistory', 'GameHistory', 'idGameHistory');
    });

    await knex.schema.createTable('HighScore', (table) => {
        table.increments('idHighScore').notNullable().primary();
        table.string('gameType', 20).notNullable();
        table.integer('score').notNullable();
    });

    await knex.schema.createTable('HighScorePlayer', (table) => {
        table.integer('idHighScore').notNullable();
        table.string('name', 20).notNullable();

        table.primary(['idHighScore', 'name']);
        table.foreign('idHighScore').references('idHighScore').inTable('HighScore');
    });

    await knex.schema.createTable('VirtualPlayer', (table) => {
        table.increments('idVirtualPlayer').notNullable().primary();
        table.string('name', 20).notNullable().unique();
        table.string('level', 20).notNullable();
        table.boolean('isDefault').notNullable().defaultTo(false);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable('VirtualPlayer');
    await knex.schema.dropTable('HighScorePlayer');
    await knex.schema.dropTable('HighScore');
    await knex.schema.dropTable('GameHistoryPlayer');
    await knex.schema.dropTable('GameHistory');
};

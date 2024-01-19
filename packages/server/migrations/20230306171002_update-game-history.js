/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.alterTable('GameHistoryPlayer', async (table) => {
        table.dropColumn('playerIndex');
        table.dropColumn('name');

        table.integer('idUser');

        table.primary(['idGameHistory', 'idGameHistoryPlayer']);
        table.foreign('idUser').references('idUser').inTable('User');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.alterTable('GameHistoryPlayer', async (table) => {
        table.dropForeign('idUser');
        table.dropColumn('idUser');
        table.dropPrimary();

        table.integer('playerIndex').notNullable();
        table.string('name', 40).notNullable();

        table.primary(['idGameHistoryPlayer', 'playerIndex', 'idGameHistory']);
    });
};

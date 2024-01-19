/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('UserAction', (table) => {
        table.increments('idUserAction').notNullable();
        table.integer('idUser').unsigned().notNullable();
        table.string('actionType', 40).notNullable();
        table.dateTime('timestamp').notNullable();

        table.primary(['idUserAction', 'idUser']);
        table.foreign('idUser').references('idUser').inTable('User');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable('UserAction');
};

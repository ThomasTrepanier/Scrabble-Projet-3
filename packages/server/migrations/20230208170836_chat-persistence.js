/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('Channel', (table) => {
        table.increments('idChannel').notNullable().primary();
        table.string('name', 40).notNullable();
        table.boolean('canQuit').notNullable().defaultTo(true);
        table.boolean('private').notNullable().defaultTo(false);
        table.boolean('default').notNullable().defaultTo(false);
    });

    await knex.schema.createTable('UserChannel', (table) => {
        table.integer('idChannel').notNullable();
        table.integer('idUser').notNullable();

        table.primary(['idChannel', 'idUser']);
        table.foreign('idChannel').references('idChannel').inTable('Channel');
        table.foreign('idUser').references('idUser').inTable('User');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable('UserChannel');
    await knex.schema.dropTable('Channel');
};

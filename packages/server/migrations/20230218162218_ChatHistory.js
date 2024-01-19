/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('ChatHistory', (table) => {
        table.increments('idMessage').primary();
        table.string('content', 512).notNullable();
        table.integer('idChannel').unsigned().notNullable();
        table.integer('idUser').unsigned().notNullable();
        table.timestamp('date').defaultTo(knex.fn.now());
        table.foreign('idChannel').references('idChannel').inTable('Channel');
        table.foreign('idUser').references('idUser').inTable('User');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('ChatHistory');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('User', (table) => {
        table.increments('idUser').notNullable().primary();
        table.string('username', 20).notNullable().unique();
        table.string('password', 60).notNullable();
        table.string('email', 40).notNullable().unique();
    });
    
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable('User');
};

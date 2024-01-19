/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.alterTable('UserStatistics', (table) => {
        table.integer('bingoCount').notNullable().defaultTo(0);
        table.double('ratingMax', 5, 1).notNullable().defaultTo(1000);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.alterTable('UserStatistics', (table) => {
        table.dropColumn('bingoCount');
        table.dropColumn('ratingMax');
    });
};

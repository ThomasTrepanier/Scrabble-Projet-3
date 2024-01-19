/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.alterTable('UserStatistics', (table) => {
        table.double('rating', 5, 1).notNullable().defaultTo(1000);
    });

    await knex.schema.alterTable('GameHistoryPlayer', (table) => {
        table.double('ratingVariation', 5, 1).notNullable().defaultTo(0);
        table.boolean('hasAbandoned').notNullable().defaultTo(false);
    });

    await knex.schema.alterTable('GameHistory', (table) => {
        table.dropColumn("hasBeenAbandoned");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.alterTable("UserStatistics", (table) => {
        table.dropColumn("rating");
    });
    await knex.schema.alterTable("GameHistoryPlayer", (table) => {
        table.dropColumn("ratingVariation");
        table.dropColumn("hasAbandoned");
    });

    await knex.schema.alterTable('GameHistory', (table) => {
        table.boolean('hasBeenAbandoned').notNullable().defaultTo(false);
    });
};

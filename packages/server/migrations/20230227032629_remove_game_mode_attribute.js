/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.table('GameHistory', function(table) {
        table.dropColumn('gameMode');
        table.dropColumn('gameType');
      });
      await knex.schema.table('HighScore', function(table) {
        table.dropColumn('gameType');
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.table('GameHistory', function(table) {
        table.string('gameType', 20).notNullable();
        table.string('gameMode', 20).notNullable();
      });
      await knex.schema.table('HighScore', function(table) {
        table.string('gameType', 20).notNullable();
      });
};

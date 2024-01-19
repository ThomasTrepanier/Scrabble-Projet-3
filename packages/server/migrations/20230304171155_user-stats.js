/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('UserStatistics', (table) => {
        table.integer('idUser').primary();
        table.integer('gamesPlayedCount').defaultTo(0);
        table.integer('gamesWonCount').defaultTo(0);
        table.double('averagePointsPerGame', 5, 2).defaultTo(0);
        table.double('averageTimePerGame', 8, 2).defaultTo(0);
        
        table.foreign('idUser').references('idUser').inTable('User');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTable('UserStatistics');
};

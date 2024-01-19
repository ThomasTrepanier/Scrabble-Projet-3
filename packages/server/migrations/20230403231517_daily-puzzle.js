/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('DailyPuzzle', function (table) {
     table.integer('idUser').notNullable();
     table.date('date').notNullable();
     table.integer('score').notNullable();

     table.primary(['idUser', 'date']);
     table.foreign('idUser').references('idUser').inTable('User');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTable('DailyPuzzle');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('Analysis', function(table) {
        table.increments('idAnalysis').primary();
        table.integer('idGameHistory');
        table.integer('idUser');
        table.foreign('idUser').references('idUser').inTable('User');
        table.foreign('idGameHistory').references('idGameHistory').inTable('GameHistory');
      });
      
      await knex.schema.createTable('Placement', function(table) {
          table.increments('idPlacement').primary();
          table.integer('score').notNullable();
          table.string('tilesToPlace').notNullable();
          table.boolean('isHorizontal').notNullable();
          table.integer('row').notNullable();
          table.integer('column').notNullable();
        });

    await knex.schema.createTable('CriticalMoment', function(table) {
        table.increments('idCriticalMoment').primary();
        table.string('tiles').notNullable();
        table.enu('actionType', ['placer', 'échanger', 'passer']).notNullable();
        table.string('board').notNullable();
        table.integer('idPlayedPlacement').unsigned();
        table.integer('idBestPlacement').unsigned();
        table.integer('idAnalysis').unsigned();
        table.foreign('idPlayedPlacement').references('idPlacement').inTable('Placement');
        table.foreign('idBestPlacement').references('idPlacement').inTable('Placement');
        table.foreign('idAnalysis').references('idAnalysis').inTable('Analysis');
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('CriticalMoment');
    await knex.schema.dropTableIfExists('Placement');
    await knex.schema.dropTableIfExists('Analysis');
};

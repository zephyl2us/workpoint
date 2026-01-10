'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterMdbMoviesSchema extends Schema {
  up () {
    this.table('mdb_movies', (table) => {
      table.index('popularity')
      table.index('vote_average')
    })
  }

  down () {
    this.table('mdb_movies', (table) => {
      table.dropIndex('popularity')
      table.dropIndex('vote_average')
    })
  }
}

module.exports = AlterMdbMoviesSchema

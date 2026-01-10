'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterMdbMoviesSchema extends Schema {
  up () {
    this.table('mdb_movies', (table) => {
      // alter table
      table.string('slug', 100).unique().after('imdb_id')
      table.boolean('is_enable').defaultTo(0).index().after('vote_count')
    })
  }

  down () {
    this.table('mdb_movies', (table) => {
      // reverse alternations
      table.dropColumn('slug')
      table.dropColumn('is_enable')
    })
  }
}

module.exports = AlterMdbMoviesSchema

'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MdbMovieCompanySchema extends Schema {
  up () {
    this.create('mdb_movie_companies', (table) => {
      table.increments()
      table.integer('mdb_movie_id').notNullable().unsigned().index()
      table.integer('mdb_company_id').notNullable().unsigned().index()
      table.timestamps()
    })
  }

  down () {
    this.drop('mdb_movie_companies')
  }
}

module.exports = MdbMovieCompanySchema

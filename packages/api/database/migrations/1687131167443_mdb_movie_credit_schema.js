'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MdbMovieCreditSchema extends Schema {
  up () {
    this.create('mdb_movie_credits', (table) => {
      table.increments()
      table.string('ref_id', 30).notNullable().index().unique()
      table.integer('mdb_movie_id').notNullable().unsigned().index()
      table.integer('mdb_person_id').notNullable().unsigned().index()
      table.enu('group', ['cast', 'crew']).notNullable().index()
      table.string('department', 50).notNullable()
      table.string('job', 50).notNullable()
      table.text('character')
      table.integer('order')
      table.timestamps()
    })
  }

  down () {
    this.drop('mdb_movie_credits')
  }
}

module.exports = MdbMovieCreditSchema

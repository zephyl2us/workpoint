'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MdbGenreSchema extends Schema {
  up () {
    this.create('mdb_genres', (table) => {
      table.increments()
      table.integer('ref_id').unsigned().notNullable().index().unique()

      table.string('slug', 100).notNullable().unique().index()
      table.string('name', 100).notNullable()

      table.timestamps()
    })
  }

  down () {
    this.drop('mdb_genres')
  }
}

module.exports = MdbGenreSchema

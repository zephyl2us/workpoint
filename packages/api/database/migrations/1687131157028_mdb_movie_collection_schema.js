'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MdbMovieCollectionSchema extends Schema {
  up () {
    this.create('mdb_movie_collections', (table) => {
      table.increments()
      table.integer('mdb_movie_id').notNullable().unsigned().index()
      table.integer('mdb_collection_id').notNullable().unsigned().index()
      table.timestamps()
    })
  }

  down () {
    this.drop('mdb_movie_collections')
  }
}

module.exports = MdbMovieCollectionSchema

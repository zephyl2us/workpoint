'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MdbMovieGenreSchema extends Schema {
  up () {
    this.create('mdb_movie_genres', (table) => {
      table.increments()
      table.integer('mdb_movie_id').notNullable().unsigned().index()
      table.integer('mdb_genre_id').notNullable().unsigned().index()
      table.timestamps()
    })
  }

  down () {
    this.drop('mdb_movie_genres')
  }
}

module.exports = MdbMovieGenreSchema

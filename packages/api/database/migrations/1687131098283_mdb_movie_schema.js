'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Database = use('Database')

class MdbMovieSchema extends Schema {
  up () {
    this.create('mdb_movies', (table) => {
      table.increments().primary()
      table.integer('ref_id').unsigned().notNullable().index().unique()
      table.string('imdb_id', 20).index()

      table.string('original_title', 100).notNullable()
      table.text('original_overview')
      table.string('original_language', 10)
      table.string('title', 100).notNullable()
      table.text('overview')

      table.integer('budget').unsigned()
      table.integer('revenue').unsigned()
      table.integer('runtime').unsigned()
      table.date('release_date').notNullable()

      table.string('poster_path', 100)
      table.string('backdrop_path', 100)

      table.float('popularity').unsigned()
      table.float('vote_average').unsigned()
      table.integer('vote_count').unsigned()
      
      table.timestamps()
    })

    Database.raw('ALTER TABLE mdb_movies AUTO_INCREMENT = 10000')
  }

  down () {
    this.drop('mdb_movies')
  }
}

module.exports = MdbMovieSchema

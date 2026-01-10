'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MdbMovieVideoSchema extends Schema {
  up () {
    this.create('mdb_movie_videos', (table) => {
      table.increments()
      table.string('ref_id', 30).notNullable().index().unique()
      table.integer('mdb_movie_id').notNullable().unsigned().index()
      table.string('type', 30).notNullable().index()
      table.string('name', 100).notNullable()
      table.string('site', 50).notNullable().index()
      table.string('key', 50).notNullable()
      table.integer('size', 11).unsigned()
      table.enu('lang', ['en', 'th']).notNullable().index()
      table.boolean('official').defaultTo(0).index()
      table.dateTime('published_at').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('mdb_movie_videos')
  }
}

module.exports = MdbMovieVideoSchema
'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MdbMovieMediaSchema extends Schema {
  up () {
    this.create('mdb_movie_medias', (table) => {
      table.increments()
      table.integer('mdb_movie_id').notNullable().unsigned().index()
      table.integer('mdb_source_id').notNullable().unsigned().index()
      table.string('hash', 50).notNullable().index()
      table.enu('resolution', ['4k', 'fhd', 'hd', 'sd']).notNullable()
      table.integer('size', 11).unsigned()
      table.enu('status', ['queuing', 'transcoding', 'completed', 'error']).defaultTo('queuing').notNullable().index()
      table.text('status_info')
      table.dateTime('transcode_at')
      table.dateTime('completed_at')
      table.timestamps()
    })
  }

  down () {
    this.drop('mdb_movie_medias')
  }
}

module.exports = MdbMovieMediaSchema

'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterMdbMovieMediaSchema extends Schema {
  up () {
    this.table('mdb_movie_medias', (table) => {
			table.string('transcode_server', 50).index().after('resolution')
			table.text('transcode_audio').after('transcode_server')
    })
  }

  down () {
    this.table('mdb_movie_medias', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AlterMdbMovieMediaSchema

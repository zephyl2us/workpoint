'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterMdbMovieMediaSchema extends Schema {
  up () {
    this.table('mdb_movie_medias', (table) => {
      table.biginteger('created_user_id').default(null).unsigned().index().after('status_info')
    })
  }

  down () {
    this.table('mdb_movie_medias', (table) => {
      table.dropColumn('created_user_id')
    })
  }
}

module.exports = AlterMdbMovieMediaSchema
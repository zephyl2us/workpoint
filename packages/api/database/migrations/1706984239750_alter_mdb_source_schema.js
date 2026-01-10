'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterMdbSourceSchema extends Schema {
  up () {
    this.table('mdb_sources', (table) => {
      // alter table
			table.text('transcode_audio').after('info')
    })
  }

  down () {
    this.table('mdb_sources', (table) => {
      // reverse alternations
      table.dropColumn('transcode_audio')
    })
  }
}

module.exports = AlterMdbSourceSchema

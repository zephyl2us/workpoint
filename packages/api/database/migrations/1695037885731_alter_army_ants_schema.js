'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterArmyAntsSchema extends Schema {
  up () {
    this.table('army_ants', (table) => {
      // alter table
      table.dropColumn('undetect_id')
      table.dropColumn('type')
    })
  }

  down () {
    this.table('army_ants', (table) => {
      // reverse alternations
      table.string('undetect_id', 32).nullable().unique().after('adspower_id')
      table.enu('type', ['cloud', 'local']).defaultTo('local').index().after('undetect_id')
    })
  }
}

module.exports = AlterArmyAntsSchema

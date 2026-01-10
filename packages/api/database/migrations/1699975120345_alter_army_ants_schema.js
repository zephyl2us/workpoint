'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterArmyAntsSchema extends Schema {
  up () {
    this.table('army_ants', (table) => {
      // alter table
      table.string('gologin_id', 32).nullable().unique().index().after('adspower_id')
    })
  }

  down () {
    this.table('army_ants', (table) => {
      // reverse alternations
      table.dropColumn('gologin_id')
    })
  }
}

module.exports = AlterArmyAntsSchema

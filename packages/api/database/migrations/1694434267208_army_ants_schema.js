'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ArmyAntsSchema extends Schema {
  up () {
    this.table('army_ants', (table) => {
      // alter table
      table.string('facebook_id', 20).unique().after('profile_path')
    })
  }

  down () {
    this.table('army_ants', (table) => {
      // reverse alternations
      table.dropColumn('facebook_id')
    })
  }
}

module.exports = ArmyAntsSchema

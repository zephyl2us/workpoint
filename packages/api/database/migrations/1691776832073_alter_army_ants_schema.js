'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterArmyAntSchema extends Schema {
  up () {
    this.table('army_ants', (table) => {
      table.timestamp('deleted_at').nullable().after('updated_at').index()
    })
  }

  down () {
    this.table('army_ants', (table) => {
      table.dropColumn('deleted_at')
    })
  }
}

module.exports = AlterArmyAntSchema
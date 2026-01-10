'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterArmyAntBotsSchema extends Schema {
  up () {
    this.table('army_ant_bots', (table) => {
      // alter table
      table.string('screenshot', 250).default(null).after('checkpoint')
    })
  }

  down () {
    this.table('army_ant_bots', (table) => {
      // reverse alternations
    table.dropColumn('screenshot')
    })
  }
}

module.exports = AlterArmyAntBotsSchema
'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterArmyAntBotsSchema extends Schema {
  up () {
    this.table('army_ant_bots', (table) => {
      // alter table
      table.dateTime('start_at').after('status')
    })
  }

  down () {
    this.table('army_ant_bots', (table) => {
      // reverse alternations
    table.dropColumn('start_at')
    })
  }
}

module.exports = AlterArmyAntBotsSchema
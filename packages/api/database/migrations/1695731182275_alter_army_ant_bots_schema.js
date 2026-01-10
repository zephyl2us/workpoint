'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterArmyAntBotsSchema extends Schema {
  up () {
    this.table('army_ant_bots', (table) => {
      // alter table
      table.renameColumn('stoped_at', 'stopped_at')
    })
  }

  down () {
    this.table('army_ant_bots', (table) => {
      // reverse alternations
      table.renameColumn('stopped_at', 'stoped_at')
    })
  }
}

module.exports = AlterArmyAntBotsSchema

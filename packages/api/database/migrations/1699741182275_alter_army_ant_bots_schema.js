'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterArmyAntBotsSchema extends Schema {
  up () {
    this.table('army_ant_bots', (table) => {
      // alter table
      table.string('proxy', 100).after('server')
    })
  }

  down () {
    this.table('army_ant_bots', (table) => {
      // reverse alternations
    table.dropColumn('proxy')
    })
  }
}

module.exports = AlterArmyAntBotsSchema
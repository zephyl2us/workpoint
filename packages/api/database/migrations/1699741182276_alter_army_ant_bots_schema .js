'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterArmyAntBotsSchema extends Schema {
  up () {
    this.table('army_ant_bots', (table) => {
      // alter table
      table.integer('army_ant_proxy_id').unsigned().index().after('server')
    })
  }

  down () {
    this.table('army_ant_bots', (table) => {
      // reverse alternations
    table.dropColumn('army_ant_proxy_id')
    })
  }
}

module.exports = AlterArmyAntBotsSchema
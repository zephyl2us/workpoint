'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterArmyAntBotsSchema extends Schema {
  up () {
    this.table('army_ant_bots', (table) => {
      // alter table
      table.enu('checkpoint', ['google', 'facebook', 'tiktok', 'instagram', 'twitter', 'threads', 'line']).default(null).index().after('status')
    })
  }

  down () {
    this.table('army_ant_bots', (table) => {
      // reverse alternations
    table.dropColumn('checkpoint')
    })
  }
}

module.exports = AlterArmyAntBotsSchema
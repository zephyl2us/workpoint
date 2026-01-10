'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ArmyAntProxySchema extends Schema {
  up () {
    this.create('army_ant_proxies', (table) => {
      table.increments()
      table.integer('aircard_label').notNullable().unsigned().unique()
			table.string('server', 50).index()
      table.string('ip', 50).index()
      table.integer('port').index()
      table.string('public_ipv4', 50).index()
      table.text('payload')
      table.dateTime('available_at')
      table.boolean('is_enable').defaultTo(0).index()
      table.timestamps()
    })
  }

  down () {
    this.drop('army_ant_proxies')
  }
}

module.exports = ArmyAntProxySchema

'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ArmyAntPowerSchema extends Schema {
  up () {
    this.create('army_ant_powers', (table) => {
      table.increments()
      table.integer('army_ant_id').notNullable().unsigned().index()
      table.date('date').notNullable().index()
			table.string('server', 50).index()
      table.enu('social', ['automation', 'google', 'facebook', 'tiktok', 'instagram', 'twitter', 'threads', 'line']).notNullable().index()
      table.text('payload')
      table.enu('status', ['ready', 'running', 'stopped']).default('ready').index()
      table.dateTime('end_at')
      table.timestamps()
    })
  }

  down () {
    this.drop('army_ant_powers')
  }
}

module.exports = ArmyAntPowerSchema

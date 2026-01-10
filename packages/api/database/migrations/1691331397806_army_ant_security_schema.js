'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ArmyAntSecuritySchema extends Schema {
  up () {
    this.create('army_ant_securities', (table) => {
      table.increments()
      table.integer('army_ant_id').notNullable().unsigned().index()
      table.enu('social', ['google', 'facebook', 'tiktok', 'instagram', 'twitter', 'threads', 'line']).notNullable().index()
      table.string('hash').notNullable()
      table.enu('status', ['active', 'deleted']).default('active').index()
      table.integer('created_user_id').default(null).unsigned()
      table.timestamps()
    })
  }

  down () {
    this.drop('army_ant_securities')
  }
}

module.exports = ArmyAntSecuritySchema

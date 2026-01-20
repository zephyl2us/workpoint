'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CampaignSchema extends Schema {
  up () {
    this.create('campaigns', (table) => {
      table.increments()

      table.string('name', 100).notNullable()
      
      table.integer('total_user').unsigned()
      table.integer('total_answered').unsigned()
      table.integer('total_no_answer').unsigned()
      table.integer('total_rejected').unsigned()
      table.integer('total_unreachable').unsigned()
      table.integer('total_register').unsigned()
      table.integer('total_login').unsigned()
      
      table.text('payload')

      table.timestamps()
    })
  }

  down () {
    this.drop('campaigns')
  }
}

module.exports = CampaignSchema

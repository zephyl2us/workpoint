'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CampaignUserLogSchema extends Schema {
  up () {
    this.create('campaign_user_logs', (table) => {
      table.increments()
      table.integer('campaign_user_id').notNullable().unsigned().index()
      table.text('payload')
      table.string('ip', 50)
      table.integer('actor_user_id').default(null).unsigned().index()
      table.timestamps()
    })
  }

  down () {
    this.drop('campaign_user_logs')
  }
}

module.exports = CampaignUserLogSchema

'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CampaignUserSchema extends Schema {
  up () {
    this.create('campaign_users', (table) => {
      table.increments()
      table.integer('campaign_id').unsigned().notNullable().index()
      table.string('first_name', 255).nullable()
      table.string('last_name', 255).nullable()
      table.string('mobile', 20).nullable().index()

      table.enum('status', ['waiting', 'calling', 'answered', 'no_answer', 'rejected', 'unreachable']).defaultTo('waiting').index()

      table.integer('send_sms_count').unsigned().nullable()
      
      table.tinyint('is_register')
      table.tinyint('is_login')

      table.text('payload')
      
      table.integer('actor_user_id').default(null).unsigned().index()
      table.timestamps()
    })
  }

  down () {
    this.drop('campaign_users')
  }
}

module.exports = CampaignUserSchema

'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserLoginLogSchema extends Schema {
  up () {
    this.create('user_login_logs', (table) => {
      table.increments()
      table.integer('user_id').notNullable().unsigned().index()
			table.string('host', 50).index()
      table.string('ip', 50)
      table.text('agent', 254)
      table.timestamp('created_at').defaultTo(this.fn.now())
    })
  }

  down () {
    this.drop('user_login_logs')
  }
}

module.exports = UserLoginLogSchema

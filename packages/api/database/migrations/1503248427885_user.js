'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up() {
    this.create('users', (table) => {
      table.bigIncrements()
      table.string('uid', 40).index()

      table.string('username', 30).notNullable().unique()
      table.string('password', 60).notNullable()
      table.enu('group', ['god', 'admin', 'member']).default('member').index()
      table.string('display_name', 80).notNullable()

      table.enum('status', ['active', 'suspended']).defaultTo('active')

      table.integer('login_count').unsigned()
      table.datetime('last_login_at')
      table.string('last_login_ip', 50)
      table.text('last_login_agent', 254)

      table.integer('created_user_id').default(null).unsigned()
      table.timestamps()
      table.integer('deleted_user_id').default(null).unsigned()
      table.datetime('deleted_at').nullable()
    })
  }

  down() {
    this.drop('users')
  }
}

module.exports = UserSchema

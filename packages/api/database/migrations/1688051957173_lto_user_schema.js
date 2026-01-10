'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LtoUserSchema extends Schema {
  up () {
    this.create('lto_users', (table) => {
      table.increments()
      table.bigInteger('lto_user_id').notNullable().unique().index()
      table.string('username').notNullable().unique()
      table.string('name').notNullable()
      table.string('email')
      table.string('mobile')
      table.bigInteger('advisor_id').unsigned()
      table.string('advisor_token').notNullable()
      table.string('jwt_token').notNullable()
      table.boolean('enabled').default(1)
      table.timestamps()
    })
  }

  down () {
    this.drop('lto_users')
  }
}

module.exports = LtoUserSchema

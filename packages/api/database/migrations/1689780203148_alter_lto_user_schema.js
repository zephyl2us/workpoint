'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterLtoUserSchema extends Schema {
  up () {
    this.table('lto_users', (table) => {
      table.string('password').notNullable().after('username')
    })
  }

  down () {
    this.drop('alter_lto_users')
  }
}

module.exports = AlterLtoUserSchema

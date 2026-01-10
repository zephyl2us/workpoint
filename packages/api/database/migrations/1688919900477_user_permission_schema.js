'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserPermissionSchema extends Schema {
  up () {
    this.create('user_permissions', (table) => {
      table.increments()
      table.integer('user_id').notNullable().unsigned().index()
      table.enu('group', ['god', 'admin', 'member']).default('member').index()
      table.text('payload')
      table.timestamps()
    })
  }

  down () {
    this.drop('user_permissions')
  }
}

module.exports = UserPermissionSchema

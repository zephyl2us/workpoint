'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterUserSchema extends Schema {
  up () {
    this.table('users', (table) => {
      table.enu('app', ['core', 'huay_scanner']).notNullable().after('uid').index()
    })
  }

  down () {
    this.table('users', (table) => {
      table.dropColumn('app')
    })
  }
}

module.exports = AlterUserSchema

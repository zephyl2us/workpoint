'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterArmyAntsSchema extends Schema {
  up () {
    this.table('army_ants', (table) => {
      table.enu('type', ['bot', 'user']).defaultTo('bot').index().after('gologin_id')
      table.boolean('gmail_status').defaultTo(0).index().after('profile_path')
      table.boolean('deploy').defaultTo(0).index().after('created_user_id')
    })
  }

  down () {
    this.table('army_ants', (table) => {
      table.dropColumn('type')
      table.dropColumn('gmail_status')
      table.dropColumn('deploy')
    })
  }
}

module.exports = AlterArmyAntsSchema

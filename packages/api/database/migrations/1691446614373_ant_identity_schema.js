'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AntIdentitySchema extends Schema {
  up () {
    this.create('ant_identities', (table) => {
      table.increments()
      table.string('name', 50).notNullable()
      table.string('name_en', 50)
      table.enu('type', ['firstname', 'lastname', 'nickname']).notNullable()
      table.enu('gender', ['male', 'female'])
      table.timestamps()
    })
  }

  down () {
    this.drop('ant_identities')
  }
}

module.exports = AntIdentitySchema

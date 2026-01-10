'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TambonSchema extends Schema {
  up () {
    this.create('tambons', (table) => {
      table.increments('id').primary()
      table.integer('district_id').notNullable()
      table.string('name', 50).notNullable()
      table.string('name_en', 50).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('tambons')
  }
}

module.exports = TambonSchema

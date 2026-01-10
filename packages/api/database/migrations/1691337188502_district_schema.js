'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DistrictSchema extends Schema {
  up () {
    this.create('districts', (table) => {
      table.increments('id').primary()
      table.integer('province_id').notNullable()
      table.string('name', 50).notNullable()
      table.string('name_en', 50).notNullable()
      table.integer('postal_code').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('districts')
  }
}

module.exports = DistrictSchema

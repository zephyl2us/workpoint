'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProvinceSchema extends Schema {
  up () {
    this.create('provinces', (table) => {
      table.increments('id').primary()
      table.string('name', 50).notNullable()
      table.string('name_en', 50).notNullable()
      table.string('area', 30)
      table.timestamps()
    })
  }

  down () {
    this.drop('provinces')
  }
}

module.exports = ProvinceSchema

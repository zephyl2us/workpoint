'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class HoroscopeSchema extends Schema {
  up () {
    this.create('horoscopes', (table) => {
      table.increments()
      table.string('name', 50).notNullable().unique().index()
      table.integer('primary_number').unsigned()
      table.integer('secondary_number').unsigned()
      table.string('lucky_number')
      table.timestamps()
    })
  }

  down () {
    this.drop('horoscopes')
  }
}

module.exports = HoroscopeSchema

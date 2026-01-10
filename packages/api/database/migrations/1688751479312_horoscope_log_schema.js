'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class HoroscopeLogSchema extends Schema {
  up () {
    this.create('horoscope_logs', (table) => {
      table.increments()
      table.string('type', 20).notNullable()
      table.string('log', 50).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('horoscope_logs')
  }
}

module.exports = HoroscopeLogSchema

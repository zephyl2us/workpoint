'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class HoroscopeTagSchema extends Schema {
  up () {
    this.create('horoscope_tags', (table) => {
      table.increments()
      table.integer('horoscope_id').unsigned().notNullable()
      table.string('tag', 20).notNullable()

      table.unique(['horoscope_id', 'tag'])
      table.timestamps()
    })
  }

  down () {
    this.drop('horoscope_tags')
  }
}

module.exports = HoroscopeTagSchema

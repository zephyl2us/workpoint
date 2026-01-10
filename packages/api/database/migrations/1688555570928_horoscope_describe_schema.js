'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class HoroscopeDescribeSchema extends Schema {
  up () {
    this.create('horoscope_describes', (table) => {
      table.increments()
      table.integer('horoscope_id').unsigned().notNullable()
      table.enu('type', ['describe', 'predict']).notNullable()
      table.text('detail').notNullable()
      table.integer('order').unsigned()

      table.unique(['horoscope_id', 'type', 'order'])
      table.timestamps()
    })
  }

  down () {
    this.drop('horoscope_describes')
  }
}

module.exports = HoroscopeDescribeSchema

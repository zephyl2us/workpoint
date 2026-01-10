'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LotteryCategorySchema extends Schema {
  up () {
    this.create('lottery_categories', (table) => {
      table.increments('id').primary()
      table.string('slug', 20).unique().notNullable()
      table.string('zone', 20).notNullable().index()
      table.enu('type', ['government', 'stock', 'yeekee']).notNullable().index()
      table.integer('total_round').defaultTo(null).unsigned()
      table.tinyint('pre_start').notNullable().unsigned()
      table.string('start_time', 10).notNullable()
      table.text('available_day')
      table.text('special_day')
      table.text('holiday')
      table.tinyint('end_delay').notNullable().unsigned()
      table.string('end_time', 10).notNullable()
      table.tinyint('result_delay')
      table.string('result_time', 10)
      table.boolean('is_enable').defaultTo(0).index()
      table.timestamps()
    })
  }

  down () {
    this.drop('lottery_categories')
  }
}

module.exports = LotteryCategorySchema

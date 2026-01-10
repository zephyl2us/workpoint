'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ExampleLotterySchema extends Schema {
  up () {
    this.create('example_lotteries', (table) => {
      table.increments()
      table.integer('lottery_category_id').notNullable().unsigned().index()
      
      table.string('slug', 20).notNullable().index()
      table.enu('type', ['government', 'stock', 'yeekee']).notNullable().index()
      table.date('date').notNullable().index()
      table.text('result')
      table.string('hash', 32).nullable().unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('example_lotteries')
  }
}

module.exports = ExampleLotterySchema

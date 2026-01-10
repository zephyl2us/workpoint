'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LotteryStockResultSchema extends Schema {
  up () {
    this.create('lottery_stock_results', (table) => {
      table.increments('id').primary()
      table.integer('lottery_id').notNullable().unsigned().index()
      table.integer('lottery_category_id').notNullable().unsigned().index()
      
      table.string('slug', 20).notNullable().index()
      table.date('date').notNullable().index()
      table.string('zone', 30).notNullable().index()
      table.text('result')
      table.timestamps()
    })
  }

  down () {
    this.drop('lottery_stock_results')
  }
}

module.exports = LotteryStockResultSchema
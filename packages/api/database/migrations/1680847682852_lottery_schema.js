'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LotterySchema extends Schema {
  up () {
    this.create('lotteries', (table) => {
      table.increments('id').primary()
      table.integer('lottery_category_id').notNullable().unsigned().index()
      
      table.string('slug', 20).notNullable().index()
      table.enu('type', ['government', 'stock', 'yeekee']).notNullable().index()
      table.date('date').notNullable().index()
      table.integer('round').unsigned()
      table.text('result')
      table.dateTime('start_at').notNullable()
      table.dateTime('end_at').notNullable()
      table.dateTime('result_at')
      table.enu('status', ['open', 'finished']).defaultTo('open').notNullable().index()
      table.string('hash', 32).nullable().unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('lotteries')
  }
}

module.exports = LotterySchema

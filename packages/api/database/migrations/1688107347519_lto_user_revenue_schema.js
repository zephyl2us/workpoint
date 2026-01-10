'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LtoUserRevenueSchema extends Schema {
  up () {
    this.create('lto_user_revenues', (table) => {
      table.increments()
      table.bigInteger('lto_user_id').notNullable().unsigned()
      table.date('date')
      table.integer('incoming_member')
      table.decimal('amount', 15, 2)
      table.unique(['lto_user_id', 'date'])
      table.timestamps()
    })
  }

  down () {
    this.drop('lto_user_revenues')
  }
}

module.exports = LtoUserRevenueSchema

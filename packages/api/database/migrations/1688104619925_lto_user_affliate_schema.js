'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LtoUserAffliateSchema extends Schema {
  up () {
    this.create('lto_user_affliates', (table) => {
      table.increments()
      table.bigInteger('lto_user_id').notNullable().unsigned()
      table.bigInteger('downline_count')
      table.bigInteger('downline_bet_all')
      table.decimal('total_revenue', 15, 2)
      table.decimal('current_revenue', 15, 2)
      table.timestamps()
    })
  }

  down () {
    this.drop('lto_user_affliates')
  }
}

module.exports = LtoUserAffliateSchema

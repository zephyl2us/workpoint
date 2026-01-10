'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LotteryZoneRatesSchema extends Schema {
  up () {
    this.create('lottery_zone_rates', (table) => {
      table.increments()
      table.string('zone', 20).notNullable().index()
      table.text('payload')
      table.timestamps()
    })
  }

  down () {
    this.drop('lottery_zone_rates')
  }
}

module.exports = LotteryZoneRatesSchema

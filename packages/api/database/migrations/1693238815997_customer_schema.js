'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CustomerSchema extends Schema {
  up () {
    this.create('customers', (table) => {
      table.increments()
      table.string('first_name', 50)
      table.string('last_name', 50)
      table.string('phone', 10).index().unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('customers')
  }
}

module.exports = CustomerSchema

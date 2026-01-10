'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MdbCompanySchema extends Schema {
  up () {
    this.create('mdb_companies', (table) => {
      table.increments()
      table.integer('ref_id').unsigned().notNullable().index().unique()

      table.string('name', 100).notNullable()
      table.string('headquarters')
      table.string('origin_country', 10)
      table.string('homepage', 100)

      table.string('logo_path', 100)
      
      table.timestamps()
    })
  }

  down () {
    this.drop('mdb_companies')
  }
}

module.exports = MdbCompanySchema

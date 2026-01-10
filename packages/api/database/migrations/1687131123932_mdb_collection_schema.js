'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MdbCollectionSchema extends Schema {
  up () {
    this.create('mdb_collections', (table) => {
      table.increments()
      table.integer('ref_id').unsigned().notNullable().index().unique()

      table.string('original_name', 100).notNullable()
      table.string('name', 100)
      
      table.string('poster_path', 100)
      table.string('backdrop_path', 100)

      table.text('parts')

      table.timestamps()
    })
  }

  down () {
    this.drop('mdb_collections')
  }
}

module.exports = MdbCollectionSchema

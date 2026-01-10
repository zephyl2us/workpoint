'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MdbPersonSchema extends Schema {
  up () {
    this.create('mdb_people', (table) => {
      table.increments()
      table.integer('ref_id').unsigned().notNullable().index().unique()
      table.string('imdb_id', 20).index()
      
      table.string('original_name', 100).notNullable()
      table.string('name', 100)
      table.enu('gender', ['male', 'female', 'other']).notNullable()
      table.date('birthday')
      table.string('place_of_birth')
      table.date('deathday')

      table.text('original_biography')
      table.text('biography')

      table.string('profile_path', 100)

      table.float('popularity').unsigned()
      
      table.timestamps()
    })
  }

  down () {
    this.drop('mdb_people')
  }
}

module.exports = MdbPersonSchema

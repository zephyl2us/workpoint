'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MdbSourceSchema extends Schema {
  up () {
    this.create('mdb_sources', (table) => {
      table.increments()
      table.integer('mdb_movie_id').unsigned().unique().index()
      table.string('hash', 50).notNullable().unique().index()
      table.string('name', 150).notNullable()
      table.string('name_en', 100).notNullable()
      table.string('name_th', 100)
      table.integer('year', 5).unsigned()
      table.enu('resolution', ['720p', '1080p', '2160p'])
      table.string('file', 255).notNullable()
      table.string('path', 255).notNullable()
      table.integer('size', 11).unsigned()
      table.text('info')
      table.timestamps()
    })
  }

  down () {
    this.drop('mdb_sources')
  }
}

module.exports = MdbSourceSchema

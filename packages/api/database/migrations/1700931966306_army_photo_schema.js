'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ArmyPhotoSchema extends Schema {
  up () {
    this.create('army_photos', (table) => {
      table.increments()
      table.integer('army_ant_id').default(null).unsigned().index()
      table.integer('age_range')
      table.string('source_url', 255).default(null)
      table.enu('gender', ['male', 'female', 'other']).defaultTo('other')
      table.text('payload')
      table.biginteger('created_user_id').default(null).unsigned().index()
      table.timestamps()
    })
  }

  down () {
    this.drop('army_photos')
  }
}

module.exports = ArmyPhotoSchema

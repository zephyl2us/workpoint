'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ArmyPhotoSchema extends Schema {
  up () {
    this.table('army_photos', (table) => {
      table.timestamp('deleted_at').nullable().after('updated_at').index()
    })
  }

  down () {
    this.table('army_photos', (table) => {
      table.dropColumn('deleted_at')
    })
  }
}

module.exports = ArmyPhotoSchema
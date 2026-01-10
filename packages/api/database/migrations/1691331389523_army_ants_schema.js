'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ArmyAntSchema extends Schema {
  up () {
    this.create('army_ants', (table) => {
      table.increments()

      table.string('ref_id', 10).index().unique()
      table.string('email', 100).notNullable().unique()

      table.string('national_id', 20).notNullable()

      table.string('first_name', 50).notNullable()
      table.string('last_name', 50).notNullable()
      table.string('nickname', 20)
      table.string('first_name_en', 50).notNullable()
      table.string('last_name_en', 50).notNullable()
      table.string('nickname_en', 20)

      table.enu('gender', ['male', 'female', 'other']).defaultTo('other')
      table.date('birthday').notNullable()

      table.string('phone', 20)

      table.string('address', 100)
      table.integer('tambon_id')
      table.integer('district_id')
      table.integer('province_id')

      table.string('profile_path', 100)
      
      table.biginteger('created_user_id').default(null).unsigned().index()
      table.timestamps()
    })
  }

  down () {
    this.drop('army_ants')
  }
}

module.exports = ArmyAntSchema

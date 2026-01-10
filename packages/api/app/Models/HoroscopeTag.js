'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class HoroscopeTag extends Model {

  static get hidden() {
    return [
      'id',
      'horoscope_id',
      'created_at',
      'updated_at'
    ]
  }

  word() {
    return this.belongsTo('App/Models/Horoscope', 'horoscope_id', 'id')
  }
}

module.exports = HoroscopeTag

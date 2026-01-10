'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Horoscope extends Model {

  static get hidden() {
    return [
      'id',
      'created_at',
      'updated_at'
    ]
  }

  describe() {
    return this.hasMany('App/Models/HoroscopeDescribe', 'id', 'horoscope_id')
  }

  tag() {
    return this.hasMany('App/Models/HoroscopeTag', 'id', 'horoscope_id')
  }
}

module.exports = Horoscope

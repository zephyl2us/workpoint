'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Province extends Model {
  static get hidden() {
    return ['created_at', 'updated_at']
  }

  district() {
    return this.hasMany('App/Models/District', 'id', 'province_id')
  }
}

module.exports = Province

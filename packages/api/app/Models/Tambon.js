'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Tambon extends Model {

  static get hidden() {
    return ['created_at', 'updated_at']
  }

  district() {
    return this.belongsTo('App/Models/District', 'district_id', 'id')
  }
}

module.exports = Tambon

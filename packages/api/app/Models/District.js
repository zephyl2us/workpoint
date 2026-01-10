'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class District extends Model {

  static get hidden() {
    return ['created_at', 'updated_at']
  }

  province() {
    return this.belongsTo('App/Models/Province', 'province_id', 'id')
  }

  tambon() {
    return this.hasMany('App/Models/Tambon', 'id', 'district_id')
  }
}

module.exports = District

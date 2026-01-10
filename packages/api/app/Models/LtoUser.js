'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class LtoUser extends Model {
  static get hidden() {
    return [
      'enabled',
      'created_at',
      'updated_at'
    ]
  }

  affliate() {
    return this.hasMany('App/Models/LtoUserAffliate', 'lto_user_id', 'lto_user_id')
  }

  revenue() {
    return this.hasMany('App/Models/LtoUserRevenue', 'lto_user_id', 'lto_user_id')
  }
}

module.exports = LtoUser

'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserLoginLog extends Model {
  // Disable updated_at
  static get updatedAtColumn () {
    return null
  }
}

module.exports = UserLoginLog

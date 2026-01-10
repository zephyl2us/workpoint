'use strict'

const BaseAuthProvider = require('@adonisjs/auth/providers/AuthProvider')

class AuthProvider extends BaseAuthProvider {

	/**
   * Register auth provider under `Adonis/Src/Auth` namespace
   *
   * @method _registerAuth
   *
   * @return {void}
   *
   * @private
   */
  _registerAuth () {
    this.app.bind('Adonis/Src/Auth', () => require('./src/Auth'))
  }
	/**
   * Register auth manager under `Adonis/Src/Auth` namespace
   *
   * @method _registerAuthManager
   *
   * @return {void}
   *
   * @private
   */
	_registerAuthManager () {
    this.app.manager('Adonis/Src/Auth', require('./src/Auth/Manager'))
  }

}

module.exports = AuthProvider

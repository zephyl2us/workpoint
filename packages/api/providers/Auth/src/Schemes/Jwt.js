'use strict'

const CE = require('@adonisjs/auth/src/Exceptions')
const BaseJwt = require('@adonisjs/auth/src/Schemes/Jwt')

class Jwt extends BaseJwt {
	constructor (Cache, Encryption) {
    super()
		this.Cache = Cache
    this.Encryption = Encryption
  }

  /**
   * IoC container injections
   *
   * @attribute inject
   * @static
   * @ignore
   *
   * @type {Array}
   */
	static get inject () {
    return [
			'Adonis/Addons/Cache',
			'Adonis/Src/Encryption'
		]
  }

	/**
   * Check if user is authenticated for the current HTTP request or not. This
   * method will read the token from the `Authorization` header or fallbacks
   * to the `token` input field.
   *
   * Consider user as successfully authenticated, if this
   * method doesn't throws an exception.
   *
   * @method check
   * @async
   *
   * @return {Boolean}
   *
   * @example
   * ```js
   * try {
   *   await auth.check()
   * } catch (error) {
   *   // invalid jwt token
   * }
   * ```
   */
	 async check () {
    if (this.user) {
      return true
    }

    const token = this.getAuthHeader()

    /**
     * Verify jwt token and wrap exception inside custom
     * exception classes
     */
    try {
      this.jwtPayload = await this._verifyToken(token)
    } catch ({ name, message }) {
      if (name === 'TokenExpiredError') {
        throw CE.ExpiredJwtToken.invoke()
      }
      throw CE.InvalidJwtToken.invoke(message)
    }

		const uid = this.jwtPayload.uid

		/**
		 * Improve cache by Tee++;
		 */
		const userModel = this._serializerInstance._Model
		this.user = await this.Cache.model(userModel, `core_auth_jwt_token:${uid}`, 5, async () => {
    	return await this._serializerInstance.findById(uid)
		})

		// this.user = await this._serializerInstance.findById(uid)

    /**
     * Throw exception when user is not found
     */
    if (!this.user) {
      throw CE.InvalidJwtToken.invoke()
    }

    return true
  }

}

module.exports = Jwt

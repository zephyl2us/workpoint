'use strict'

const CE = require('@adonisjs/auth/src/Exceptions')
const BaseApi = require('@adonisjs/auth/src/Schemes/Api')

class Api extends BaseApi {
	constructor (Token, Cache, Encryption) {
    super()
		this.Token = Token
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
			'App/Models/Token',
			'Adonis/Addons/Cache',
			'Adonis/Src/Encryption'
		]
  }

	/**
   * Validates the API token by reading it from the request
   * header or using `token` input field as the fallback.
   *
   * Consider user as successfully authenticated, if this
   * method doesn't throws an exception.
   *
   * @method check
   * @async
   *
   * @return {void}
   *
   * @throws {InvalidApiToken} If token is missing or is invalid
   *
   * @example
   * ```js
   * try {
   *   await auth.check()
   * } catch (error) {
   *   // Invalid token
   * }
   * ```
   */
	async check () {
    /**
     * User already exists for this request, so there is
     * no need to re-pull them from the database
     */
    if (this.user) {
      return true
    }

    const token = this.getAuthHeader(['bearer', 'token'])
    if (!token) {
      throw CE.InvalidApiToken.invoke()
    }

    /**
     * Decrypting the token before querying
     * the db.
     */
    const plainToken = this.Encryption.decrypt(token)

		/**
		 * Improve cache by Tee++;
		 */
		const UserModel = this._serializerInstance._Model
		this.user = await this.Cache.model(UserModel, `core_auth_api_token:${plainToken}`, 10, async () => {
			const tokenRecord = await this.Token.findBy('token', plainToken)
			if (!tokenRecord) {
				return null
			}
			return await UserModel.find(tokenRecord.user_id)
		})

		// console.log('query')
    // this.user = await this._serializerInstance.findByToken(plainToken, 'api_token')

    /**
     * Throw exception when user is not found
     */
    if (!this.user) {
      throw CE.InvalidApiToken.invoke()
    }

    return true
  }
}

module.exports = Api

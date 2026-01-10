'use strict'

const Redis = use('Redis')
const Helper = use('App/Helper')

class TokenOutdate {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ auth, request, response }, next) {
		const authorization = request.header('authorization')
		// console.log('authorization')
		if (authorization && !Helper.isDevMode()) {
    // if (authorization) {
			// Check redis that this token is already logout.
      const requestToken = authorization.split(' ')[1]
      const redisConnection = Redis.connection('session')

			// console.log('xxxxx')

			// This code for check the request token is latest or not,
			// if not we denies to access
			try {
				const currentKeepToken = `current_token:${auth.user.id}`
				const isSame = await redisConnection.get(currentKeepToken)

				// console.log(requestToken)
				// console.log('-------')
				// console.log(isSame)

				if (requestToken !== isSame) {
					return response.badRequest({
						status: 'error',
						message: 'Token is not latest login',
						code: 'login.outdate'
					})
				}
			} catch (e) {
				// cannot find user.id
			}
		}

    await next()
  }
}

module.exports = TokenOutdate

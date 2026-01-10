'use strict'

const Redis = use('Redis')

class Security {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ auth, response, session }, next) {
		const authUser = auth.user

		// const authPending = session.get(`auth-pending-${authUser.id}`)
		const redisSession = Redis.connection('session')
		const authPending = await redisSession.get(`auth:pending:${authUser.id}`)

		if (authUser.security && authPending) {
			return response.badRequest({
				status: 'error',
				action: '2factorRequired',
				message: '2 Factor required to unlock'
			})
		}

    await next()
  }
}

module.exports = Security

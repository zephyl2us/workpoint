'use strict'

const Redis = use('Redis')
const Helper = use('App/Helper')

class AppInit {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ auth, request, response }, next) {
		// Allow load balance to check
		if (request.match(['/healthcheck'])) {
			await next()
			return
		}

		const ip = request.header('cf-connecting-ip') || request.ip()
    request.clientIp = ip

    await next()
  }
}

module.exports = AppInit

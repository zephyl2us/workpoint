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

		// const ip = request.header('cf-connecting-ip') || request.ip()
    // request.clientIp = ip

    const cfIp = request.header('cf-connecting-ip')
    const xff = request.header('x-forwarded-for')
    const realIp = request.header('x-real-ip')

    const ipFromXff = xff ? String(xff).split(',')[0].trim() : null
    const ip = cfIp || ipFromXff || realIp || request.ip()
    request.clientIp = ip

    await next()
  }
}

module.exports = AppInit

'use strict'

const _ = use('lodash')
const Helper = use('App/Helper')
const BaseExceptionHandler = use('BaseExceptionHandler')
const LogRepository = make('App/Repositories/LogRepository')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  async handle(error, { request, response }) {
    if (error.name === 'ModelNotFoundException') {
      return response.notFound({
        status: 'error',
        message: 'Cannot find database row'
      })
		}

		// console.log(error.name, '-----')
		if (error.name === 'TooManyRequests') {
			return response.badRequest({
        status: 'error',
				message: 'Throttle request blocked',
				code: 'too_many_requests'
      })
		}

		const ignores = [
			/^\.returning\(\) is not supported by mysql and will not have any effect\./,
			/^Cannot find module \'Service\/Nuxt\'/,
			/^E_INVALID_JWT_TOKEN: invalid signature/,
			/^E_INVALID_JWT_TOKEN: jwt must be provided/,
			/^E_JWT_TOKEN_EXPIRED: The jwt token has been expired. Generate a new one to continue/,
			/^E_INVALID_API_TOKEN: The api token is missing or invalid/
		]

		const isIgnore = ignores.some(rx => rx.test(error.message))
		if (!isIgnore) {
			if (Helper.isDevMode()) {
				console.log(error)
			} else {
				const data = {
					title: 'ServerError',
					path: 'App/Execptions/Handler',
					channel: 'server',
					message: error.message,
					data: {
						err: error.stack,
						inn: 'production'
					}
				}
				LogRepository.fire(data)
			}
		}

    response.status(error.status).send(error.message)
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  async report(error, { request }) {
  }
}

module.exports = ExceptionHandler

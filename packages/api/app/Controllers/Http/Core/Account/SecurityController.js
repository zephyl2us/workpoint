'use strict'

const _ = use('lodash')
const moment = use('moment')
const Hash = use('Hash')
const Config = use('Config')

class IndexController {

	static get inject() {
		return [
      'App/Repositories/AuthenticationRepository',
			'App/Repositories/UserRepository',
		]
	}

	constructor(AuthenticationRepository, UserRepository) {
    this.AuthenticationRepository = AuthenticationRepository
    this.UserRepository = UserRepository

    this.apps = Config.get('appAuth.apps')
	}

  async changePassword ({ request, response, params, auth }) {

    const app = params.app

    // if(!_.includes(this.apps, app)) {
    //   return response.status(401).json({
    //     message: 'authentication.failed',
    //   })
    // }

		const authUser = auth.user
		const userId = authUser.id

    const user = await this.UserRepository.findBy('id', userId)

		const oldPassword = request.input('old_password')
		const password = request.input('password')

    const isValidPassword = await Hash.verify(oldPassword, user.password)
    if (!isValidPassword) {
      return response.badRequest({
        code: 'account.invalid_password',
        message: 'Invalid Password'
      })
    }

    if (_.eq(oldPassword, password)) {
      return response.badRequest({
        code: 'account.password_is_same_old',
        message: 'Password is same the old password'
      })
    }

		const props = request.only([])

		if (password) {
			_.assign(props, { password: password })
		}

    // console.log(props)

		const updated = await this.UserRepository.update(user, props)

		return response.ok({
			status: 'success',
			code: 'password_changed',
			// user: updated
		})
  }
}

module.exports = IndexController

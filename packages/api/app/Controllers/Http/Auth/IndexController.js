'use strict'

const _ = use('lodash')
const moment = use('moment')
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

  async login ({ request, response, params, auth }) {

    const app = params.app

    if(!_.includes(this.apps, app)) {
      return response.status(401).json({
        message: 'authentication.failed',
      })
    }

    let username = request.input('username')
    username += `@${app}`
    const password = request.input('password')

    let token = null
    try {
      token = await auth.attempt(username, password)
    } catch (e) {
      return response.status(401).json({
        message: 'authentication.failed',
        // ...e
      })
    }

    // console.log(token)

    const user = await this.UserRepository.findBy('username', username)

		const ip = request.header('cf-connecting-ip') || request.ip()
    let host = request.header('Origin')
    host = _.replace(host, 'https://', '')
    host = _.replace(host, 'http://', '')
    const userAgent = request.header('User-Agent')

    // const loginCount = _.get(user, 'login_count') || 0

    user.login_count = user.login_count + 1
    user.login_host = host
    user.last_login_ip = ip
    user.last_login_at = moment().format('YYYY-MM-DD HH:mm:ss')
    user.last_login_agent = userAgent
    await user.save()

    const sessionToken = await this.AuthenticationRepository.register(app, user)

    const userLoginLog = this.UserRepository.loginLog({
      user_id: user.id,
      host: host,
      ip: ip,
      agent: userAgent
    })

    return response.ok({
      session_token: sessionToken,
      ...token
    })
  }

	async logout ({ request, response, auth }) {
		// console.log('logout')
		return response.ok('logout')
	}

  async me ({ request, response, auth }) {
    let user = await auth.getUser()

		// console.log(user)

    if (!user) {
      return response.badRequest({
        code: 'auth.no_user',
        message: 'Cannot find user'
      })
    }

    const permission = await this.UserRepository.permission(user)

    user = _.assign(user, {
      permission: permission
    })

    return response.ok({
      user: user
    })
  }
}

module.exports = IndexController

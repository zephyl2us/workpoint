'use strict'

const _ = use('lodash')
const moment = use('moment')
const Config = use('Config')

class IndexController {

	static get inject() {
		return [
      'App/Repositories/AuthenticationRepository',
			'App/Repositories/UserRepository',
			'App/Repositories/SmsRepository',
		]
	}

	constructor(AuthenticationRepository, UserRepository, SmsRepository) {
    this.AuthenticationRepository = AuthenticationRepository
    this.UserRepository = UserRepository
    this.SmsRepository = SmsRepository

    this.apps = Config.get('appAuth.apps')
	}

  async requestOtp ({ request, response, params, auth }) {
    const app = params.app

    if(!_.includes(this.apps, app) || _.eq(app, 'core')) {
      // console.log(app)
      return response.badRequest({
        code: 'auth.registration_failed',
        message: 'Registration Failed'
      })
    }

    const phone = request.input('phone')
    const username = `${phone}@${app}`
    const user = await this.UserRepository.findBy('username', username)

    if(user) {
      return response.badRequest({
        code: 'auth.user_already_exists',
        message: 'Registration Failed'
      })
    }

    const otp = await this.SmsRepository.otpRequest(request, app, phone)

    const data = _.pick(otp, ['ref', 'expired_at'])

    return response.ok({
      ...data,
      status: 'otp_request'
    })
  }

  async verifyOtp ({ request, response, params, auth }) {
    const app = params.app

    if(!_.includes(this.apps, app) || _.eq(app, 'core')) {
      return response.badRequest({
        code: 'auth.registration_failed',
        message: 'Registration Failed'
      })
    }

    const phone = request.input('phone')
    const code = request.input('code')

    const otp = await this.SmsRepository.otpActivate(phone, code)

    if(!otp) {
      return response.badRequest({
        code: 'auth.invalid_otp',
        message: 'Invalid Otp'
      })
    }

    const data = _.pick(otp, ['expired_at'])

    return response.ok({
      ...data,
      status: 'verified'
    })
  }

  async register ({ request, response, params, auth }) {
    const app = params.app

    const phone = request.input('phone')
    const code = request.input('code')

    const validate = await this.SmsRepository.otpValidate(phone, code)

    if(validate === false) {
      return response.status(400).json({
        message: 'registration.invalid_otp',
      })
    }

    const username = `${phone}@${app}`
    const password = request.input('password')

    const props = {
      display_name: phone,
      username,
      password,
      phone,
      group: 'member',
      app: app
    }

		const user = await this.UserRepository.create(props)

    if(!user) {
      return response.badRequest({
        code: 'auth.registration_failed',
        message: 'Registration Failed'
      })
    }

		return response.ok({
			status: 'registered',
			code: 'user_created',
			record: user,
		})
  }

  async login ({ request, response, params, auth }) {

    const app = params.app

    if(!_.includes(this.apps, app)) {
      return response.status(401).json({
        message: 'authentication.failed',
      })
    }

    const phone = request.input('phone')
    const username = `${phone}@${app}`
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

    return response.ok({
      user: user
    })
  }


  async forgotRequestOtp ({ request, response, params, auth }) {
    const app = params.app

    if(!_.includes(this.apps, app) || _.eq(app, 'core')) {
      // console.log(app)
      return response.badRequest({
        code: 'auth.forgot_failed',
        message: 'Forgot Failed'
      })
    }

    const phone = request.input('phone')
    const username = `${phone}@${app}`
    const user = await this.UserRepository.findBy('username', username)

    console.log(username, user)

    if(!user) {
      return response.badRequest({
        code: 'auth.user_notfound',
        message: 'User not found'
      })
    }

    const otp = await this.SmsRepository.otpRequest(request, app, phone)

    const data = _.pick(otp, ['ref', 'expired_at'])

    return response.ok({
      ...data,
      status: 'otp_request'
    })
  }

  // async forgotVerifyOtp ({ request, response, params, auth }) {
  //   const app = params.app

  //   if(!_.includes(this.apps, app) || _.eq(app, 'core')) {
  //     return response.badRequest({
  //       code: 'auth.forgot_failed',
  //       message: 'Forgot Failed'
  //     })
  //   }

  //   const phone = request.input('phone')
  //   const code = request.input('code')

  //   const otp = await this.SmsRepository.otpActivate(phone, code)

  //   if(!otp) {
  //     return response.badRequest({
  //       code: 'auth.invalid_otp',
  //       message: 'Invalid Otp'
  //     })
  //   }

  //   const data = _.pick(otp, ['expired_at'])

  //   return response.ok({
  //     ...data,
  //     status: 'verified'
  //   })
  // }

  async forgotResetPassword ({ request, response, params, auth }) {
    const app = params.app

    const phone = request.input('phone')
    const code = request.input('code')

    const validate = await this.SmsRepository.otpValidate(phone, code)

    if(validate === false) {
      return response.status(400).json({
        message: 'registration.invalid_otp',
      })
    }

    const username = `${phone}@${app}`
    const password = request.input('password')
    const user = await this.UserRepository.findBy('username', username)

    if(!user) {
      return response.badRequest({
        code: 'auth.user_notfound',
        message: 'User not found'
      })
    }

    const props = {
      password: password
    }

		const updated = await this.UserRepository.update(user, props)

		return response.ok({
			status: 'forgoted',
			code: 'auth.user_forgoted',
			user: updated
		})

  }
}

module.exports = IndexController

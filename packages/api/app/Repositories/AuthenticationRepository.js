'use strict'

const _ = use('lodash')
const moment = use('moment')
const md5 = use('md5')
// const Cache = use('Cache')
const Redis = use('Redis')
const Config = use('Config')
// const Event = use('Event')
const Helper = use('App/Helper')
const Database = use('Database')
const Pusher = use('Pusher')
// const LogRepository = make('App/Repositories/LogRepository')

class AuthenticationRepository {

  static get inject() {
    return []
  }

  constructor() {
    this.Redis = Redis.connection('session')
  }

  async register (app, user) {
    const userId = user.id
    const token = this.token(user)
    const userCacheKey = `token:${app}:${userId}`
		const tokenCacheKey = `${userCacheKey}:${token}`

    const appConfig = Config.get(`appAuth.app.${app}`)

    const sessionExpire = (_.get(appConfig, `sessionExpire`) * 60)
    const singleSession = !!_.get(appConfig, `single`, true)

    if(singleSession) {
      const dataKeys = await this.Redis.keys(`mega:${userCacheKey}:*`)
  
      if (dataKeys.length > 0) {
        const pipeline = this.Redis.pipeline()
        for (let index = 0; index < dataKeys.length; index++) {
          let key = dataKeys[index]
          key = _.replace(key, /^mega:/, '')
          // console.log(key)
          pipeline.del(key)
        }
        await pipeline.exec()
      }
    }

		const userCached = JSON.stringify(user)

    await this.Redis.set(tokenCacheKey, userCached)
    await this.Redis.expire(tokenCacheKey, sessionExpire)
    
    return token
  }

  async check (app, user, token) {
    const userId = user.id
    const cacheKey = `token:${app}:${userId}:${token}`
    const appConfig = Config.get(`appAuth.app.${app}`)
    const sessionExpire = (_.get(appConfig, `sessionExpire`) * 60)

    const cached = await this.Redis.get(cacheKey)

    if(!cached) {
      return false
    }

    await this.Redis.expire(cacheKey, sessionExpire)

    return true
  }

  token (user) {
    const userId = user.id
    const tokenString = `${userId}_${moment().unix()}`
    const tokenEncrypt = md5(tokenString)

    // console.log(tokenString, tokenEncrypt)

    const tokens = _.split(tokenEncrypt, '')

    tokens.splice(24, 0, '-')
    tokens.splice(16, 0, '-')
    tokens.splice(8, 0, '-')
  
    const token = _.join(tokens, '')

    return token
  }
}

module.exports = AuthenticationRepository

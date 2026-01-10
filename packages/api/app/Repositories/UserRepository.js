'use strict'

const _ = use('lodash')
const Config = use('Config')
const Redis = use('Redis')
const Event = use('Event')
const Hash = use('Hash')
const Helper = use('App/Helper')
const Cache = use('Cache')

class UserRepository {

  static get inject() {
    return [
      'App/Models/User',
      'App/Models/UserLoginLog',
      'App/Models/UserPermission',
    ]
  }

  constructor(User, UserLoginLog, UserPermission) {
    this.User = User
    this.UserLoginLog = UserLoginLog
    this.UserPermission = UserPermission
		this.Redis = Redis.connection('user')

    this.cachePermissionDuration = 60
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('User', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

  async find(id) {
    return await Cache.model(this.User, `user:${id}`, 60, async () => {
      return await this.User.find(id)
    })
  }

  async findOrFail(id) {
    return await Cache.model(this.User, `user:${id}`, 60, async () => {
      return await this.User.findOrFail(id)
    })
  }

  async findBy(field, value) {
    return await this.User.findBy(field, value)
  }

  async findByUsername(username) {
    return this.findBy('username', username)
  }

  async findByOrFail(field, value) {
    return await this.User.findByOrFail(field, value)
  }

  async create(data) {
    let user = new this.User()

    if(_.has(data, 'password')) {
      data.password = await Hash.make(data.password)
    }
    
    user = _.assign(user, _.pick(data, [
      'app',
      'display_name',
      'username',
      'password',
      'group',
    ]))

    if(await user.save()) {
      return user
    }
    return false
  }

  async update(user, data) {
    if(_.has(data, 'password')) {
      data.password = await Hash.make(data.password)
    }

    user = _.assign(user, _.pick(data, [
      'password'
    ]))
    
    if (await user.save()) {
      return user
    }

    return false
  }

  async loginLog (data) {
    const user = await this.UserLoginLog.create(data)

    return user
  }

  // async update(user, data) {
  //   user.merge(data)
  //   await user.save()
  //   await Cache.forget(`user:${user.id}`)

  //   // await Cache.forget(`core_auth_api_token:${user.id}`)
  //   // await Cache.forget(`core_auth_jwt_token:${user.id}`)

  //   Event.fire('user::updated', user)
  //   return user
  // }

  // async delete(user) {
  //   await user.delete()
  //   await Cache.forget(`user:${user.id}`)

  //   // await Cache.forget(`core_auth_api_token:${user.id}`)
  //   // await Cache.forget(`core_auth_jwt_token:${user.id}`)

  //   Event.fire('user::deleted', user)
  //   return user
  // }


  // async register(data) {
  //   const user = await this.create(data)
  //   Event.fire('user::registered', user)
  //   return user
  // }

  async permission (user) {
    const id = user.id
		const cacheKey = `permission:${id}`
		let cached = await this.Redis.get(cacheKey)

    // console.log('cached', cached)

		if (!cached) {
      const group = user.group
      const role = _.eq('god', group) ? 'admin' : group
      const defaultPermission = this.renderPermission(Config.get(`acl.${role}`), group)
      // console.log('defaultPermission', defaultPermission)

      let userPermission = await this.findPermission(id)
      if(!userPermission) {
        userPermission = await this.createPermission({
          user_id: id,
          group: group,
          payload: defaultPermission
        })
      }
      const payload = JSON.parse(userPermission.payload)

      userPermission = _.merge({}, defaultPermission, payload)

			cached = JSON.stringify(userPermission)
      await this.Redis.set(cacheKey, cached)
      await this.Redis.expire(cacheKey, this.cachePermissionDuration)
    }

		const result = JSON.parse(cached)
    // console.log(result)
    return result
  }

  async findPermission (userId) {
		return await this.UserPermission.findBy('user_id', userId)
  }

  async createPermission (data) {
    let userPermission = new this.UserPermission()

    userPermission = _.assign(userPermission, _.pick(data, [
      'user_id',
      'group',
      'payload',
    ]))

    if(await userPermission.save()) {
      return userPermission
    }
    return false
  }
  async updatePermission (user, data) {
    const id = user.id

    const group = user.group
    const role = _.eq('god', group) ? 'admin' : group
    const defaultPermission = this.renderPermission(Config.get(`acl.${role}`), group)

    let userPermission = await this.findPermission(id)

    // const payload = _.merge({}, defaultPermission, data)
    const payload = this.customMerge(defaultPermission, data)
    
    userPermission.payload = payload

    if (await userPermission.save()) {
      const cacheKey = `permission:${id}`
      let cached = await this.Redis.del(cacheKey)
      return userPermission
    }

    return false
  }

  renderPermission (data, group) {
    let result = _.cloneDeep(data)
    _.each(result, (permission, i) => {
      _.each(permission, (permissions, j) => {
        _.each(permissions, (value, key) => {
          result[i][j][key] = !!(value === 1 || _.eq('god', group))
        })
      })
    })
    return result
  }
  
  // merge function by chatGPT 4.0
  customMerge(mainData, newData) {
    function helper(main, newData) {
      for (let key in newData) {
        if (newData.hasOwnProperty(key)) {
          if (main.hasOwnProperty(key)) {
            if (typeof newData[key] === 'object' && !Array.isArray(newData[key])) {
              helper(main[key], newData[key])
            } else {
              main[key] = newData[key]
            }
          }
        }
      }
    }
  
    let cloneMainData = _.cloneDeep(mainData)
    helper(cloneMainData, newData)
  
    return cloneMainData
  }
}

module.exports = UserRepository

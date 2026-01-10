'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')

class LtobetUserRepository {

  static get inject() {
    return [
      'App/Models/LtoUser',
    ]
  }

  constructor(LtoUser) {
    this.LtoUser = LtoUser
  }

  async createOrUpdate(data) {
    const userData = _.pick(data, [
      'lto_user_id',
      'username',
      'name',
      'email',
      'mobile',
      'advisor_id',
      'advisor_token',
      'jwt_token'
    ])

    let user = await this.findBy('lto_user_id', userData.lto_user_id)
    if(!user) return await this.LtoUser.create(userData)

    user.merge(userData)

    if(await user.save()) return user
    return false
  }

  async findBy(key, value) {
    return await this.LtoUser.findBy(key, value)
  }

  async find(id) {
    return await this.LtoUser.find(id)
  }

  browse(filters = {}) {

    let query = this.LtoUser.query()

    if (_.result(filters, 'select')) {
      query.select(filters.select)
    }

    if (_.result(filters, 'lto_user_id')) {
      query.where('lto_user_id', filters.lto_user_id)
    }

    if (_.result(filters, 'advisor_id')) {
      query.where('advisor_id', filters.advisor_id)
    }

    if (_.result(filters, 'jwt_token')) {
      query.where('jwt_token', filters.jwt_token)
    }

    return query
  }

}

module.exports = LtobetUserRepository

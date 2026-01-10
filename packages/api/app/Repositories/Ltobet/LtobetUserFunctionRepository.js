'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')
const Redis = use('Redis')

class LtobetUserFunctionRepository {

  static get inject() {
    return [
      'App/Repositories/Ltobet/LtobetUserRequestRepository',
      'App/Repositories/Ltobet/LtobetUserRepository',
      'App/Repositories/Ltobet/LtobetUserAffliateRepository',
      'App/Repositories/Ltobet/LtobetUserRevenueRepository',
    ]
  }

  constructor(LtobetUserRequestRepository, LtobetUserRepository, LtobetUserAffliateRepository, LtobetUserRevenueRepository) {
    this.LtobetUserRequestRepository = LtobetUserRequestRepository
    this.LtobetUserRepository = LtobetUserRepository
    this.LtobetUserAffliateRepository = LtobetUserAffliateRepository
    this.LtobetUserRevenueRepository = LtobetUserRevenueRepository
  }

  async dashboard() {
    let users = await this.LtobetUserRepository
      .browse()
      .with('affliate')
      .with('revenue')
      .fetch()
    
    users = users.toJSON()
    return users
  }

  async ltoUserLogin(username, password) {
    return await this.LtobetUserRequestRepository.ltoUserLogin(username, password)
  }

  async userRevenue(ltobetUserId) {
    const filters = {
      id : ltobetUserId
    }

    let user = await this.LtobetUserRepository
      .browse(filters)
      .with('revenue')
      .fetch()

    user = user.toJSON()
    return user
  }

  async userAffliate(ltobetUserId) {
    const filters = {
      id : ltobetUserId
    }

    let user = await this.LtobetUserRepository
      .browse(filters)
      .with('revenue')
      .fetch()

    user = user.toJSON()
    return user
  }

  async userDownline(ltobetUserId) {
    let user = await this.LtobetUserRepository.find(ltobetUserId)
    user = user.toJSON()

    if(!user) return false

    const filters = {
      advisor_id: user.lto_user_id
    }

    let downlines = await this.LtobetUserRepository
      .browse(filters)
      .with('affliate')
      .fetch()

    downlines = downlines.toJSON()

    _.assign(user, {
      downline: downlines
    })

    return user
  }

}

module.exports = LtobetUserFunctionRepository

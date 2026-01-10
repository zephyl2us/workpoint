'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')

class LtobetUserAffliateRepository {

  static get inject() {
    return [
      'App/Models/LtoUserAffliate',
    ]
  }

  constructor(LtoUserAffliate) {
    this.LtoUserAffliate = LtoUserAffliate
  }

  async createOrUpdate(data) {
    const affliateData = _.pick(data, [
      'lto_user_id',
      'downline_count',
      'downline_bet_all',
      'total_revenue',
      'current_revenue'
    ])

    let userAffliate = await this.findBy('lto_user_id', affliateData.lto_user_id)
    if(!userAffliate) return await this.LtoUserAffliate.create(affliateData)

    userAffliate.merge(affliateData)

    if(await userAffliate.save()) return userAffliate
    return false
  }

  async findBy(key, value) {
    return await this.LtoUserAffliate.findBy(key, value)
  }

}

module.exports = LtobetUserAffliateRepository

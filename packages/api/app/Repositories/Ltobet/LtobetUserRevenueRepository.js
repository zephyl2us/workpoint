'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')
const Redis = use('Redis')

class LtobetUserRevenueRepository {

  static get inject() {
    return [
      'App/Models/LtoUserRevenue',
    ]
  }

  constructor(LtoUserRevenue) {
    this.LtoUserRevenue = LtoUserRevenue
  }

  async createOrUpdate(data) {
    const revenueData = _.pick(data, [
      'lto_user_id',
      'date',
      'incoming_member',
      'amount'
    ])
    
    const cacheData = {
      revenue: _.get(data, 'total_revenue'),
      incoming_member: _.get(data, 'incoming_member')
    }

    const cacheKey = `ltobet:user:${revenueData.lto_user_id}:revenue:${revenueData.date}`

    const filters = {
      date: revenueData.date,
      lto_user_id: revenueData.lto_user_id
    }

    let revenue = await this.browse(filters).first()
    if(!revenue) {
      revenue =  await this.LtoUserRevenue.create(revenueData)
      await Redis.set(cacheKey, JSON.stringify(cacheData), 'EX', 24 * 60 * 60) // hour * minute * second // 'EX' option takes a number in seconds // 'PX' to specify the expiration time in Milliseconds.
      return revenue
    }

    revenue.merge(revenueData)
    if(await revenue.save()) {
      await Redis.set(cacheKey, JSON.stringify(cacheData), 'EX', 24 * 60 * 60) // hour * minute * second // 'EX' option takes a number in seconds // 'PX' to specify the expiration time in Milliseconds.
      return revenue
    }
    return false
  }

  browse(filters) {
    let query = this.LtoUserRevenue.query()

    if (_.result(filters, 'select')) {
      query.select(filters.select)
    }

    if (_.result(filters, 'date')) {
      query.where('date', filters.date)
    }

    if (_.result(filters, 'lto_user_id')) {
      query.where('lto_user_id', filters.lto_user_id)
    }

    return query
  }

}

module.exports = LtobetUserRevenueRepository

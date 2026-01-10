'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')

class HoroscopeDescribeRepository {

  static get inject() {
    return [
      'App/Models/HoroscopeDescribe',
    ]
  }

  constructor(HoroscopeDescribe) {
    this.HoroscopeDescribe = HoroscopeDescribe
  }

  browse(filters = {}) {

    let query = this.HoroscopeDescribe.query()

    if (_.result(filters, 'select')) {
      query.select(filters.select)
    }

    if (_.result(filters, 'horoscope_id')) {
      query.where('horoscope_id', filters.horoscope_id)
    }

    if (_.result(filters, 'type')) {
      query.where('type', filters.type)
    }

    if (_.result(filters, 'detail')) {
      query.where('detail', filters.detail)
    }

    if (_.result(filters, 'order')) {
      query.where('order', filters.order)
    }

    return query
  }

  async findBy(key, value) {
    return await this.HoroscopeDescribe.findBy(key, value)
  }

  async createOrUpdate(data) {
    const describeData = _.pick(data, [
      'horoscope_id',
      'type',
      'detail',
      'order'
    ])

    const filters = {
      horoscope_id: describeData.horoscope_id,
      type: describeData.type,
      order: describeData.order
    }

    let describe = await this.browse(filters).first()
    if(!describe) return await this.HoroscopeDescribe.create(describeData)

    describe.merge(describeData)

    if(await describe.save()) return describe
    return false
  }
}

module.exports = HoroscopeDescribeRepository

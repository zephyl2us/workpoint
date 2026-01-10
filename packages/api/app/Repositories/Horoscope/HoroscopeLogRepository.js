'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')

class HoroscopeLogRepository {

  static get inject() {
    return [
      'App/Models/HoroscopeLog',
    ]
  }

  constructor(HoroscopeLog) {
    this.HoroscopeLog = HoroscopeLog
  }

  async create(data) {
    const describeData = _.pick(data, [
      'type',
      'log'
    ])

    return await this.HoroscopeLog.create(describeData)
  }

  async findBy(key, value) {
    return await this.HoroscopeLog.findBy(key, value)
  }

  browse(filters = {}) {

    let query = this.HoroscopeLog.query()

    if (_.result(filters, 'select')) {
      query.select(filters.select)
    }

    if (_.result(filters, 'type')) {
      query.where('type', filters.type)
    }

    return query
  }

}

module.exports = HoroscopeLogRepository

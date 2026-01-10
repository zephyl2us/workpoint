'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')

class HoroscopeLogController {

  static get inject() {
    return [
      'App/Repositories/Horoscope/HoroscopeLogRepository',
    ]
  }

  constructor(HoroscopeLogRepository) {
    this.HoroscopeLogRepository = HoroscopeLogRepository
  }
  
  async index({ request, response }) {
    const { page, type } = request.all()
    const filters = {
      type: type
    }

    const logs = await this.HoroscopeLogRepository.browse(filters).paginate(page)
    const records = _.get(logs.toJSON(), 'data')

    return response.status(200).json({
      records: records,
      pagination: Helper.pager(logs)
    })

  }
}

module.exports = HoroscopeLogController

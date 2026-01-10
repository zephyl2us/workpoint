'use strict'

const _ = use('lodash')
const moment = use('moment')
const md5 = use('md5')
const Config = use('Config')
const Helper = use('App/Helper')

class LotteryZoneController {
  static get inject() {
    return [
      'App/Repositories/LotteryZoneRateRepository',
    ]
  }

  constructor(LotteryZoneRateRepository) {
    this.LotteryZoneRateRepository = LotteryZoneRateRepository
  }
  

  async rates ({request, params, response}) {
    let rates = await this.LotteryZoneRateRepository.rates()

    return {
      records: rates
    }
  }
}

module.exports = LotteryZoneController
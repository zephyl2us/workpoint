'use strict'

const { config } = require("aws-sdk")

const _ = use('lodash')
const moment = use('moment')
const md5 = use('md5')
const Config = use('Config')
const Helper = use('App/Helper')

class LotteryController {
  static get inject() {
    return [
      'App/Repositories/LotteryRepository',
      'App/Repositories/LotteryCategoryRepository',
    ]
  }

  constructor(LotteryRepository, LotteryCategoryRepository) {
    this.LotteryRepository = LotteryRepository
    this.LotteryCategoryRepository = LotteryCategoryRepository
  }
  
  async stock ({request, params, response}) {
    const date = params.date

    let lotteries = await this.LotteryRepository.getStockByDate(date)

    return {
      records: this.optimizeData(lotteries)
    }
  }

  async yeekee ({request, params, response}) {
    const zone = params.zone
    const slug = params.slug
    const date = params.date

    // console.log('yeekeeSlug')

    let lotteries = await this.LotteryRepository.getYeekeeByDate(date, {
      zone: zone,
      slug: slug,
      has_result: true
    })

    return {
      records: this.optimizeData(lotteries)
    }
  }

  optimizeData (data) {
    const records = []
    // const records = {}

    _.each(data, (record) => {
      const type = _.get(record, 'type')
      const slug = _.get(record, 'slug')
      const round = _.get(record, 'round')
      const status = _.get(record, 'status')

      if(!_.eq(status, 'finished')) {
        return
      }

      let key = null
      if(_.eq(type, 'yeekee')) {
        key = `${slug}_${round}`
      } else {
        key = `${slug}`
      }

      record = _.pick(record, ['slug', 'round', 'result', 'result_at'])

      records.push(record)
      // _.set(records, key, record)
    })

    return records
  }
}

module.exports = LotteryController
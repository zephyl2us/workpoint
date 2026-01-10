'use strict'

const _ = use('lodash')
const moment = use('moment')
const md5 = use('md5')
const Helper = use('App/Helper')

class LotteryController {
  static get inject() {
    return [
      'App/Repositories/LotteryRepository',
      'App/Repositories/LotteryZoneRateRepository',
      'App/Repositories/LotteryCategoryRepository',
    ]
  }

  constructor(LotteryRepository, LotteryZoneRateRepository, LotteryCategoryRepository) {
    this.LotteryRepository = LotteryRepository
    this.LotteryZoneRateRepository = LotteryZoneRateRepository
    this.LotteryCategoryRepository = LotteryCategoryRepository
  }

  async stock ({request, params, response}) {
    const date = request.input('date')

    // console.log('stock')

    let lotteries = await this.LotteryRepository.getStockByDate(date)

    return {
      records: lotteries
    }
  }

  async yeekee ({request, params, response}) {
    // const zone = params.zone
    const date = request.input('date')

    // console.log('yeekeeZone')

    let lotteries = await this.LotteryRepository.getYeekeeByDate(date, {
      // zone: zone
      result_count: 1
    })

    return {
      records: lotteries
    }
  }

  async yeekeeZone ({request, params, response}) {
    const zone = params.zone
    const date = request.input('date')

    // console.log('yeekeeZone')

    let lotteries = await this.LotteryRepository.getYeekeeByDate(date, {
      zone: zone,
      result_count: 5
    })

    return {
      records: lotteries
    }
  }

  async yeekeeSlug ({request, params, response}) {
    const zone = params.zone
    const slug = params.slug
    const date = request.input('date')

    // console.log('yeekeeSlug')

    let lotteries = await this.LotteryRepository.getYeekeeByDate(date, {
      zone: zone,
      slug: slug
    })

    return {
      records: lotteries
    }
  }

  async zoneRate ({request, params, response}) {
    // console.log(params)
    const zone = params.zone

    // console.log('yeekeeSlug')

    let rates = await this.LotteryZoneRateRepository.getRate(zone)
    // console.log(rates)

    if(rates === false) {
      return response.status(404).json({
        message: 'request.error'
      })
    }

    return {
      records: rates
    }
  }

  async updateZoneRate ({request, params, response}) {
    const zone = params.zone
    let rates = request.input('rates')

    let zoneRate = await this.LotteryZoneRateRepository.findBy('zone', zone)

    if(!_.get(zoneRate, 'id')) {
      return response.status(400).json({
        message: 'query.not_found'
      })
    }

    const filter = {}
    let categories = await this.LotteryCategoryRepository.browse({ filter }).fetch()
    categories = categories.toJSON()

    const slugs = _.uniq(_.map(categories, (category) => category.slug))
    // console.log(slugs)

    let payload = {}
    _.each(rates, (rate, slug) => {
      if(_.includes(slugs, slug)) {
        const data = {
          three_top: parseInt(_.get(rate, 'three_top')),
          two_top: parseInt(_.get(rate, 'two_top')),
          two_under: parseInt(_.get(rate, 'two_under'))
        }

        _.set(payload, `${slug}`, _.pick(rate, 'three_top', 'two_under'))
      }
    })

    const updated = await this.LotteryZoneRateRepository.update(zoneRate, {
      payload: rates
    })
    
    if(!updated) {
      return response.status(400).json({
        code: 'nothing_update',
        message: 'Nothing Update'
      })
    }

		return response.ok({
			status: 'success',
			code: 'lottery_zone_rate_updated',
			record: updated
		})
  }
}

module.exports = LotteryController
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
  
  async category ({ guard, auth, request, params, response }) {
    const filter = {
      is_enable: true
    }
    const sort = 'id|asc'

    let categories = await this.LotteryCategoryRepository.browse({ 
      filter,
      sort,
      options: { db: 'read' }
    }).fetch()

    categories = categories.toJSON()

    _.each(categories, (category, key) => {
      category = _.pick(category, ['id', 'type', 'zone', 'slug', 'available_day', 'result_time', 'total_round', 'is_enable'])
      categories[key] = category
    })
    // console.log(categories)

    let zones = Config.get('mobile.huayscanner.zones')
    zones = _.pickBy(zones, (zone, key) => {
      return zone.name && zone.login
    })

    _.each(zones, (zone, key) => {
      // zone = _.pick(zone, ['name', 'sub', 'register', 'login'])
      const keys = ['name', 'sub']

      if(Config.get('mobile.huayscanner.register_button')) {
        keys.push('register')
      }

      if(Config.get('mobile.huayscanner.login_button')) {
        keys.push('login')
      }

      zone = _.pick(zone, keys)
      zones[key] = zone
    })

    // zones = _.map

    // Development : If not admin disable some data.

    const lineOaAccount = Config.get('mobile.huayscanner.line_oa_account')
    const config = {
      line_oa_account: lineOaAccount
    }

    const data = {
      records: categories,
      zones: zones,
      config: config,
    }

    return response.ok(data)
  }

  async government ({request, params, response}) {
    let lotteries = await this.LotteryRepository.getLotteryLasted('government')

    return {
      records: lotteries
    }
  }

  async governmentSlug ({request, params, response}) {
    const slug = params.slug

    let lotteries = await this.LotteryRepository.getLotteryBySlug('government', slug)

    return {
      records: lotteries
    }
  }

  async stock ({request, params, response}) {
    let lotteries = await this.LotteryRepository.getLotteryLasted('stock')

    return {
      records: lotteries
    }
  }

  async stockSlug ({request, params, response}) {
    const slug = params.slug

    let lotteries = await this.LotteryRepository.getLotteryBySlug('stock', slug)

    return {
      records: lotteries
    }
  }

  async yeekeeZone ({request, params, response}) {
    const zone = params.zone
    const date = moment().subtract(6, 'hours').format('YYYY-MM-DD')
    
    // console.log('yeekeeZone')

    let lotteries = await this.LotteryRepository.getYeekeeByDate(date, {
      zone: zone
    })

    return {
      records: lotteries
    }
  }

  async yeekeeSlug ({request, params, response}) {
    const zone = params.zone
    const slug = params.slug
    const date = moment().subtract(6, 'hours').format('YYYY-MM-DD')

    // console.log('yeekeeSlug')

    let lotteries = await this.LotteryRepository.getYeekeeByDate(date, {
      zone: zone,
      slug: slug
    })

    return {
      records: lotteries
    }
  }
}

module.exports = LotteryController
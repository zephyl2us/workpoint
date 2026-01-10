'use strict'

const _ = use('lodash')
const moment = use('moment')
const Redis = use('Redis')
const Helper = use('App/Helper')
const Database = use('Database')
// const LogRepository = make('App/Repositories/LogRepository')

class LotteryZoneRateRepository {

  static get inject() {
    return [
      'App/Models/LotteryZoneRate',
      // 'App/Models/LotteryCategory',
      'App/Repositories/LotteryCategoryRepository',
    ]
  }

  constructor(LotteryZoneRate, LotteryCategoryRepository) {
    this.LotteryZoneRate = LotteryZoneRate
    this.LotteryCategoryRepository = LotteryCategoryRepository
    this.Redis = Redis.connection('lottery')
    
    this.cacheDuration = 60
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('LotteryZoneRate', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
		return await Cache.model(this.LotteryZoneRate, `lottery_zone:${id}`, 60, async () => {
			return await this.LotteryZoneRate.find(id)
		})
	}

	async findBy(field, value) {
		return await this.LotteryZoneRate.findBy(field, value)
	}

  // async create(data) {
  //   const lottery = await this.Lottery.create(data)
  //   return lottery
  // }

  async create(data) {
    let zoneRate = new this.LotteryZoneRate()

    data = _.assign(data, {
      status: 'queuing'
    })

    zoneRate = _.assign(zoneRate, _.pick(data, [
      'zone',
      'payload'
    ]))

    if(await zoneRate.save()) {
      return zoneRate
    }
    return false
  }

  async update(zoneRate, data) {
    zoneRate = _.assign(zoneRate, _.pick(data, [
      'payload'
    ]))
    
    if (await zoneRate.save()) {
      zoneRate.payload = parseInt(zoneRate.payload)
      return zoneRate
    }

    return false
  }

  async rates () {
		const cacheKey = `lottery_zone:rates`
		let currentCached = await this.Redis.get(cacheKey)

		if (!currentCached) {
			let results = await this.LotteryZoneRate.query().fetch()
			results = results.toJSON()

      results = JSON.stringify(results)

      await this.Redis.set(cacheKey, results)
      await this.Redis.expire(cacheKey, 60)
      currentCached = results
    }

    const rates = JSON.parse(currentCached)
    return rates
  }

  async getRate (zone) {
    let zoneRate = await this.findBy('zone', zone)

    if(!_.get(zoneRate, 'id')) {
      const filter = {
        type: 'yeekee',
        zone: zone
      }
      // console.log(filter)
      const category = await this.LotteryCategoryRepository.browse({ filter }).first()

      // console.log(category)

      if(!_.get(category, 'id')) {
        return false
      }

      zoneRate = await this.create({
        zone: zone,
        payload: {}
      })
    }

    let rates = _.get(zoneRate, 'payload')
    rates = JSON.parse(rates)

    return rates
  }
}

module.exports = LotteryZoneRateRepository

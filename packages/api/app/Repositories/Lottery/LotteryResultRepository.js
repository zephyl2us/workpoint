'use strict'

const _ = use('lodash')
const moment = use('moment')
const md5 = use('md5')
const Redis = use('Redis')
const Helper = use('App/Helper')

class LotteryResultRepository {

  static get inject() {
    return [
      'App/Models/LotteryStockResult',
      'App/Repositories/LotteryRepository',
      'App/Repositories/LotteryCategoryRepository',
    ]
  }

  constructor(LotteryStockResult, LotteryRepository, LotteryCategoryRepository) {
    this.LotteryStockResult = LotteryStockResult
    this.LotteryRepository = LotteryRepository
    this.LotteryCategoryRepository = LotteryCategoryRepository

    this.autoResultSlugs = ['yeekee_15', 'yeekee_10', 'yeekee_5']

    this.stockResultCompare = 2

    this.RedisTemp = Redis.connection('temp')
  }

  async scheduler () {
    if(Helper.isDevMode()) console.log('Scheduler : Lottery Result every 1 Minute')

    const date = moment().subtract(5, 'hours').format('YYYY-MM-DD')

    const filter = {
      type: 'yeekee'
    }
    let lotteries = await this.LotteryRepository.browse({ filter: filter })
    .where('date', date)
    .where('result_at', '<=', moment().format('YYYY-MM-DD HH:mm:ss'))
    .where('status', 'open')
    .whereIn('slug', this.autoResultSlugs)
    .orderBy('result_at', 'asc')
    .fetch()

    lotteries = lotteries.toJSON()

    for(let i = 0; i < _.size(lotteries); i++) {
      const lottery = lotteries[i]
      const lotteryId = lottery.id

      // Development
      await this.yeekeeResultByLotteryId(lotteryId)
      // console.log(lottery.date, lottery.type, lottery.slug)
    }

    // console.log(lotteries)
  }

  async yeekeeResultByLotteryId (id) {
    let lottery = await this.LotteryRepository.findBy('id', id)
    const status = _.get(lottery, 'status')

    if(!_.eq(status, 'open')) {
      return false
    }

    // Development: Random Result
		const lottoResult = Helper.randomNumber(5)

		const threeTop = lottoResult.slice(-3)
		const twoTop = threeTop.slice(-2)
		const twoUnder = lottoResult.substring(0, 2)
    let result = {
      three_top: threeTop,
      two_top: twoTop,
      two_under: twoUnder
    }

    // console.log(lottery, result)

    // console.log('------------------------------')
    // console.log(`Lottery: #${lottery.id}${_.eq(lottery.type, 'yeekee') ? `:${lottery.round}` : ''} [${lottery.type}:${lottery.slug}]`,)
    // console.log(result)
    
    const data = {
      result: result,
      status: 'processing',
      process_start_at: moment().format('YYYY-MM-DD HH:mm:ss')
    }

    return await this.LotteryRepository.update(lottery, data)
  }

  async createStockResult (data) {
    const lotteryStockResult = await this.LotteryStockResult.create(data)
    return lotteryStockResult
  }

  async getStockResultByLotteryId (id) {
    const results = this.LotteryStockResult.query()
                .where('lottery_id', id)
                .fetch()

    return results
  }

  async getStockResultByLotteryIds (ids) {
    const results = this.LotteryStockResult.query()
                .whereIn('lottery_id', ids)
                .fetch()

    return results
  }

  async updateLotteryResult (data) {
    const lotteryId = data.lottery_id
    const result = data.result

    const lottery = await this.LotteryRepository.findBy('id', lotteryId)
    
    // console.log(`updateLotteryResult: ${lotteryId}`, lottery.slug)
    // console.log(result)

    await this.LotteryRepository.update(lottery, {
      result: result,
      status: 'finished',
      result_at: moment().format('YYYY-MM-DD HH:mm:ss')
    })
  }

  async updateLotteryStockResult (data) {
    const lotteryId = data.lottery_id

    let stockResults = await this.getStockResultByLotteryId(lotteryId)
    stockResults = stockResults.toJSON()

    let resultCompares = {}

    _.each(stockResults, (stockResult) => {
      const result = JSON.parse(_.get(stockResult, 'result') || '{}')
      const threeTop = _.get(result, 'three_top')
      const twoTop = _.get(result, 'two_top')
      const twoUnder = _.get(result, 'two_under')

      const resultKey = `${threeTop}${twoTop}${twoUnder}`

      if(_.has(resultCompares, resultKey)) {
        resultCompares[resultKey]['count']++
      } else {
        resultCompares[resultKey] = {
          count: 1,
          result: result
        }
      }
    })

    // console.log(resultCompares)

    let updateResult = null
    _.each(resultCompares, (compare, key) => {
      if(compare.count >= this.stockResultCompare) {
        updateResult = compare.result
        return false
      }
    })

    if(_.isObject(updateResult)) {
      await this.updateLotteryResult({
        lottery_id: lotteryId,
        result: updateResult
      })
      // console.log(`updateLotteryStockResult: ${lotteryId}`)
      // console.log(updateResult)
      // const lottery = await this.LotteryRepository.findBy('id', lotteryId)
      // await this.LotteryRepository.update(lottery, {
      //   result: updateResult,
      //   status: 'finished',
      //   result_at: moment().format('YYYY-MM-DD HH:mm:ss')
      // })
    }
  }

  async hasRequestCache (cacheKey) {
		let cached = await this.RedisTemp.get(cacheKey)

		if (cached) {
      return true
    }

    const pipeline = this.RedisTemp.pipeline()
    pipeline.set(cacheKey, true)
    pipeline.expire(cacheKey, 5 * 60)
    await pipeline.exec()

    return false
  }

  async clearRequestCache (cacheKey) {
    // console.log(`clearRequestCache`, cacheKey)
    await this.RedisTemp.del(cacheKey)
  }
}

module.exports = LotteryResultRepository

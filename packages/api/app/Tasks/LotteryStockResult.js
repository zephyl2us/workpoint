'use strict'

const _ = use('lodash')
const moment = use('moment')
const Task = use('Task')
const Bull = use('Bull')
const Helper = use('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const LotteryRepository = make('App/Repositories/LotteryRepository')
const LotteryResultRepository = make('App/Repositories/Lottery/LotteryResultRepository')
  // const LotteryStockResultRepository = make('App/Repositories/Lottery/LotteryStockResultRepository')
const LotteryStockResultJob = use('App/Jobs/LotteryStockResult')
const LotteryCategoryRepository = make('App/Repositories/LotteryCategoryRepository')

class LotteryStockResult extends Task {
  static get schedule() {
    return '35 */1 * * * *'
  }

  async handle() {
    if (Helper.isDevMode()) console.log('Scheduler : Lottery Stock Result every 1 Minute. (35)')

    try {
      const zones = [
        'lottoone',
        'ltobet',
        // 'huay', 
        'dnabet',
        'kklotto',
        'lotto432',
        'lottovip',
      ]
      const date = moment().subtract(7, 'hours').format('YYYY-MM-DD')
        // const date = moment().format('YYYY-MM-DD')
      const filter = {
        date: date,
        type: 'stock',
      }

      const stockLotteries = await LotteryRepository.browse({ filter })
        .where('end_at', '<', moment().format('YYYY-MM-DD HH:mm:ss'))
        .where('status', 'open')
        // .where('slug', 'japan_morning')
        .with('category')
        .fetch()

      const lotteries = stockLotteries.toJSON()

      if (!_.size(lotteries)) {
        return
      }

      // console.log(lotteries)

      const ids = []

      for (const i in lotteries) {
        const lottery = lotteries[i]
        const id = _.get(lottery, 'id')

        ids.push(id)
      }

      const enableZones = await LotteryCategoryRepository.getEnableZones(zones)

      for (let i = 0; i < _.size(enableZones); i++) {
        const zone = enableZones[i]
        const key = `request_result:${date}-stock-${zone}`
        const hasCache = await LotteryResultRepository.hasRequestCache(key)
          // console.log(`${key} : `, hasCache)

        if (!hasCache) {
          // console.log(key)
          Bull.add(LotteryStockResultJob.key, { date: date, lotteries: lotteries, ids: ids, zone: zone })
        }
      }

      // _.each(zones, (zone) => {
      // 	Bull.add(LotteryStockResultJob.key, { date: date, lotteries: lotteries, ids: ids, zone: zone }, {
      //     ttl: (10 * 60 * 1000)
      //   })
      // })

      // Bull.add(LotteryStockResultJob.key, { date: date, lotteries: lotteries, ids: ids, zone: 'ltobet' })
      // Bull.add(LotteryStockResultJob.key, { date: date, lotteries: lotteries, ids: ids, zone: 'lottoone' })
      // Bull.add(LotteryStockResultJob.key, { date: date, lotteries: lotteries, ids: ids, zone: 'dnabet' })
    } catch (e) {
      const dataLogs = {
        title: 'LotteryStockResult-Task',
        path: 'App/Tasks/LotteryStockResult',
        channel: 'tasks',
        message: e.message,
        data: e,
      }
      LogRepository.fire(dataLogs)
    }
  }

  async resultStockJob(data) {
    const date = data.date
    const lotteries = data.lotteries
    const zone = data.zone
    const stockResults = data.stock_results

    let results = []
      // console.log(`resultStockJob ${zone}`)

    if (zone === 'lottoone') {
      results = await this.getStockResultLottoone(date)
    } else if (zone === 'ltobet') {
      results = await this.getStockResultLtobet(date)
    } else if (zone === 'dnabet') {
      results = await this.getStockResultDnabet(date)
    }

    // console.log(results)

    for (const i in lotteries) {
      const lottery = lotteries[i]
      const lotteryId = _.get(lottery, 'id')
        // console.log(lottery)
      const slug = _.get(lottery, 'slug')

      const result = _.get(results, slug)

      // console.log(slug, result)

      const threeTop = _.get(result, 'three_top')
      const twoTop = _.get(result, 'two_top')
      const twoUnder = _.get(result, 'two_under')

      if (!threeTop || !twoTop || !twoUnder) {
        // console.log(`Result not found.`)
        // console.log(lottery.result_at)
        continue
      }

      // let filterResult = _.filter(stockResults, { lottery_id: lotteryId })
      let findResult = _.find(stockResults, { lottery_id: lotteryId, zone: zone })
        // console.log('findResult')
        // console.log(findResult, lotteryId, zone)
        // console.log(_.has(findResult, 'id'))

      if (!_.has(findResult, 'id')) {
        // Save to lottery_stock_results
        await LotteryResultRepository.createStockResult({
          lottery_id: _.get(lottery, 'id'),
          lottery_category_id: _.get(lottery, 'lottery_category_id'),
          slug: _.get(lottery, 'slug'),
          date: _.get(lottery, 'date'),
          zone: zone,
          result: {
            three_top: threeTop,
            two_top: twoTop,
            two_under: twoUnder
          },
        })
      }

      await LotteryResultRepository.updateLotteryStockResult({
        lottery_id: lotteryId,
      })
    }

    return results
      // const lottooneResults = await this.getResultLottoone(date)
  }
}

module.exports = LotteryStockResult
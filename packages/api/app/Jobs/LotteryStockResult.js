'use strict'

const _ = use('lodash')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const LotteryResultRepository = make('App/Repositories/Lottery/LotteryResultRepository')
const LotteryResultRequestRepository = make('App/Repositories/Lottery/LotteryResultRequestRepository')
const ResultStockRepository = make('App/Repositories/Lottery/ResultStockRepository')

class LotteryStockResult {
  // static get connection() {
  //   return "remote";
  // }

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
      removeOnFail: true
    }
  }

  static get key() {
    return 'LotteryStockResult-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job
    const date = data.date
    const zone = data.zone

		try {
      const lotteries = data.lotteries
      const ids = data.ids
      // const stockResults = data.stock_results
  
      let results = []
  
      if(zone === 'lottoone') {
        results = await LotteryResultRequestRepository.getStockResultLottoone(date)
      } else if(zone === 'ltobet') {
        results = await LotteryResultRequestRepository.getStockResultLtobet(date)
      } else if(zone === 'dnabet') {
        results = await LotteryResultRequestRepository.getStockResultDnabet(date)
      } else if(zone === 'kklotto') {
        results = await ResultStockRepository.kklotto(date)
      } else if(zone === 'lotto432') {
        results = await ResultStockRepository.lotto432(date)
      } else if(zone === 'lottovip') {
        results = await ResultStockRepository.lottovip(date)
      }

      let stockResults = await LotteryResultRepository.getStockResultByLotteryIds(ids)
      stockResults = stockResults.toJSON()
  
      // console.log(`Zone:`, zone)
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
  
        if(!threeTop || !twoTop || !twoUnder) {
          // console.log(`Result not found.`)
          // console.log(lottery.result_at)
          continue
        }
  
        // let filterResult = _.filter(stockResults, { lottery_id: lotteryId })
        let findResult = _.find(stockResults, { lottery_id: lotteryId, zone: zone })
        // console.log('findResult')
        // console.log(findResult, lotteryId, zone)
        // console.log(_.has(findResult, 'id'))
  
        if(!_.has(findResult, 'id')) {
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
		} catch (e) {
			const dataLogs = {
				title: 'LotteryStockResult-job',
				path: 'app/Jobs',
				channel: 'kue',
				message: e.message,
				data: e,
				params: data
			}
			LogRepository.fire(dataLogs)
    } finally {
      const key = `request_result:${date}-stock-${zone}`
      // console.log(`Finally`, key)
      await LotteryResultRepository.clearRequestCache(key)
		}
  }

  // async onCompleted(job, result) {
  //   console.log('Job Compleate...', result)
  // }
}

module.exports = LotteryStockResult

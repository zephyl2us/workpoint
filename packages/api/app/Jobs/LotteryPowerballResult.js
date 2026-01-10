'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const LotteryRepository = make('App/Repositories/LotteryRepository')
const LotteryResultRepository = make('App/Repositories/Lottery/LotteryResultRepository')
const ResultPowerballRepository = make('App/Repositories/Lottery/ResultPowerballRepository')

class LotteryPowerballResult {

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'LotteryPowerballResult-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job
    const date = data.date
    const cacheKey = `request_result:${date}-powerball`

		try {

      let slugs = []
  
      slugs = await ResultPowerballRepository.powerball()

      for (const key in slugs) {
        const results = _.get(slugs, key)

        const filter = {
          date: date,
          type: 'powerball',
          slug: key
        }
  
        const yeekeeLotteries = await LotteryRepository.browse({ filter })
          .where('end_at', '<', moment().format('YYYY-MM-DD HH:mm:ss'))
          .where('status', 'open')
          .fetch()
  
        const lotteries = yeekeeLotteries.toJSON()
  
        for(const lottery of lotteries) {
          const lotteryId = _.get(lottery, 'id')
          const data = _.get(results, 'results')
          const result = _.pick(data, ['balls', 'luckies', 'powers'])
          const powerballPattern = /^[0-9]{1,2}$/
  
          if(!this.isPattern(result, powerballPattern)) {
            continue
          }
  
          await LotteryResultRepository.updateLotteryResult({
            lottery_id: lotteryId,
            result: result
          })
        }
      }
		} catch (e) {
			const dataLogs = {
				title: 'LotteryPowerballResult-job',
				path: 'app/Jobs',
				channel: 'kue',
				message: e.message,
				data: e,
				params: data
			}
			LogRepository.fire(dataLogs)
    } finally {
      await LotteryResultRepository.clearRequestCache(cacheKey)
		}
  }

  async isPattern(data, patternRegex) {
    if (_.isEmpty(data)) return false

    let status = true

    for (let i in data) {
      const list = data[i]
      for (let j in list) {
        const item = list[j]
        if (!patternRegex.test(item)) status = false
      }
    }

    return status
  }

  // async onCompleted(job, result) {
  //   console.log('Job Compleate...', result)
  // }
}

module.exports = LotteryPowerballResult

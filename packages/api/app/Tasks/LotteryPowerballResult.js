'use strict'

const _ = use('lodash')
const moment = use('moment')
const Task = use('Task')
const Bull = use('Bull')
const Helper = use('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const LotteryResultRepository = make('App/Repositories/Lottery/LotteryResultRepository')
const LotteryPowerballResultJob = use('App/Jobs/LotteryPowerballResult')
// const LotteryCategoryRepository = make('App/Repositories/LotteryCategoryRepository')

class LotteryPowerballResult extends Task {
  static get schedule () {
    return '40 */1 * * * *'
  }

  async handle () {
    if(Helper.isDevMode()) console.log('Scheduler : Lottery Powerball Result every 1 Minute. (40)')

    try {
      // const zones = [
			// 	'america',
			// 	'italy',
			// 	'spain',
			// 	'austria',
			// 	'europe',
			// 	'australia',
			// 	'hungary',
			// 	'japan',
			// 	'france',
			// 	'canada',
			// 	'romania',
			// 	'newzealand',
			// 	'peru',
			// 	'germany',
			// 	'philippines',
			// 	'mexico',
			// 	'poland'
			// ]

      const date = moment().subtract(10, 'hours').format('YYYY-MM-DD')
      const key = `request_result:${date}-powerball`
      const hasCache = await LotteryResultRepository.hasRequestCache(key)

      if(!hasCache) {
        Bull.add(LotteryPowerballResultJob.key, { date: date })
      }

    } catch (e) {
			const dataLogs = {
        title: 'LotteryPowerballResult-Task',
        path: 'App/Tasks/LotteryPowerballResult',
        channel: 'tasks',
        message: e.message,
				data: e,
      }
			LogRepository.fire(dataLogs)
    }
  }
}

module.exports = LotteryPowerballResult

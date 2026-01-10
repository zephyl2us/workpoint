'use strict'

const _ = use('lodash')
const moment = use('moment')
const Task = use('Task')
const Bull = use('Bull')
const Helper = use('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const LotteryRepository = make('App/Repositories/LotteryRepository')
const ResultYeekeeRepository = make('App/Repositories/Lottery/ResultYeekeeRepository')

class LotteryGovernmentResult extends Task {
  static get schedule() {
    return '30 */1 * * * *'
  }

  async handle() {
    if (Helper.isDevMode()) console.log('Scheduler : Lottery Yeekee Result every 1 Minute. (30)')

    try {
			const filter = {
				type: 'government',
				slug: 'glo',
				status: 'open'
			}
	
			const lottery = await LotteryRepository.browse({ filter }).first()
			if(!lottery) return
	
			const date = _.get(lottery, 'date')
			const result = await ResultYeekeeRepository.thaigov(date)
	
			if(!result) return
	
			const jackpotReward = _.get(result, 'jackpot_reward')
			const isFinish = !/x/g.test(jackpotReward)
	
			let data = {
				result: result,
				status: 'finished'
			}
	
			if (!isFinish) {
				data = _.omit(data, 'status')
			}
			
			await LotteryRepository.update(lottery, data)


    } catch (e) {
      const dataLogs = {
        title: 'LotteryGovernmentResult-Task',
        path: 'App/Tasks/LotteryGovernmentResult',
        channel: 'tasks',
        message: e.message,
        data: e,
      }
      LogRepository.fire(dataLogs)
    }
  }
}

module.exports = LotteryGovernmentResult
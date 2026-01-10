'use strict'

const Task = use('Task')
const Helper = use('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const LotteryStartRepository = make('App/Repositories/Lottery/LotteryStartRepository')

class LotteryStart extends Task {
  static get schedule () {
    return '0 */1 * * * *'
  }

  async handle () {
    // this.info('Task LotteryStart handle')
    if(Helper.isDevMode()) console.log('Scheduler : Lottery Start every 1 Minute (0)')

    try {
      await LotteryStartRepository.scheduler()
    } catch (e) {
			const dataLogs = {
        title: 'LotteryStart-Task',
        path: 'App/Tasks/LotteryStart',
        channel: 'tasks',
        message: e.message,
				data: e,
      }
			LogRepository.fire(dataLogs)
    }
  }
}

module.exports = LotteryStart
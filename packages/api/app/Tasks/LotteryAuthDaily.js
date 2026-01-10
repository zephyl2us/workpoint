'use strict'

const _ = use('lodash')
const moment = use('moment')
const Task = use('Task')
const Bull = use('Bull')
const Helper = use('App/Helper')
const LotteryAuthDailyJob = use('App/Jobs/LotteryAuthDaily')
const LogRepository = make('App/Repositories/LogRepository')
const LotteryResultRepository = make('App/Repositories/Lottery/LotteryResultRepository')
const LotteryCategoryRepository = make('App/Repositories/LotteryCategoryRepository')

class LotteryAuthDaily extends Task {
  static get schedule() {
    return '0 */1 * * * *'
  }

  async handle() {
    if (Helper.isDevMode()) console.log('Scheduler : Lottery Auth every 1 Minute. (0)')

    try {
      const zones = [
        // 'ruaychoke',
        // 'ruamchoke',
        // 'jakchoke',
        'lottovip',
        'luxnumber',
        // 'haichoke',
        // 'taweechoke',
        'cat888',
        // 'movewin',
        // 'siamlotto',
        // 'lottorich28',
        // 'uwin789',
        'lottoone',
        'yeslotto',
				'worldlotto',
				'chudjen'
      ]

      const enableZones = await LotteryCategoryRepository.getEnableZones(zones)

      for (let zone of enableZones) {
        const date = moment().format('YYYY-MM-DD')
        const key = `request_daily_auth:${date}-${zone}`
        const hasCache = await LotteryResultRepository.hasRequestCache(key)

        // console.log('Keys: ', key)
        // console.log('hasCache : ', hasCache)
        if (!hasCache) {
          // console.log('send job : ', key)
          Bull.add(LotteryAuthDailyJob.key, { zone: zone, date: date })
        }
      }

    } catch (e) {
      const dataLogs = {
        title: 'LotteryAuthDaily-Task',
        path: 'App/Tasks/LotteryAuthDaily',
        channel: 'tasks',
        message: e.message,
        data: e,
      }
      LogRepository.fire(dataLogs)
    }
  }
}

module.exports = LotteryAuthDaily
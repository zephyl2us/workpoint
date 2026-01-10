'use strict'

const _ = use('lodash')
const moment = use('moment')
const Task = use('Task')
const Bull = use('Bull')
const Helper = use('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const LotteryYeekeeResultJob = use('App/Jobs/LotteryYeekeeResult')
const LotteryCategoryRepository = make('App/Repositories/LotteryCategoryRepository')
const LotteryResultRepository = make('App/Repositories/Lottery/LotteryResultRepository')

class LotteryYeekeeResult extends Task {
  static get schedule() {
    return '30 */1 * * * *'
  }

  async handle() {
    if (Helper.isDevMode()) console.log('Scheduler : Lottery Yeekee Result every 1 Minute. (30)')

    try {
      const zones = [
        'lottoone',
        'ltobet',
        'huay',
        // 'dnabet',
        // 'thailotto',
        'huay95',
        'kklotto',
        // 'yeslotto',
        // 'movewin',
        'settee',
        'jaywaii',
        'jaosuo',
        // 'teng1',
        'lotto432',
        'huay2525',
        'masurebet',
        // 'cat888',
        // 'cat999',
        // 'ruamchoke',
        // 'ruaychoke',
        // 'lottorich28',
        // 'heng168',
        // 'siamlotto',
        'lotto77',
        'luxnumber',
        'huaylike',
        'kerry899',
        // 'uwin789',
        'arawan',
        // 'huay9898',
        'haichoke',
        // 'jakchoke',
        // 'taweechoke',
				'worldlotto',
				'chudjen',
        'lottovip'
      ]
      const enableZones = await LotteryCategoryRepository.getEnableZones(zones)

      const date = moment().subtract(5, 'hours').subtract(30, 'minutes').format('YYYY-MM-DD')

      for (let i = 0; i < _.size(enableZones); i++) {
        const zone = enableZones[i]
        const key = `request_result:${date}-${zone}`
        const hasCache = await LotteryResultRepository.hasRequestCache(key)
          // console.log(`${key} : `, hasCache)

        if (!hasCache) {
          // console.log(key)
          Bull.add(LotteryYeekeeResultJob.key, { date: date, zone: zone })
        }
      }
      // _.each(enableZones, (zone) => {
      //   const key = `request_result:${date}-${zone}`
      //   console.log(await LotteryResultRepository.hasRequestCache(key))

      //   Bull.add(LotteryYeekeeResultJob.key, { date: date, zone: zone }, {
      //     ttl: (5 * 60 * 1000)
      //   })
      // })

      // Bull.add(LotteryYeekeeResultJob.key, { date: date, zone: 'lottoone' })
      // Bull.add(LotteryYeekeeResultJob.key, { date: date, zone: 'ltobet' })
      // Bull.add(LotteryYeekeeResultJob.key, { date: date, zone: 'huay' })
      // Bull.add(LotteryYeekeeResultJob.key, { date: date, zone: 'dnabet' })

    } catch (e) {
      const dataLogs = {
        title: 'LotteryYeekeeResult-Task',
        path: 'App/Tasks/LotteryYeekeeResult',
        channel: 'tasks',
        message: e.message,
        data: e,
      }
      LogRepository.fire(dataLogs)
    }
  }
}

module.exports = LotteryYeekeeResult
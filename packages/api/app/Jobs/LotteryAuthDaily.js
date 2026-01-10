'use strict'

const _ = use('lodash')
const moment = use('moment')
const Redis = use('Redis')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const ResultAuthRepository = make('App/Repositories/Lottery/ResultAuthRepository')
const LotteryResultRepository = make('App/Repositories/Lottery/LotteryResultRepository')

class LotteryAuthDaily {
  // static get connection() {
  //   return "remote";
  // }

  constructor() {
		this.Redis = Redis.connection('lottery')
  }

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'LotteryAuthDaily-job'
  }

  // This is where the work is done.
  async handle(job) {
    const { data } = job
    const zone = data.zone
    const date = data.date
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'), data.zone)

    const cacheKey = `request_daily_auth:${date}-${zone}`
		try {
      const cookie = await this.Redis.get(`cookie:${zone}`)
  
      if(zone === 'ruamchoke') {
        if (!cookie) await ResultAuthRepository.ruamchoke()
      } else if (zone === 'lottovip') {
        if (!cookie) await ResultAuthRepository.lottovip()
      } else if (zone === 'luxnumber') {
        if (!cookie) await ResultAuthRepository.luxnumber()
      } else if (zone === 'ruaychoke') {
        if (!cookie) await ResultAuthRepository.ruaychoke()
      } else if (zone === 'haichoke') {
        if (!cookie) await ResultAuthRepository.haichoke()
      } else if (zone === 'jakchoke') {
        if (!cookie) await ResultAuthRepository.jakchoke()
      } else if (zone === 'taweechoke') {
        if (!cookie) await ResultAuthRepository.taweechoke()
      } else if (zone === 'cat888') {
        if (!cookie) await ResultAuthRepository.cat888()
      } else if (zone === 'movewin') {
        if (!cookie) await ResultAuthRepository.movewin()
      } else if (zone === 'siamlotto') {
        if (!cookie) await ResultAuthRepository.siamlotto()
      } else if (zone === 'lottorich28') {
        if (!cookie) await ResultAuthRepository.lottorich28()
      } else if (zone === 'uwin789') {
        if (!cookie) await ResultAuthRepository.uwin789()
      } else if (zone === 'lottoone') {
        if (!cookie) await ResultAuthRepository.lottoone()        
      } else if (zone === 'worldlotto') {
        if (!cookie) await ResultAuthRepository.worldlotto()        
      } else if (zone === 'chudjen') {
        if (!cookie) await ResultAuthRepository.chudjen()        
      }

		} catch (e) {
			const dataLogs = {
				title: 'LotteryAuthDaily-job',
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

  // async onCompleted(job, result) {
  //   console.log('Job Compleate...', result)
  // }
}

module.exports = LotteryAuthDaily

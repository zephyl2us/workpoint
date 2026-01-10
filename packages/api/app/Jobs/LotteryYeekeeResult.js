'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const LotteryRepository = make('App/Repositories/LotteryRepository')
const LotteryResultRepository = make('App/Repositories/Lottery/LotteryResultRepository')
const LotteryResultRequestRepository = make('App/Repositories/Lottery/LotteryResultRequestRepository')
const ResultYeekeeRepository = make('App/Repositories/Lottery/ResultYeekeeRepository')

class LotteryYeekeeResult {
  // static get connection() {
  //   return "remote";
  // }

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'LotteryYeekeeResult-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))

    const { data } = job
    const date = data.date
    const zone = data.zone
    const cacheKey = `request_result:${date}-${zone}`


		try {

      let slugs = []
  
      if(zone === 'lottoone') {
        slugs = await LotteryResultRequestRepository.getYeekeeResultLottoone(date)
      } else if(zone === 'ltobet') {
        slugs = await LotteryResultRequestRepository.getYeekeeResultLtobet(date)
      } else if(zone === 'huay') {
        slugs = await LotteryResultRequestRepository.getYeekeeResultHuay(date)
      } else if(zone === 'dnabet') {
        slugs = await LotteryResultRequestRepository.getYeekeeResultDnabet(date)
      } else if(zone === 'thailotto') {
        slugs = await ResultYeekeeRepository.thailotto(date)
      } else if (zone === 'huay95') {
        slugs = await ResultYeekeeRepository.huay95(date)
      } else if (zone === 'kklotto') {
        slugs = await ResultYeekeeRepository.kklotto(date)
      } else if (zone === 'yeslotto') {
        slugs = await ResultYeekeeRepository.yeslotto(date)
      } else if (zone === 'movewin') {
        slugs = await ResultYeekeeRepository.movewin(date)
      } else if (zone === 'settee') {
        slugs = await ResultYeekeeRepository.settee(date)
      } else if (zone === 'jaywaii') {
        slugs = await ResultYeekeeRepository.jaywaii(date)
      } else if (zone === 'jaosuo') {
        slugs = await ResultYeekeeRepository.jaosuo(date)
      } else if (zone === 'teng1') {
        slugs = await ResultYeekeeRepository.teng1(date)
      } else if (zone === 'lotto432') {
        slugs = await ResultYeekeeRepository.lotto432(date)
      } else if (zone === 'huay2525') {
        slugs = await ResultYeekeeRepository.huay2525(date)
      } else if (zone === 'masurebet') {
        slugs = await ResultYeekeeRepository.masurebet(date)
      } else if (zone === 'cat888') {
        slugs = await ResultYeekeeRepository.cat888(date)
      } else if (zone === 'cat999') {
        slugs = await ResultYeekeeRepository.cat999(date)
      } else if (zone === 'ruamchoke') {
        slugs = await ResultYeekeeRepository.ruamchoke(date)
      } else if (zone === 'heng168') {
        slugs = await ResultYeekeeRepository.heng168(date)
      } else if (zone === 'siamlotto') {
        slugs = await ResultYeekeeRepository.siamlotto(date)
      } else if (zone === 'lotto77') {
        slugs = await ResultYeekeeRepository.lotto77(date)
      } else if (zone === 'luxnumber') {
        slugs = await ResultYeekeeRepository.luxnumber(date)
      } else if (zone === 'huaylike') {
        slugs = await ResultYeekeeRepository.huaylike(date)
      } else if (zone === 'lottorich28') {
        slugs = await ResultYeekeeRepository.lottorich28(date)
      } else if (zone === 'kerry899') {
        slugs = await ResultYeekeeRepository.kerry899(date)
      } else if (zone === 'uwin789') {
        slugs = await ResultYeekeeRepository.uwin789(date)
      } else if (zone === 'arawan') {
        slugs = await ResultYeekeeRepository.arawanbet(date)
      } else if (zone === 'ruaychoke') {
        slugs = await ResultYeekeeRepository.ruaychoke(date)
      } else if (zone === 'huay9898') {
        slugs = await ResultYeekeeRepository.huay9898(date)
      } else if (zone === 'haichoke') {
        slugs = await ResultYeekeeRepository.haichoke(date)
      } else if (zone === 'jakchoke') {
        slugs = await ResultYeekeeRepository.jakchoke(date)
      } else if (zone === 'taweechoke') {
        slugs = await ResultYeekeeRepository.taweechoke(date)
      } else if (zone === 'lottovip') {
        slugs = await ResultYeekeeRepository.lottovip(date)
      } else if (zone === 'worldlotto') {
        slugs = await ResultYeekeeRepository.worldlotto(date)
      } else if (zone === 'chudjen') {
        slugs = await ResultYeekeeRepository.chudjen(date)
      }

      for (const key in slugs) {
        // console.log(key)
        const results = _.get(slugs, key)
        // console.log(`results`, results)
  
        const filter = {
          date: date,
          type: 'yeekee',
          slug: key
        }
  
        const yeekeeLotteries = await LotteryRepository.browse({ filter })
        .where('end_at', '<', moment().format('YYYY-MM-DD HH:mm:ss'))
        .where('status', 'open')
        // .where('slug', 'japan_morning')
        // .with('category')
        .fetch()
  
        const lotteries = yeekeeLotteries.toJSON()
  
        // console.log(_.size(lotteries))
  
        for(const lottery of lotteries) {
          // console.log(lottery)
          const lotteryId = _.get(lottery, 'id')
          const round = _.get(lottery, 'round')
  
          let findResult = _.find(results, { round: round })
          const result = _.pick(findResult, ['three_top', 'two_top', 'two_under'])
          // console.log(`result:`, result)
  
          const threeTop = _.get(result, 'three_top')
          const twoTop = _.get(result, 'two_top')
          const twoUnder = _.get(result, 'two_under')
    
          const threePattern = /^[0-9]{3}$/
          const twoPattern = /^[0-9]{2}$/

          if(!threePattern.test(threeTop) || !twoPattern.test(twoTop) || !twoPattern.test(twoUnder)) {
            // console.log(`Result not found.`)
            // console.log(lottery.result_at)
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
				title: 'LotteryYeekeeResult-job',
				path: 'app/Jobs',
				channel: 'kue',
				message: e.message,
				data: e,
				params: data
			}
			LogRepository.fire(dataLogs)
    } finally {
      const key = `request_result:${date}-${zone}`
      // console.log(`Finally`, key)
      await LotteryResultRepository.clearRequestCache(cacheKey)
		}
  }

  // async onCompleted(job, result) {
  //   console.log('Job Compleate...', result)
  // }
}

module.exports = LotteryYeekeeResult

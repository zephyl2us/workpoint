'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const LotteryRepository = make('App/Repositories/LotteryRepository')
const LotteryResultRepository = make('App/Repositories/Lottery/LotteryResultRepository')
const ResultCryptoRepository = make('App/Repositories/Lottery/ResultCryptoRepository')

class LotteryCryptoResult {
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
    return 'LotteryCryptoResult-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))

    const { data } = job
    const date = data.date
    const zone = data.zone
    const cacheKey = `request_result:crypto:${date}-${zone}`

    console.log(`🔍 [Crypto Job] Starting: ${zone} - ${date}`)

    try {
      // ดึงผลทั้งวันจาก Binance (264 รอบ) ครั้งเดียว
      let slugs = {}
      
      console.log(`📡 [Crypto Job] Fetching results from Binance for ${zone}...`)
      
      if(zone === 'btc') {
        slugs = await ResultCryptoRepository.btc(date)
      } else if(zone === 'eth') {
        slugs = await ResultCryptoRepository.eth(date)
      } else if(zone === 'ada') {
        slugs = await ResultCryptoRepository.ada(date)
      } else if(zone === 'sol') {
        slugs = await ResultCryptoRepository.sol(date)
      } else if(zone === 'dot') {
        slugs = await ResultCryptoRepository.dot(date)
      } else if(zone === 'avax') {
        slugs = await ResultCryptoRepository.avax(date)
      } else if(zone === 'bnb') {
        slugs = await ResultCryptoRepository.bnb(date)
      } else if(zone === 'xrp') {
        slugs = await ResultCryptoRepository.xrp(date)
      } else if(zone === 'trx') {
        slugs = await ResultCryptoRepository.trx(date)
      }

      const slugKeys = _.keys(slugs)
      if (slugKeys.length === 0) {
        console.log(`❌ [Crypto Job] No results from Binance for ${zone}`)
        return
      }
      
      const totalRounds = _.size(_.get(slugs, slugKeys[0]))
      console.log(`✅ [Crypto Job] Got ${totalRounds} rounds from Binance for ${zone}`)

      // วนลูปแต่ละ slug (crypto มี 1 slug per zone)
      for (const key in slugs) {
        const results = _.get(slugs, key)
        console.log(`🎯 [Crypto Job] Processing slug: ${key}`)
        
        // หา lotteries ที่รอผล
        const filter = {
          date: date,
          type: 'crypto',
          slug: key
        }

        const cryptoLotteries = await LotteryRepository.browse({ filter })
          .where('end_at', '<', moment().format('YYYY-MM-DD HH:mm:ss'))
          .where('status', 'open')
          .fetch()

        const lotteries = cryptoLotteries.toJSON()
        console.log(`📝 [Crypto Job] Found ${lotteries.length} pending lotteries for ${key}`)

        let updatedCount = 0
        let skippedCount = 0

        // วนลูปแต่ละ lottery และ match กับผล
        for(const lottery of lotteries) {
          const lotteryId = _.get(lottery, 'id')
          const round = _.get(lottery, 'round')

          // หาผลที่ตรงกับ round
          let findResult = _.find(results, { round: round })
          
          if (!findResult) {
            console.log(`⚠️  [Crypto Job] No result found for ${key} round ${round}`)
            skippedCount++
            continue
          }

          // เก็บทั้ง result และ raw data สำหรับตรวจสอบ
          const result = _.pick(findResult, ['three_top', 'two_top', 'two_under', 'raw_close_price', 'raw_quote_volume', 'symbol'])

          const threeTop = _.get(result, 'three_top')
          const twoTop = _.get(result, 'two_top')
          const twoUnder = _.get(result, 'two_under')

          const threePattern = /^[0-9]{3}$/
          const twoPattern = /^[0-9]{2}$/

          if(!threePattern.test(threeTop) || !twoPattern.test(twoTop) || !twoPattern.test(twoUnder)) {
            // ผลยังไม่พร้อม ข้าม
            console.log(`⚠️  [Crypto Job] Invalid result format for ${key} round ${round}: ${threeTop}/${twoUnder}`)
            skippedCount++
            continue
          }

          // บันทึกผล
          await LotteryResultRepository.updateLotteryResult({
            lottery_id: lotteryId,
            result: result
          })
          
          console.log(`✅ [Crypto Job] Updated lottery #${lotteryId} (${key} round ${round}): ${threeTop}/${twoUnder}`)
          updatedCount++
        }

        console.log(`📊 [Crypto Job] Summary for ${key}: ${updatedCount} updated, ${skippedCount} skipped`)
      }

      console.log(`🎉 [Crypto Job] Completed: ${zone} - ${date}`)

    } catch (e) {
      console.error(`❌ [Crypto Job] Error for ${zone}:`, e.message)
      const dataLogs = {
        title: 'LotteryCryptoResult-job',
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

module.exports = LotteryCryptoResult

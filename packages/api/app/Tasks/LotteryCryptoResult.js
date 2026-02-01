'use strict'

const _ = use('lodash')
const moment = use('moment')
const Task = use('Task')
const Bull = use('Bull')
const Helper = use('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const LotteryCryptoResultJob = use('App/Jobs/LotteryCryptoResult')
const LotteryCategoryRepository = make('App/Repositories/LotteryCategoryRepository')
const LotteryResultRepository = make('App/Repositories/Lottery/LotteryResultRepository')

class LotteryCryptoResult extends Task {
  static get schedule() {
    // ทุกนาที ที่วินาทีที่ 30 (เหมือน yeekee)
    return '30 */1 * * * *'
  }

  async handle() {
    console.log('🔔 [Crypto Task] Scheduler : Lottery Crypto Result every 1 Minute. (30)')

    try {
      const zones = [
        'btc',
        'eth',
        'ada',
        'sol',
        'dot',
        'avax',
        'bnb',
        'xrp',
        'trx'
      ]
      
      console.log(`🔍 [Crypto Task] Checking enabled zones...`)
      const enableZones = await LotteryCategoryRepository.getEnableZones(zones, 'crypto')
      console.log(`✅ [Crypto Task] Enabled zones: [${enableZones.join(', ')}] (${enableZones.length}/${zones.length})`)

      const date = moment().subtract(5, 'hours').subtract(30, 'minutes').format('YYYY-MM-DD')
      console.log(`📅 [Crypto Task] Date: ${date}`)

      if (enableZones.length === 0) {
        console.log(`⚠️  [Crypto Task] No enabled zones found. Skipping...`)
        return
      }

      for (let i = 0; i < _.size(enableZones); i++) {
        const zone = enableZones[i]
        const key = `request_result:crypto:${date}-${zone}`
        const hasCache = await LotteryResultRepository.hasRequestCache(key)

        console.log(`🔑 [Crypto Task] Zone: ${zone}, Cache Key: ${key}, Has Cache: ${hasCache}`)

        if (!hasCache) {
          Bull.add(LotteryCryptoResultJob.key, { date: date, zone: zone })
          console.log(`✅ [Crypto Task] Added job to queue: ${zone}`)
        } else {
          console.log(`⏭️  [Crypto Task] Skipped (cache exists): ${zone}`)
        }
      }

      console.log(`🎉 [Crypto Task] Completed`)

    } catch (e) {
      console.error(`❌ [Crypto Task] Error:`, e.message)
      console.error(e.stack)
      const dataLogs = {
        title: 'LotteryCryptoResult-Task',
        path: 'App/Tasks/LotteryCryptoResult',
        channel: 'tasks',
        message: e.message,
        data: e,
      }
      LogRepository.fire(dataLogs)
    }
  }
}

module.exports = LotteryCryptoResult

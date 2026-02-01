'use strict'

const _ = use('lodash')

/*
|--------------------------------------------------------------------------
| LotteryCategoryCryptoSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const LotteryCategory = use('App/Models/LotteryCategory')

class LotteryCategoryCryptoSeeder {
  async run () {
    const uniqueKey = 'slug'

    // Template สำหรับ crypto - อ้างอิงจาก yeekee 5min
    const cryptoTemplate = {
      type: 'crypto',
      total_round: 264,       // 5 นาที = 264 รอบ/วัน
      pre_start: 0,
      start_time: '05:00',    // เริ่ม 05:00 (เหมือน yeekee)
      available_day: [1,2,3,4,5,6,7],  // ทุกวัน (crypto ไม่หยุด)
      special_day: null,
      holiday: null,
      end_delay: 1,           // 1 วัน เพราะ end_time เป็นตี 4 ของวันถัดไป
      end_time: '04:00',      // จบ 04:00 วันถัดไป (เหมือน yeekee)
      result_delay: null,
      result_time: null,
      is_enable: 0,           // ปิดไว้ก่อน จะเปิดทีหลัง
    }

    const lotteryCategories = [
      // Bitcoin (BTC)
      _.assign({}, cryptoTemplate, {
        id: 30001,
        slug: 'btc_5min',
        zone: 'btc',
      }),

      // Ethereum (ETH)
      _.assign({}, cryptoTemplate, {
        id: 30002,
        slug: 'eth_5min',
        zone: 'eth',
      }),

      // Cardano (ADA)
      _.assign({}, cryptoTemplate, {
        id: 30003,
        slug: 'ada_5min',
        zone: 'ada',
      }),

      // Solana (SOL)
      _.assign({}, cryptoTemplate, {
        id: 30004,
        slug: 'sol_5min',
        zone: 'sol',
      }),

      // Polkadot (DOT)
      _.assign({}, cryptoTemplate, {
        id: 30005,
        slug: 'dot_5min',
        zone: 'dot',
      }),

      // Avalanche (AVAX)
      _.assign({}, cryptoTemplate, {
        id: 30006,
        slug: 'avax_5min',
        zone: 'avax',
      }),

      // Binance Coin (BNB)
      _.assign({}, cryptoTemplate, {
        id: 30007,
        slug: 'bnb_5min',
        zone: 'bnb',
      }),

      // Ripple (XRP)
      _.assign({}, cryptoTemplate, {
        id: 30008,
        slug: 'xrp_5min',
        zone: 'xrp',
      }),

      // Tron (TRX)
      _.assign({}, cryptoTemplate, {
        id: 30009,
        slug: 'trx_5min',
        zone: 'trx',
      }),
    ]

    // Insert categories (ตรวจสอบไม่ให้ซ้ำ)
    for(let i in lotteryCategories) {
      const lotteryCategory = lotteryCategories[i]
      const slug = _.get(lotteryCategory, 'slug')

      const data = await LotteryCategory.findBy('slug', slug)

      if(!_.isNull(data)) {
        console.log(`Lottery Category: ${slug} already exists`)
        continue
      }

      const lottery = await LotteryCategory.create(lotteryCategory)
      console.log('Created Lottery Category:', lottery.toJSON())
    }
  }
}

module.exports = LotteryCategoryCryptoSeeder

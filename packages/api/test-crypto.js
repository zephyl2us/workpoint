'use strict'

/**
 * ไฟล์ทดสอบ Crypto Lottery
 * รันด้วย: node test-crypto.js
 */

const path = require('path')
const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    const moment = use('moment')
    const _ = use('lodash')
    const Bull = use('Bull')
    
    console.log('🚀 Starting Crypto Lottery Test...\n')

    try {
      // 1. เช็ค Categories
      console.log('📊 1. Checking Crypto Categories...')
      const LotteryCategory = use('App/Models/LotteryCategory')
      const categories = await LotteryCategory.query()
        .where('type', 'crypto')
        .fetch()
      console.log(`   Found ${categories.toJSON().length} categories`)
      categories.toJSON().forEach(cat => {
        console.log(`   - ${cat.slug}: ${cat.is_enable ? '✅ Enabled' : '❌ Disabled'}`)
      })
      console.log('')

      // 2. ทดสอบดึงผลจาก Binance
      console.log('🔍 2. Testing Binance API...')
      const ResultCryptoRepository = make('App/Repositories/Lottery/ResultCryptoRepository')
      const date = moment().subtract(5, 'hours').format('YYYY-MM-DD')
      console.log(`   Date: ${date}`)
      
      const btcResults = await ResultCryptoRepository.btc(date)
      const btcSlug = _.keys(btcResults)[0]
      const btcData = btcResults[btcSlug]
      
      if (btcData && btcData.length > 0) {
        console.log(`   ✅ BTC Results: ${btcData.length} rounds`)
        console.log(`   Sample (Round 1):`, {
          round: btcData[0].round,
          three_top: btcData[0].three_top,
          two_top: btcData[0].two_top,
          two_under: btcData[0].two_under,
          close_price: btcData[0].raw_close_price,
          volume: btcData[0].raw_volume
        })
      } else {
        console.log('   ❌ No BTC results found')
      }
      console.log('')

      // 3. เช็ค Lottery ที่รอผล
      console.log('⏳ 3. Checking Pending Lotteries...')
      const Lottery = use('App/Models/Lottery')
      const pendingLotteries = await Lottery.query()
        .where('date', date)
        .where('type', 'crypto')
        .where('status', 'open')
        .where('end_at', '<', moment().format('YYYY-MM-DD HH:mm:ss'))
        .limit(10)
        .fetch()
      
      const pending = pendingLotteries.toJSON()
      console.log(`   Found ${pending.length} pending lotteries`)
      if (pending.length > 0) {
        pending.forEach(lot => {
          console.log(`   - ${lot.slug} Round ${lot.round}: ${lot.end_at}`)
        })
      }
      console.log('')

      // 4. รัน Job (ถ้าต้องการ)
      const runJob = process.argv.includes('--run-job')
      if (runJob) {
        console.log('🎯 4. Adding Job to Queue...')
        const LotteryCryptoResultJob = use('App/Jobs/LotteryCryptoResult')
        
        // เพิ่ม job สำหรับแต่ละ enabled zone
        const enabledCategories = categories.toJSON().filter(c => c.is_enable === 1)
        const zones = _.uniq(enabledCategories.map(c => c.zone))
        
        for (const zone of zones) {
          Bull.add(LotteryCryptoResultJob.key, { 
            date: date, 
            zone: zone 
          })
          console.log(`   ✅ Added job for zone: ${zone}`)
        }
        console.log('')
      } else {
        console.log('💡 4. Skip adding job (use --run-job to add)')
        console.log('')
      }

      // 5. เช็คผลที่อัปเดตแล้ว
      console.log('✅ 5. Checking Finished Lotteries...')
      const finishedLotteries = await Lottery.query()
        .where('date', date)
        .where('type', 'crypto')
        .where('status', 'finished')
        .orderBy('round', 'asc')
        .limit(10)
        .fetch()
      
      const finished = finishedLotteries.toJSON()
      console.log(`   Found ${finished.length} finished lotteries`)
      if (finished.length > 0) {
        console.log(`\n   📊 Detailed Results:\n`)
        finished.forEach(lot => {
          const result = JSON.parse(lot.result || '{}')
          console.log(`   ${lot.slug} Round ${lot.round}:`)
          console.log(`      3ตัวบน: ${result.three_top}, 2ตัวบน: ${result.two_top}, 2ตัวล่าง: ${result.two_under}`)
          console.log(`      Close: ${result.raw_close_price}, Volume: ${result.raw_volume}`)
          console.log(`      ตรวจสอบ: https://api.binance.com/api/v3/klines?symbol=${result.symbol || 'BTCUSDT'}&interval=5m&startTime=${moment(`${lot.date} ${lot.end_at.split(' ')[1]}`).subtract(5, 'minutes').valueOf()}&limit=1`)
          console.log(``)
        })
      }
      console.log('')

      console.log('✨ Test completed!')
      process.exit(0)

    } catch (error) {
      console.error('❌ Error:', error.message)
      console.error(error.stack)
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Failed to start:', error)
    process.exit(1)
  })

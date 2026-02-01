'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await resetCryptoResults()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function resetCryptoResults() {
  const moment = use('moment')
  try {
    console.log('🔄 Starting Crypto Results Reset...\n')
    
    const Lottery = use('App/Models/Lottery')
    const date = '2026-02-01'
    
    // 1. หารอบที่ finished
    console.log('📊 1. Finding finished crypto lotteries...')
    const finishedLotteries = await Lottery.query()
      .where('date', date)
      .where('type', 'crypto')
      .where('status', 'finished')
      .fetch()
    
    const finished = finishedLotteries.toJSON()
    console.log(`   Found ${finished.length} finished lotteries\n`)
    
    if (finished.length === 0) {
      console.log('✅ No finished lotteries to reset!\n')
      return
    }
    
    // 2. Reset status และ result
    console.log('🔄 2. Resetting lotteries...')
    
    let resetCount = 0
    for (const lottery of finished) {
      await Lottery.query()
        .where('id', lottery.id)
        .update({
          status: 'open',
          result: null,
          result_at: null
        })
      
      resetCount++
      
      if (resetCount % 50 === 0) {
        console.log(`   Progress: ${resetCount}/${finished.length}`)
      }
    }
    
    console.log(`   ✅ Reset ${resetCount} lotteries\n`)
    
    // 3. แสดงสรุป
    console.log('📊 3. Verification...')
    const openLotteries = await Lottery.query()
      .where('date', date)
      .where('type', 'crypto')
      .where('status', 'open')
      .count('* as total')
    
    const stillFinished = await Lottery.query()
      .where('date', date)
      .where('type', 'crypto')
      .where('status', 'finished')
      .count('* as total')
    
    console.log(`   Open lotteries: ${openLotteries[0].total}`)
    console.log(`   Finished lotteries: ${stillFinished[0].total}`)
    console.log('')
    
    console.log('✅ Reset completed!')
    console.log('💡 Next steps:')
    console.log('   1. Restart PM2: pm2 restart all')
    console.log('   2. Wait for next task run (every 1 minute)')
    console.log('   3. Check logs: pm2 logs')
    console.log('')
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

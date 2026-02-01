'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await runNewCoinsJob()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function runNewCoinsJob() {
  try {
    console.log('🎯 Running Job for New Coins (BNB, XRP, TRX)...\n')
    
    const moment = use('moment')
    const Job = use('App/Jobs/LotteryCryptoResult')
    
    const date = moment().format('YYYY-MM-DD')
    const zones = ['bnb', 'xrp', 'trx']
    
    console.log(`📅 Date: ${date}`)
    console.log(`💰 Coins: ${zones.join(', ').toUpperCase()}\n`)
    
    for (const zone of zones) {
      console.log(`\n${'='.repeat(80)}`)
      console.log(`🔄 Processing ${zone.toUpperCase()}...`)
      console.log('='.repeat(80))
      
      // สร้าง job instance
      const job = new Job()
      
      // รัน handle method
      await job.handle({ date, zone })
      
      console.log(`✅ ${zone.toUpperCase()} completed!`)
    }
    
    console.log('\n\n🎉 All new coins processed!')
    console.log('\n💡 Verify results:')
    console.log(`   node check-new-coins-results.js`)
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

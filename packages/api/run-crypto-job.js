'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await runCryptoJob()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function runCryptoJob() {
  try {
    console.log('🎯 Running Crypto Result Job...\n')
    
    const moment = use('moment')
    const Job = use('App/Jobs/LotteryCryptoResult')
    
    const date = moment().format('YYYY-MM-DD')
    
    console.log(`📅 Date: ${date}`)
    console.log('🔄 Starting job...\n')
    
    // สร้าง job instance
    const job = new Job()
    
    // รัน handle method
    await job.handle({ date })
    
    console.log('\n✅ Job completed!')
    console.log('\n💡 Check database to verify results:')
    console.log(`   SELECT COUNT(*), status FROM lotteries WHERE date='${date}' AND type='crypto' GROUP BY status;`)
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

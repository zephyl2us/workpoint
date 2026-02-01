'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await resetCryptoResultsFast()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function resetCryptoResultsFast() {
  try {
    console.log('🔄 Fast Reset Crypto Results...\n')
    
    const Database = use('Database')
    const date = '2026-02-01'
    
    // 1. เช็คจำนวนก่อน reset
    console.log('📊 1. Checking current status...')
    const beforeCount = await Database
      .from('lotteries')
      .where('date', date)
      .where('type', 'crypto')
      .count('* as total')
      .groupBy('status')
      .select('status')
    
    console.log('   Before reset:')
    beforeCount.forEach(row => {
      console.log(`   - ${row.status}: ${row.total}`)
    })
    console.log('')
    
    // 2. Reset ทั้งหมดด้วย raw query
    console.log('🔄 2. Resetting all finished lotteries...')
    const result = await Database
      .table('lotteries')
      .where('date', date)
      .where('type', 'crypto')
      .where('status', 'finished')
      .update({
        status: 'open',
        result: null,
        result_at: null
      })
    
    console.log(`   ✅ Reset ${result} lotteries\n`)
    
    // 3. เช็คหลัง reset
    console.log('📊 3. Verification...')
    const afterCount = await Database
      .from('lotteries')
      .where('date', date)
      .where('type', 'crypto')
      .count('* as total')
      .groupBy('status')
      .select('status')
    
    console.log('   After reset:')
    afterCount.forEach(row => {
      console.log(`   - ${row.status}: ${row.total}`)
    })
    console.log('')
    
    console.log('✅ Reset completed!')
    console.log('💡 Next steps:')
    console.log('   1. Restart PM2: pm2 restart all')
    console.log('   2. Wait for next task run (every 1 minute)')
    console.log('   3. Check logs: pm2 logs | grep Crypto')
    console.log('')
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

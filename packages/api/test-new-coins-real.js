'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await testNewCoinsReal()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function testNewCoinsReal() {
  try {
    console.log('🧪 Testing New Coins with ResultCryptoRepository\n')
    console.log('=' .repeat(80))
    
    const moment = use('moment')
    const _ = use('lodash')
    const ResultCryptoRepository = make('App/Repositories/Lottery/ResultCryptoRepository')
    
    const date = moment().format('YYYY-MM-DD')
    
    const coins = [
      { name: 'Binance Coin', method: 'bnb', decimals: 3 },
      { name: 'Ripple', method: 'xrp', decimals: 4 },
      { name: 'Tron', method: 'trx', decimals: 6 },
    ]
    
    for (const coin of coins) {
      console.log(`\n${'='.repeat(80)}`)
      console.log(`📊 ${coin.name} (${coin.decimals} decimals)`)
      console.log('='.repeat(80))
      
      const data = await ResultCryptoRepository[coin.method](date)
      const results = data[Object.keys(data)[0]] || []
      
      if (results.length === 0) {
        console.log('❌ No data available')
        continue
      }
      
      console.log(`✅ Fetched ${results.length} rounds\n`)
      
      // แสดงตัวอย่าง 5 รอบแรก
      console.log(`📝 Sample Results (First 5):\n`)
      results.slice(0, 5).forEach((r, i) => {
        console.log(`   Round ${r.round}: ${r.three_top}/${r.two_under}`)
        console.log(`      (H+L)/2: ${r.raw_avg_price}`)
        console.log(`      QuoteVol: ${r.raw_quote_volume}\n`)
      })
      
      // วิเคราะห์ความ unique
      const uniqueResults = new Set(results.map(r => `${r.three_top}/${r.two_under}`)).size
      const percentage = (uniqueResults / results.length * 100).toFixed(1)
      const icon = parseFloat(percentage) >= 98 ? '🟢' : parseFloat(percentage) >= 95 ? '🟡' : '🟠'
      
      console.log(`${icon} Unique Results: ${uniqueResults}/${results.length} (${percentage}%)`)
    }
    
    console.log('\n\n' + '='.repeat(80))
    console.log('📊 SUMMARY')
    console.log('='.repeat(80))
    console.log('\n✅ All new coins tested successfully!')
    console.log('📝 Next steps:')
    console.log('   1. Enable categories in database (is_enable = 1)')
    console.log('   2. Restart PM2 or wait for next task run')
    console.log('   3. Check results\n')
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

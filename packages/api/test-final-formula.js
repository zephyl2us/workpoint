'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await testFinalFormula()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function testFinalFormula() {
  try {
    console.log('🎯 Testing FINAL Formula\n')
    console.log('=' .repeat(80))
    console.log('สูตร:')
    console.log('  - 3 ตัวบน และ 2 ตัวบน: QuoteVolume ทศนิยม 3 ตำแหน่ง')
    console.log('  - 2 ตัวล่าง: Close Price ทศนิยม 2 ตำแหน่ง')
    console.log('=' .repeat(80))
    
    const moment = use('moment')
    const _ = use('lodash')
    const ResultCryptoRepository = make('App/Repositories/Lottery/ResultCryptoRepository')
    
    const date = moment().format('YYYY-MM-DD')
    
    const coins = [
      { name: 'Bitcoin (BTC)', method: 'btc' },
      { name: 'Ethereum (ETH)', method: 'eth' },
      { name: 'Cardano (ADA)', method: 'ada' },
      { name: 'Solana (SOL)', method: 'sol' },
      { name: 'Polkadot (DOT)', method: 'dot' },
      { name: 'Avalanche (AVAX)', method: 'avax' },
      { name: 'Binance Coin (BNB)', method: 'bnb' },
      { name: 'Ripple (XRP)', method: 'xrp' },
      { name: 'Tron (TRX)', method: 'trx' },
    ]
    
    const summaryResults = []
    
    for (const coin of coins) {
      console.log(`\n${'='.repeat(80)}`)
      console.log(`📊 ${coin.name}`)
      console.log('='.repeat(80))
      
      // ดึงข้อมูล
      const data = await ResultCryptoRepository[coin.method](date)
      const results = data[Object.keys(data)[0]] || []
      
      if (results.length === 0) {
        console.log('❌ No data available')
        continue
      }
      
      console.log(`✅ Fetched ${results.length} rounds\n`)
      
      // แสดงตัวอย่าง 3 รอบแรก
      console.log(`📝 Sample Results (First 3):\n`)
      results.slice(0, 3).forEach(r => {
        console.log(`   Round ${r.round}: ${r.three_top}/${r.two_under}`)
        console.log(`      Close: ${r.raw_close_price}`)
        console.log(`      QuoteVol: ${r.raw_quote_volume}\n`)
      })
      
      // วิเคราะห์ unique results
      const uniqueResults = new Set(results.map(r => `${r.three_top}/${r.two_under}`)).size
      const percentage = (uniqueResults / results.length * 100).toFixed(1)
      
      const icon = parseFloat(percentage) >= 98 ? '🟢' : parseFloat(percentage) >= 95 ? '🟡' : parseFloat(percentage) >= 90 ? '🟠' : '🔴'
      
      console.log(`${icon} Unique Results: ${uniqueResults}/${results.length} (${percentage}%)`)
      
      // ตรวจสอบผลซ้ำ
      const duplicates = {}
      results.forEach(r => {
        const key = `${r.three_top}/${r.two_under}`
        duplicates[key] = (duplicates[key] || 0) + 1
      })
      
      const dupEntries = Object.entries(duplicates).filter(([k, v]) => v > 1)
      if (dupEntries.length > 0) {
        console.log(`\n⚠️  Duplicate Results (${dupEntries.length}):`)
        dupEntries.slice(0, 3).forEach(([key, count]) => {
          console.log(`   "${key}" appears ${count} times`)
        })
      }
      
      summaryResults.push({
        coin: coin.name.split(' ')[0],
        unique: uniqueResults,
        total: results.length,
        percentage: parseFloat(percentage)
      })
    }
    
    // สรุป
    console.log('\n\n' + '='.repeat(80))
    console.log('📊 FINAL SUMMARY')
    console.log('='.repeat(80))
    console.log('\n🎯 สูตร: QuoteVolume (3 decimals) + Close Price (2 decimals)\n')
    
    summaryResults.forEach(r => {
      const icon = r.percentage >= 98 ? '🟢' : r.percentage >= 95 ? '🟡' : '🟠'
      console.log(`${icon} ${r.coin.padEnd(12)}: ${r.percentage.toFixed(1).padStart(5)}% (${r.unique}/${r.total})`)
    })
    
    const minPercentage = Math.min(...summaryResults.map(r => r.percentage))
    const avgPercentage = summaryResults.reduce((sum, r) => sum + r.percentage, 0) / summaryResults.length
    
    console.log(`\n📈 Minimum: ${minPercentage.toFixed(1)}%`)
    console.log(`📈 Average: ${avgPercentage.toFixed(1)}%`)
    
    const allAbove98 = summaryResults.every(r => r.percentage >= 98)
    const allAbove95 = summaryResults.every(r => r.percentage >= 95)
    
    if (allAbove98) {
      console.log('\n✅ SUCCESS! All coins achieve 98%+ unique results!')
    } else if (allAbove95) {
      console.log('\n🟡 Good! All coins achieve 95%+ unique results')
    } else {
      console.log(`\n⚠️  Some coins below 95%, minimum is ${minPercentage.toFixed(1)}%`)
    }
    
    console.log('\n✅ Testing completed!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await testNewFormula()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function testNewFormula() {
  try {
    console.log('🧪 Testing New Formula: (High+Low)/2 + QuoteVolume\n')
    console.log('=' .repeat(80))
    
    const moment = use('moment')
    const _ = use('lodash')
    const ResultCryptoRepository = make('App/Repositories/Lottery/ResultCryptoRepository')
    
    const date = moment().format('YYYY-MM-DD')
    
    const coins = [
      { name: 'Bitcoin (BTC)', method: 'btc', decimals: 3 },
      { name: 'Ethereum (ETH)', method: 'eth', decimals: 3 },
      { name: 'Cardano (ADA)', method: 'ada', decimals: 6 },
      { name: 'Solana (SOL)', method: 'sol', decimals: 3 },
      { name: 'Polkadot (DOT)', method: 'dot', decimals: 5 },
      { name: 'Avalanche (AVAX)', method: 'avax', decimals: 4 },
    ]
    
    for (const coin of coins) {
      console.log(`\n${'='.repeat(80)}`)
      console.log(`📊 ${coin.name} (${coin.decimals} decimals)`)
      console.log('='.repeat(80))
      
      // ดึงข้อมูล
      const data = await ResultCryptoRepository[coin.method](date)
      const results = data[Object.keys(data)[0]] || []
      
      if (results.length === 0) {
        console.log('❌ No data available')
        continue
      }
      
      console.log(`✅ Fetched ${results.length} rounds\n`)
      
      // วิเคราะห์ unique results
      const uniqueResults = new Set(results.map(r => `${r.three_top}/${r.two_under}`)).size
      const percentage = (uniqueResults / results.length * 100).toFixed(1)
      
      const icon = parseFloat(percentage) >= 98 ? '🟢' : parseFloat(percentage) >= 95 ? '🟡' : parseFloat(percentage) >= 90 ? '🟠' : '🔴'
      
      console.log(`${icon} Unique Results: ${uniqueResults}/${results.length} (${percentage}%)`)
      
      // แสดงตัวอย่าง
      console.log(`\n📝 Sample Results:`)
      results.slice(0, 5).forEach(r => {
        console.log(`   Round ${r.round}: ${r.three_top}/${r.two_under}`)
        console.log(`      High: ${r.raw_high}, Low: ${r.raw_low}`)
        console.log(`      Avg: ${r.raw_avg_price}`)
        console.log(`      QuoteVol: ${r.raw_quote_volume}`)
      })
      
      // ตรวจสอบผลซ้ำ
      const duplicates = {}
      results.forEach(r => {
        const key = `${r.three_top}/${r.two_under}`
        duplicates[key] = (duplicates[key] || 0) + 1
      })
      
      const dupEntries = Object.entries(duplicates).filter(([k, v]) => v > 1)
      if (dupEntries.length > 0) {
        console.log(`\n⚠️  Duplicate Results (${dupEntries.length}):`)
        dupEntries.slice(0, 5).forEach(([key, count]) => {
          console.log(`   "${key}" appears ${count} times`)
        })
      }
      
      // คำนวณ entropy
      const entropy = calculateEntropy(duplicates, results.length)
      console.log(`\n🔐 Entropy: ${entropy.toFixed(2)} bits (${(entropy/9.97*100).toFixed(1)}% of maximum)`)
    }
    
    console.log('\n\n' + '='.repeat(80))
    console.log('📊 SUMMARY')
    console.log('='.repeat(80))
    console.log('\n✅ All coins tested with (High+Low)/2 + QuoteVolume formula')
    console.log('   Using Decimal.js for precision')
    console.log('   Dynamic decimal precision per coin\n')
    
    console.log('✅ Testing completed!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

function calculateEntropy(counts, total) {
  let entropy = 0
  Object.values(counts).forEach(count => {
    const p = count / total
    if (p > 0) {
      entropy -= p * Math.log2(p)
    }
  })
  return entropy
}

'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await testSolution7AllCoins()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function testSolution7AllCoins() {
  try {
    console.log('🎯 Testing Solution 7: (High+Low)/2 + (QuoteVolume × 1.001)\n')
    console.log('   Using Decimal.js for precision')
    console.log('=' .repeat(80))
    
    const moment = use('moment')
    const _ = use('lodash')
    const BrowserRepository = make('App/Repositories/BrowserRepository')
    const Decimal = require('decimal.js')
    
    const date = moment().format('YYYY-MM-DD')
    const startTime = moment(`${date} 06:00:00`).valueOf()
    const endTime = moment(`${date} 06:00:00`).add(264 * 5, 'minutes').valueOf()
    
    const coins = [
      { name: 'Bitcoin (BTC)', symbol: 'BTCUSDT', priceDecimals: 3, volumeDecimals: 3 },
      { name: 'Ethereum (ETH)', symbol: 'ETHUSDT', priceDecimals: 3, volumeDecimals: 3 },
      { name: 'Cardano (ADA)', symbol: 'ADAUSDT', priceDecimals: 6, volumeDecimals: 6 },
      { name: 'Solana (SOL)', symbol: 'SOLUSDT', priceDecimals: 3, volumeDecimals: 3 },
      { name: 'Polkadot (DOT)', symbol: 'DOTUSDT', priceDecimals: 5, volumeDecimals: 5 },
      { name: 'Avalanche (AVAX)', symbol: 'AVAXUSDT', priceDecimals: 4, volumeDecimals: 4 },
    ]
    
    const summaryResults = []
    
    for (const coin of coins) {
      console.log(`\n${'='.repeat(80)}`)
      console.log(`📊 ${coin.name}`)
      console.log('='.repeat(80))
      
      const url = `https://api.binance.com/api/v3/klines`
      const options = {
        method: 'GET',
        uri: url,
        qs: {
          symbol: coin.symbol,
          interval: '5m',
          startTime: startTime,
          endTime: endTime,
          limit: 100
        },
        json: true
      }
      
      const klines = await BrowserRepository.request(options)
      
      if (!klines || klines.length === 0) {
        console.log('❌ No data')
        continue
      }
      
      console.log(`✅ Testing with ${klines.length} rounds\n`)
      
      const results = []
      
      klines.forEach((kline, index) => {
        // คำนวณ (High + Low) / 2 ด้วย Decimal.js
        const high = new Decimal(kline[2])
        const low = new Decimal(kline[3])
        const avgPrice = high.plus(low).dividedBy(2)
        const priceStr = avgPrice.toFixed(coin.priceDecimals)
        
        // คำนวณ QuoteVolume × 1.001 ด้วย Decimal.js
        const quoteVol = new Decimal(kline[7])
        const adjustedVol = quoteVol.times(1.001)
        const volumeStr = adjustedVol.toFixed(coin.volumeDecimals)
        
        // แปลงเป็น string format
        const [priceInt, priceDec] = priceStr.split('.')
        const priceDecPadded = (priceDec || '').padEnd(coin.priceDecimals, '0').substring(0, coin.priceDecimals)
        const finalPriceStr = priceInt + priceDecPadded
        
        const [volumeInt, volumeDec] = volumeStr.split('.')
        const volumeDecPadded = (volumeDec || '').padEnd(coin.volumeDecimals, '0').substring(0, coin.volumeDecimals)
        const finalVolumeStr = volumeInt + volumeDecPadded
        
        // จิ้มเลือกหลัก
        const three_top = finalPriceStr.slice(-4, -1).padStart(3, '0')
        const two_under = finalVolumeStr.slice(-2).padStart(2, '0')
        
        results.push(`${three_top}/${two_under}`)
        
        // แสดง debug สำหรับ 3 รอบแรก
        if (index < 3) {
          console.log(`   Round ${index + 1}: ${three_top}/${two_under}`)
          console.log(`      (H+L)/2: ${priceStr}`)
          console.log(`      QuoteVol × 1.001: ${volumeStr}`)
        }
      })
      
      const unique = new Set(results).size
      const percentage = (unique / klines.length * 100).toFixed(1)
      
      const icon = parseFloat(percentage) >= 98 ? '🟢' : parseFloat(percentage) >= 95 ? '🟡' : parseFloat(percentage) >= 90 ? '🟠' : '🔴'
      
      console.log(`\n${icon} Result: ${unique}/${klines.length} (${percentage}%)`)
      
      // นับผลซ้ำ
      const duplicates = {}
      results.forEach(r => {
        duplicates[r] = (duplicates[r] || 0) + 1
      })
      const dupCount = Object.values(duplicates).filter(v => v > 1).length
      
      if (dupCount > 0) {
        console.log(`   ⚠️  ${dupCount} duplicate results`)
      }
      
      summaryResults.push({
        coin: coin.name,
        unique,
        total: klines.length,
        percentage: parseFloat(percentage)
      })
    }
    
    // สรุป
    console.log('\n\n' + '='.repeat(80))
    console.log('📊 FINAL SUMMARY')
    console.log('='.repeat(80))
    console.log('\n🏆 Solution 7: (High+Low)/2 + (QuoteVolume × 1.001)\n')
    
    summaryResults.forEach(r => {
      const icon = r.percentage >= 98 ? '🟢' : r.percentage >= 95 ? '🟡' : '🟠'
      console.log(`${icon} ${r.coin}: ${r.percentage}% (${r.unique}/${r.total})`)
    })
    
    const allAbove98 = summaryResults.every(r => r.percentage >= 98)
    const minPercentage = Math.min(...summaryResults.map(r => r.percentage))
    
    console.log(`\n📈 Minimum: ${minPercentage.toFixed(1)}%`)
    
    if (allAbove98) {
      console.log('\n✅ SUCCESS! All coins achieve 98%+ unique results!')
    } else {
      console.log(`\n⚠️  Not all coins reach 98%, minimum is ${minPercentage.toFixed(1)}%`)
    }
    
    console.log('\n✅ Testing completed!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

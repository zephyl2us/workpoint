'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await testNewCoins()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function testNewCoins() {
  try {
    console.log('🔬 Testing New Coins: BNB, XRP, TRX\n')
    console.log('=' .repeat(80))
    
    const moment = use('moment')
    const _ = use('lodash')
    const BrowserRepository = make('App/Repositories/BrowserRepository')
    const Decimal = require('decimal.js')
    
    const date = moment().format('YYYY-MM-DD')
    const startTime = moment(`${date} 06:00:00`).valueOf()
    const endTime = moment(`${date} 06:00:00`).add(264 * 5, 'minutes').valueOf()
    
    const coins = [
      { name: 'Binance Coin (BNB)', symbol: 'BNBUSDT' },
      { name: 'Ripple (XRP)', symbol: 'XRPUSDT' },
      { name: 'Tron (TRX)', symbol: 'TRXUSDT' },
    ]
    
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
      
      console.log(`📡 Fetching ${coin.symbol} data...`)
      const klines = await BrowserRepository.request(options)
      
      if (!klines || klines.length === 0) {
        console.log('❌ No data')
        continue
      }
      
      console.log(`✅ Fetched ${klines.length} rounds\n`)
      
      // วิเคราะห์ราคา
      const prices = klines.map(k => parseFloat(k[4]))
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      
      console.log(`💰 Price Analysis:`)
      console.log(`   Min: $${minPrice}`)
      console.log(`   Max: $${maxPrice}`)
      console.log(`   Avg: $${avgPrice.toFixed(6)}`)
      
      // ตัวอย่างข้อมูล
      console.log(`\n📝 Sample Data (Round 1):`)
      console.log(`   High: ${klines[0][2]}`)
      console.log(`   Low: ${klines[0][3]}`)
      console.log(`   QuoteVolume: ${klines[0][7]}`)
      
      // แนะนำ decimal precision
      let recommendedDecimals = 3
      if (avgPrice >= 100) {
        recommendedDecimals = 3
      } else if (avgPrice >= 10) {
        recommendedDecimals = 3
      } else if (avgPrice >= 1) {
        recommendedDecimals = 4
      } else if (avgPrice >= 0.1) {
        recommendedDecimals = 5
      } else {
        recommendedDecimals = 6
      }
      
      console.log(`\n💡 Recommended Decimals: ${recommendedDecimals}`)
      
      // ทดสอบความ unique กับ decimals ต่างๆ
      console.log(`\n🧪 Testing Uniqueness:\n`)
      
      for (let decimals = 3; decimals <= 6; decimals++) {
        const results = []
        
        klines.forEach(kline => {
          const high = new Decimal(kline[2])
          const low = new Decimal(kline[3])
          const avgPrice = high.plus(low).dividedBy(2)
          const priceStr = avgPrice.toFixed(decimals)
          
          const quoteVol = new Decimal(kline[7])
          const adjustedVol = quoteVol.times(1.001)
          const volumeStr = adjustedVol.toFixed(decimals)
          
          const [priceInt, priceDec] = priceStr.split('.')
          const priceDecPadded = (priceDec || '').padEnd(decimals, '0').substring(0, decimals)
          const finalPriceStr = priceInt + priceDecPadded
          
          const [volumeInt, volumeDec] = volumeStr.split('.')
          const volumeDecPadded = (volumeDec || '').padEnd(decimals, '0').substring(0, decimals)
          const finalVolumeStr = volumeInt + volumeDecPadded
          
          const three_top = finalPriceStr.slice(-4, -1).padStart(3, '0')
          const two_under = finalVolumeStr.slice(-2).padStart(2, '0')
          
          results.push(`${three_top}/${two_under}`)
        })
        
        const unique = new Set(results).size
        const percentage = (unique / klines.length * 100).toFixed(1)
        const icon = parseFloat(percentage) >= 98 ? '🟢' : parseFloat(percentage) >= 95 ? '🟡' : '🟠'
        
        console.log(`${icon} ${decimals} decimals: ${unique}/${klines.length} (${percentage}%)`)
        
        if (decimals === recommendedDecimals || parseFloat(percentage) >= 98) {
          console.log(`   Samples: ${results.slice(0, 5).join(', ')}`)
        }
      }
    }
    
    console.log('\n\n' + '='.repeat(80))
    console.log('📊 RECOMMENDATIONS')
    console.log('='.repeat(80))
    console.log('\n✅ Add these configs to ResultCryptoRepository.js:\n')
    
    for (const coin of coins) {
      const url = `https://api.binance.com/api/v3/klines`
      const options = {
        method: 'GET',
        uri: url,
        qs: {
          symbol: coin.symbol,
          interval: '5m',
          startTime: startTime,
          endTime: endTime,
          limit: 10
        },
        json: true
      }
      
      const klines = await BrowserRepository.request(options)
      if (klines && klines.length > 0) {
        const price = parseFloat(klines[0][4])
        let decimals = 3
        if (price < 1) decimals = 4
        if (price < 0.1) decimals = 5
        if (price < 0.01) decimals = 6
        
        console.log(`${coin.symbol}: { priceDecimals: ${decimals}, volumeDecimals: ${decimals} },`)
      }
    }
    
    console.log('\n✅ Testing completed!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

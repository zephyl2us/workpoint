'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await testADASolutions()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function testADASolutions() {
  try {
    console.log('🔬 Finding Best Solution for ADA to reach 98%+\n')
    console.log('=' .repeat(80))
    
    const moment = use('moment')
    const _ = use('lodash')
    const BrowserRepository = make('App/Repositories/BrowserRepository')
    const Decimal = require('decimal.js')
    
    const date = moment().format('YYYY-MM-DD')
    const startTime = moment(`${date} 06:00:00`).valueOf()
    const endTime = moment(`${date} 06:00:00`).add(264 * 5, 'minutes').valueOf()
    
    const url = `https://api.binance.com/api/v3/klines`
    const options = {
      method: 'GET',
      uri: url,
      qs: {
        symbol: 'ADAUSDT',
        interval: '5m',
        startTime: startTime,
        endTime: endTime,
        limit: 100
      },
      json: true
    }
    
    console.log('📡 Fetching ADA data...\n')
    const klines = await BrowserRepository.request(options)
    
    if (!klines || klines.length === 0) {
      console.log('❌ No data')
      process.exit(1)
    }
    
    console.log(`✅ Fetched ${klines.length} rounds\n`)
    
    // ทดสอบ solutions ต่างๆ
    const solutions = [
      {
        name: '1. (H+L)/2 [6 decimals] + QuoteVol [6 decimals]',
        calc: (kline) => {
          const high = new Decimal(kline[2])
          const low = new Decimal(kline[3])
          const avg = high.plus(low).dividedBy(2)
          const price = avg.toFixed(6)
          const volume = new Decimal(kline[7]).toFixed(6)
          return { price, volume }
        }
      },
      {
        name: '2. (H+L)/2 [7 decimals] + QuoteVol [7 decimals]',
        calc: (kline) => {
          const high = new Decimal(kline[2])
          const low = new Decimal(kline[3])
          const avg = high.plus(low).dividedBy(2)
          const price = avg.toFixed(7)
          const volume = new Decimal(kline[7]).toFixed(7)
          return { price, volume }
        }
      },
      {
        name: '3. (H+L)/2 [8 decimals] + QuoteVol [8 decimals]',
        calc: (kline) => {
          const high = new Decimal(kline[2])
          const low = new Decimal(kline[3])
          const avg = high.plus(low).dividedBy(2)
          const price = avg.toFixed(8)
          const volume = new Decimal(kline[7]).toFixed(8)
          return { price, volume }
        }
      },
      {
        name: '4. (H+L)/2 [6 decimals] + TakerBuyQuoteVol [6 decimals]',
        calc: (kline) => {
          const high = new Decimal(kline[2])
          const low = new Decimal(kline[3])
          const avg = high.plus(low).dividedBy(2)
          const price = avg.toFixed(6)
          const volume = new Decimal(kline[10]).toFixed(6)
          return { price, volume }
        }
      },
      {
        name: '5. (H+L+O+C)/4 [6 decimals] + QuoteVol [6 decimals]',
        calc: (kline) => {
          const high = new Decimal(kline[2])
          const low = new Decimal(kline[3])
          const open = new Decimal(kline[1])
          const close = new Decimal(kline[4])
          const avg = high.plus(low).plus(open).plus(close).dividedBy(4)
          const price = avg.toFixed(6)
          const volume = new Decimal(kline[7]).toFixed(6)
          return { price, volume }
        }
      },
      {
        name: '6. Close [6 decimals] + (QuoteVol + NumTrades) [6 decimals]',
        calc: (kline) => {
          const price = new Decimal(kline[4]).toFixed(6)
          const quoteVol = new Decimal(kline[7])
          const numTrades = new Decimal(kline[8])
          const combined = quoteVol.plus(numTrades).toFixed(6)
          return { price, volume: combined }
        }
      },
      {
        name: '7. (H+L)/2 [6 decimals] + (QuoteVol × 1.001) [6 decimals]',
        calc: (kline) => {
          const high = new Decimal(kline[2])
          const low = new Decimal(kline[3])
          const avg = high.plus(low).dividedBy(2)
          const price = avg.toFixed(6)
          const volume = new Decimal(kline[7]).times(1.001).toFixed(6)
          return { price, volume }
        }
      },
    ]
    
    console.log('📊 Testing Solutions:\n')
    
    for (const solution of solutions) {
      const results = []
      
      klines.forEach(kline => {
        const data = solution.calc(kline)
        
        const [priceInt, priceDec] = data.price.split('.')
        const priceDecPadded = (priceDec || '').padEnd(6, '0').substring(0, 6)
        const priceStr = priceInt + priceDecPadded
        
        const [volumeInt, volumeDec] = data.volume.split('.')
        const volumeDecPadded = (volumeDec || '').padEnd(6, '0').substring(0, 6)
        const volumeStr = volumeInt + volumeDecPadded
        
        const three_top = priceStr.slice(-4, -1).padStart(3, '0')
        const two_under = volumeStr.slice(-2).padStart(2, '0')
        
        results.push(`${three_top}/${two_under}`)
      })
      
      const unique = new Set(results).size
      const percentage = (unique / klines.length * 100).toFixed(1)
      
      const icon = parseFloat(percentage) >= 98 ? '🟢' : parseFloat(percentage) >= 95 ? '🟡' : parseFloat(percentage) >= 90 ? '🟠' : '🔴'
      
      console.log(`${icon} ${solution.name}`)
      console.log(`   Unique: ${unique}/${klines.length} (${percentage}%)`)
      console.log(`   Samples: ${results.slice(0, 5).join(', ')}`)
      console.log('')
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('📊 RECOMMENDATIONS FOR ADA')
    console.log('='.repeat(80))
    console.log('\n💡 If 98%+ is mandatory:')
    console.log('   → May need to remove ADA or accept 91-96% range')
    console.log('   → Or use complex hybrid formula')
    console.log('\n✅ Testing completed!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

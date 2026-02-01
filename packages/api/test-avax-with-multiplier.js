'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await testAVAXWithMultiplier()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function testAVAXWithMultiplier() {
  try {
    console.log('🔬 Testing AVAX with (H+L)/2 + (QuoteVol × 1.001)\n')
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
        symbol: 'AVAXUSDT',
        interval: '5m',
        startTime: startTime,
        endTime: endTime,
        limit: 100
      },
      json: true
    }
    
    console.log('📡 Fetching AVAX data...\n')
    const klines = await BrowserRepository.request(options)
    
    if (!klines || klines.length === 0) {
      console.log('❌ No data')
      process.exit(1)
    }
    
    console.log(`✅ Fetched ${klines.length} rounds\n`)
    console.log('📊 Testing Different Configurations:\n')
    
    const configs = [
      { decimals: 3, multiplier: 1.001, name: '3 decimals × 1.001' },
      { decimals: 3, multiplier: 1.01, name: '3 decimals × 1.01' },
      { decimals: 3, multiplier: 1.1, name: '3 decimals × 1.1' },
      { decimals: 4, multiplier: 1.001, name: '4 decimals × 1.001' },
      { decimals: 4, multiplier: 1.01, name: '4 decimals × 1.01' },
      { decimals: 5, multiplier: 1.001, name: '5 decimals × 1.001' },
    ]
    
    for (const config of configs) {
      const results = []
      
      klines.forEach(kline => {
        const high = new Decimal(kline[2])
        const low = new Decimal(kline[3])
        const avgPrice = high.plus(low).dividedBy(2)
        const priceStr = avgPrice.toFixed(config.decimals)
        
        const quoteVol = new Decimal(kline[7])
        const adjustedVol = quoteVol.times(config.multiplier)
        const volumeStr = adjustedVol.toFixed(config.decimals)
        
        const [priceInt, priceDec] = priceStr.split('.')
        const priceDecPadded = (priceDec || '').padEnd(config.decimals, '0').substring(0, config.decimals)
        const finalPriceStr = priceInt + priceDecPadded
        
        const [volumeInt, volumeDec] = volumeStr.split('.')
        const volumeDecPadded = (volumeDec || '').padEnd(config.decimals, '0').substring(0, config.decimals)
        const finalVolumeStr = volumeInt + volumeDecPadded
        
        const three_top = finalPriceStr.slice(-4, -1).padStart(3, '0')
        const two_under = finalVolumeStr.slice(-2).padStart(2, '0')
        
        results.push(`${three_top}/${two_under}`)
      })
      
      const unique = new Set(results).size
      const percentage = (unique / klines.length * 100).toFixed(1)
      const icon = parseFloat(percentage) >= 98 ? '🟢' : parseFloat(percentage) >= 95 ? '🟡' : '🟠'
      
      console.log(`${icon} ${config.name}: ${unique}/${klines.length} (${percentage}%)`)
      console.log(`   Samples: ${results.slice(0, 5).join(', ')}`)
      
      if (parseFloat(percentage) >= 98) {
        console.log(`   ✅ This achieves 98%+!`)
      }
      console.log('')
    }
    
    console.log('✅ Testing completed!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

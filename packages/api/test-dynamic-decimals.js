'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await testDynamicDecimals()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function testDynamicDecimals() {
  try {
    console.log('🎯 Testing Dynamic Decimal Precision\n')
    console.log('=' .repeat(80))
    
    const moment = use('moment')
    const _ = use('lodash')
    const BrowserRepository = make('App/Repositories/BrowserRepository')
    
    const date = moment().format('YYYY-MM-DD')
    const startTime = moment(`${date} 06:00:00`).valueOf()
    const endTime = moment(`${date} 06:00:00`).add(264 * 5, 'minutes').valueOf()
    
    const coins = [
      { name: 'Bitcoin (BTC)', symbol: 'BTCUSDT', priceDecimals: 3, volumeDecimals: 3 },
      { name: 'Ethereum (ETH)', symbol: 'ETHUSDT', priceDecimals: 3, volumeDecimals: 3 },
      { name: 'Cardano (ADA)', symbol: 'ADAUSDT', priceDecimals: 6, volumeDecimals: 6 }, // เพิ่ม!
      { name: 'Solana (SOL)', symbol: 'SOLUSDT', priceDecimals: 3, volumeDecimals: 3 },
      { name: 'Polkadot (DOT)', symbol: 'DOTUSDT', priceDecimals: 5, volumeDecimals: 5 }, // เพิ่ม!
      { name: 'Avalanche (AVAX)', symbol: 'AVAXUSDT', priceDecimals: 4, volumeDecimals: 4 }, // เพิ่มเล็กน้อย
    ]
    
    const formulas = [
      { name: 'Close + QuoteVolume', priceIdx: 4, volumeIdx: 7 },
      { name: '(High+Low)/2 + QuoteVolume', priceIdx: 'HL', volumeIdx: 7 },
      { name: 'Close + TakerBuyQuoteVolume', priceIdx: 4, volumeIdx: 10 },
    ]
    
    for (const coin of coins) {
      console.log(`\n${'='.repeat(80)}`)
      console.log(`📊 ${coin.name} (Price decimals: ${coin.priceDecimals}, Volume decimals: ${coin.volumeDecimals})`)
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
      
      for (const formula of formulas) {
        const results = []
        
        klines.forEach(kline => {
          let price
          if (formula.priceIdx === 'HL') {
            const high = parseFloat(kline[2])
            const low = parseFloat(kline[3])
            price = ((high + low) / 2).toFixed(8)
          } else {
            price = kline[formula.priceIdx]
          }
          
          const volume = kline[formula.volumeIdx]
          
          // ใช้ decimal precision ตามที่กำหนด
          const [priceInt, priceDec] = price.toString().split('.')
          const priceDecPadded = (priceDec || '').padEnd(coin.priceDecimals, '0').substring(0, coin.priceDecimals)
          const priceStr = priceInt + priceDecPadded
          
          const [volumeInt, volumeDec] = volume.toString().split('.')
          const volumeDecPadded = (volumeDec || '').padEnd(coin.volumeDecimals, '0').substring(0, coin.volumeDecimals)
          const volumeStr = volumeInt + volumeDecPadded
          
          // จิ้มเลือกหลัก
          const three_top = priceStr.slice(-4, -1).padStart(3, '0')
          const two_under = volumeStr.slice(-2).padStart(2, '0')
          
          results.push(`${three_top}/${two_under}`)
        })
        
        const unique = new Set(results).size
        const percentage = (unique / klines.length * 100).toFixed(1)
        const icon = parseFloat(percentage) >= 98 ? '🟢' : parseFloat(percentage) >= 95 ? '🟡' : parseFloat(percentage) >= 90 ? '🟠' : '🔴'
        
        console.log(`${icon} ${formula.name}: ${unique}/${klines.length} (${percentage}%)`)
        if (parseFloat(percentage) >= 95) {
          console.log(`   Sample results: ${results.slice(0, 5).join(', ')}`)
        }
      }
    }
    
    console.log('\n\n' + '='.repeat(80))
    console.log('💡 RECOMMENDATIONS')
    console.log('='.repeat(80))
    console.log('\nใช้ Dynamic Decimal Precision:')
    console.log('  - BTC, ETH, SOL: 3 decimals (ราคาสูง)')
    console.log('  - AVAX: 4 decimals (ราคาปานกลาง)')
    console.log('  - DOT: 5 decimals (ราคาต่ำ)')
    console.log('  - ADA: 6 decimals (ราคาต่ำมาก)')
    console.log('\nใช้ QuoteAssetVolume หรือ TakerBuyQuoteVolume สำหรับ 2 ตัวล่าง')
    
    console.log('\n✅ Analysis completed!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

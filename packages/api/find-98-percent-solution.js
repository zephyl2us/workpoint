'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await find98PercentSolution()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function find98PercentSolution() {
  try {
    console.log('🎯 Finding 98%+ Unique Results Solution\n')
    console.log('=' .repeat(80))
    
    const moment = use('moment')
    const _ = use('lodash')
    const BrowserRepository = make('App/Repositories/BrowserRepository')
    
    const date = moment().format('YYYY-MM-DD')
    const startTime = moment(`${date} 06:00:00`).valueOf()
    const endTime = moment(`${date} 06:00:00`).add(264 * 5, 'minutes').valueOf()
    
    const coins = [
      { name: 'Bitcoin (BTC)', symbol: 'BTCUSDT' },
      { name: 'Ethereum (ETH)', symbol: 'ETHUSDT' },
      { name: 'Cardano (ADA)', symbol: 'ADAUSDT' },
      { name: 'Solana (SOL)', symbol: 'SOLUSDT' },
      { name: 'Polkadot (DOT)', symbol: 'DOTUSDT' },
      { name: 'Avalanche (AVAX)', symbol: 'AVAXUSDT' },
    ]
    
    // ทดสอบ formulas ต่างๆ
    const formulas = [
      {
        name: '1. Close + Volume (ปัจจุบัน)',
        calc: (kline) => ({
          price: kline[4],
          volume: kline[5]
        })
      },
      {
        name: '2. Close + QuoteVolume',
        calc: (kline) => ({
          price: kline[4],
          volume: kline[7]
        })
      },
      {
        name: '3. (High+Low) + QuoteVolume',
        calc: (kline) => {
          const high = parseFloat(kline[2])
          const low = parseFloat(kline[3])
          return {
            price: ((high + low) / 2).toFixed(8),
            volume: kline[7]
          }
        }
      },
      {
        name: '4. (Open+Close) + QuoteVolume',
        calc: (kline) => {
          const open = parseFloat(kline[1])
          const close = parseFloat(kline[4])
          return {
            price: ((open + close) / 2).toFixed(8),
            volume: kline[7]
          }
        }
      },
      {
        name: '5. (High+Low+Close) + QuoteVolume',
        calc: (kline) => {
          const high = parseFloat(kline[2])
          const low = parseFloat(kline[3])
          const close = parseFloat(kline[4])
          return {
            price: ((high + low + close) / 3).toFixed(8),
            volume: kline[7]
          }
        }
      },
      {
        name: '6. Close + (QuoteVolume × timestamp%)',
        calc: (kline) => {
          const timestamp = kline[0]
          const quoteVol = parseFloat(kline[7])
          const seed = (timestamp % 1000) / 1000
          const modifiedVol = (quoteVol * (1 + seed)).toFixed(8)
          return {
            price: kline[4],
            volume: modifiedVol
          }
        }
      },
      {
        name: '7. Close + TakerBuyQuoteVolume',
        calc: (kline) => ({
          price: kline[4],
          volume: kline[10]
        })
      },
      {
        name: '8. (High+Low) + TakerBuyQuoteVolume',
        calc: (kline) => {
          const high = parseFloat(kline[2])
          const low = parseFloat(kline[3])
          return {
            price: ((high + low) / 2).toFixed(8),
            volume: kline[10]
          }
        }
      },
    ]
    
    const allResults = []
    
    for (const coin of coins) {
      console.log(`\n${'='.repeat(80)}`)
      console.log(`📊 Testing: ${coin.name}`)
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
      
      const coinResults = { coin: coin.name, symbol: coin.symbol, formulas: {} }
      
      for (const formula of formulas) {
        const results = []
        
        klines.forEach(kline => {
          const data = formula.calc(kline)
          const price = data.price.toString()
          const volume = data.volume.toString()
          
          const [priceInt, priceDec] = price.split('.')
          const priceDecPadded = (priceDec || '').padEnd(3, '0').substring(0, 3)
          const priceStr = priceInt + priceDecPadded
          
          const [volumeInt, volumeDec] = volume.split('.')
          const volumeDecPadded = (volumeDec || '').padEnd(3, '0').substring(0, 3)
          const volumeStr = volumeInt + volumeDecPadded
          
          const three_top = priceStr.slice(-4, -1).padStart(3, '0')
          const two_under = volumeStr.slice(-2).padStart(2, '0')
          
          results.push(`${three_top}/${two_under}`)
        })
        
        const unique = new Set(results).size
        const percentage = (unique / klines.length * 100).toFixed(1)
        
        coinResults.formulas[formula.name] = {
          unique,
          total: klines.length,
          percentage: parseFloat(percentage)
        }
        
        const icon = parseFloat(percentage) >= 98 ? '🟢' : parseFloat(percentage) >= 95 ? '🟡' : parseFloat(percentage) >= 90 ? '🟠' : '🔴'
        console.log(`${icon} ${formula.name}: ${unique}/${klines.length} (${percentage}%)`)
      }
      
      allResults.push(coinResults)
    }
    
    // สรุป
    console.log('\n\n' + '='.repeat(80))
    console.log('📊 SUMMARY - Formulas that achieve 98%+ for ALL coins')
    console.log('='.repeat(80))
    
    const formulaNames = Object.keys(allResults[0].formulas)
    
    for (const formulaName of formulaNames) {
      const percentages = allResults.map(coin => coin.formulas[formulaName].percentage)
      const minPercentage = _.min(percentages)
      const avgPercentage = _.mean(percentages)
      
      if (minPercentage >= 98) {
        console.log(`\n🏆 ${formulaName}`)
        console.log(`   Min: ${minPercentage.toFixed(1)}%, Avg: ${avgPercentage.toFixed(1)}%`)
        allResults.forEach(coin => {
          const data = coin.formulas[formulaName]
          console.log(`   - ${coin.name}: ${data.percentage}% (${data.unique}/${data.total})`)
        })
      } else if (minPercentage >= 95) {
        console.log(`\n🥈 ${formulaName}`)
        console.log(`   Min: ${minPercentage.toFixed(1)}%, Avg: ${avgPercentage.toFixed(1)}% (ใกล้เคียง 98%)`)
        allResults.forEach(coin => {
          const data = coin.formulas[formulaName]
          const icon = data.percentage >= 98 ? '✅' : data.percentage >= 95 ? '⚠️' : '❌'
          console.log(`   ${icon} ${coin.name}: ${data.percentage}% (${data.unique}/${data.total})`)
        })
      }
    }
    
    // หา formula ที่ดีที่สุด
    console.log('\n\n' + '='.repeat(80))
    console.log('🎯 RECOMMENDED SOLUTION')
    console.log('='.repeat(80))
    
    let bestFormula = null
    let bestMinPercentage = 0
    
    for (const formulaName of formulaNames) {
      const percentages = allResults.map(coin => coin.formulas[formulaName].percentage)
      const minPercentage = _.min(percentages)
      
      if (minPercentage > bestMinPercentage) {
        bestMinPercentage = minPercentage
        bestFormula = formulaName
      }
    }
    
    if (bestMinPercentage >= 98) {
      console.log(`\n✅ พบ formula ที่ได้ 98%+ สำหรับทุกเหรียญ!\n`)
      console.log(`🏆 Best Formula: ${bestFormula}`)
      console.log(`   Minimum: ${bestMinPercentage.toFixed(1)}%`)
    } else {
      console.log(`\n⚠️  ไม่มี formula ใดที่ได้ 98%+ สำหรับทุกเหรียญ`)
      console.log(`   Best formula: ${bestFormula} (${bestMinPercentage.toFixed(1)}%)`)
      console.log(`\n💡 คำแนะนำ:`)
      console.log(`   1. ใช้ formula ที่ดีที่สุด (${bestMinPercentage.toFixed(1)}%)`)
      console.log(`   2. หรือใช้ formula แบบ dynamic ตามเหรียญ`)
      console.log(`   3. หรือใช้เฉพาะเหรียญที่ได้ 98%+`)
    }
    
    console.log('\n✅ Analysis completed!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

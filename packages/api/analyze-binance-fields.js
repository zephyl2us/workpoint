'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await analyzeBinanceFields()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function analyzeBinanceFields() {
  try {
    console.log('🔬 Analyzing ALL Binance API Fields\n')
    console.log('=' .repeat(80))
    
    const moment = use('moment')
    const _ = use('lodash')
    const BrowserRepository = make('App/Repositories/BrowserRepository')
    
    const date = moment().format('YYYY-MM-DD')
    const startTime = moment(`${date} 06:00:00`).valueOf()
    const endTime = moment(`${date} 06:00:00`).add(264 * 5, 'minutes').valueOf()
    
    const coins = [
      { name: 'Bitcoin (BTC)', symbol: 'BTCUSDT' },
      { name: 'Cardano (ADA)', symbol: 'ADAUSDT' },  // ตัวที่มีปัญหา
      { name: 'Polkadot (DOT)', symbol: 'DOTUSDT' }, // ตัวที่มีปัญหา
    ]
    
    for (const coin of coins) {
      console.log(`\n${'='.repeat(80)}`)
      console.log(`📊 Analyzing: ${coin.name} (${coin.symbol})`)
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
          limit: 50  // เอาแค่ 50 รอบก่อน
        },
        json: true
      }
      
      const results = await BrowserRepository.request(options)
      
      if (!results || results.length === 0) {
        console.log('❌ No data')
        continue
      }
      
      console.log(`✅ Fetched ${results.length} rounds\n`)
      
      // แสดงโครงสร้างข้อมูล
      console.log('📋 Binance Kline Data Structure:')
      console.log('   [0] openTime: ', results[0][0])
      console.log('   [1] open: ', results[0][1])
      console.log('   [2] high: ', results[0][2])
      console.log('   [3] low: ', results[0][3])
      console.log('   [4] close: ', results[0][4])
      console.log('   [5] volume: ', results[0][5])
      console.log('   [6] closeTime: ', results[0][6])
      console.log('   [7] quoteAssetVolume (มูลค่าซื้อขาย): ', results[0][7])
      console.log('   [8] numberOfTrades (จำนวนคำสั่ง): ', results[0][8])
      console.log('   [9] takerBuyBaseAssetVolume: ', results[0][9])
      console.log('   [10] takerBuyQuoteAssetVolume: ', results[0][10])
      
      // วิเคราะห์แต่ละ field
      const fields = [
        { name: 'Open', index: 1 },
        { name: 'High', index: 2 },
        { name: 'Low', index: 3 },
        { name: 'Close', index: 4 },
        { name: 'Volume', index: 5 },
        { name: 'QuoteAssetVolume (มูลค่า)', index: 7 },
        { name: 'NumberOfTrades (จำนวนคำสั่ง)', index: 8 },
        { name: 'TakerBuyBaseVolume', index: 9 },
        { name: 'TakerBuyQuoteVolume', index: 10 },
      ]
      
      console.log('\n📊 Field Analysis:\n')
      
      for (const field of fields) {
        const values = results.map(r => parseFloat(r[field.index]))
        
        const min = _.min(values)
        const max = _.max(values)
        const avg = _.mean(values)
        const stdDev = Math.sqrt(_.mean(values.map(v => Math.pow(v - avg, 2))))
        
        // นับการเปลี่ยนแปลง
        let changes = 0
        for (let i = 1; i < values.length; i++) {
          if (values[i] !== values[i-1]) changes++
        }
        const changeRate = (changes / (values.length - 1) * 100).toFixed(1)
        
        // นับ unique values
        const uniqueValues = new Set(values).size
        const uniqueRate = (uniqueValues / values.length * 100).toFixed(1)
        
        // ตรวจสอบทศนิยม
        const decimalInfo = analyzeDecimals(values)
        
        console.log(`🔹 ${field.name}:`)
        console.log(`   Range: ${min.toFixed(8)} - ${max.toFixed(8)}`)
        console.log(`   Std Dev: ${stdDev.toFixed(8)} (${(stdDev/avg*100).toFixed(2)}% of avg)`)
        console.log(`   Change Rate: ${changeRate}% (${changes}/${values.length-1} รอบ)`)
        console.log(`   Unique Values: ${uniqueValues}/${values.length} (${uniqueRate}%)`)
        console.log(`   Decimal Info: ${decimalInfo}`)
        console.log('')
      }
      
      // แนะนำ field ที่ดีที่สุด
      console.log('\n💡 Recommendations:')
      
      // วิเคราะห์ว่าควรใช้ field ไหน
      const quoteVolumes = results.map(r => parseFloat(r[7]))
      const numberOfTrades = results.map(r => parseFloat(r[8]))
      
      const quoteUnique = new Set(quoteVolumes).size
      const tradesUnique = new Set(numberOfTrades).size
      
      console.log(`   📈 QuoteAssetVolume (มูลค่า): ${quoteUnique}/${results.length} unique (${(quoteUnique/results.length*100).toFixed(1)}%)`)
      console.log(`   🔢 NumberOfTrades (จำนวนคำสั่ง): ${tradesUnique}/${results.length} unique (${(tradesUnique/results.length*100).toFixed(1)}%)`)
      
      // ทดสอบใช้ QuoteAssetVolume
      console.log('\n🧪 Testing with QuoteAssetVolume:')
      testFormula(results, 4, 7, 'Close + QuoteVolume')
      
      console.log('\n🧪 Testing with NumberOfTrades:')
      testFormula(results, 4, 8, 'Close + NumberOfTrades')
      
      console.log('\n🧪 Testing with Combined (High + Low):')
      testFormulaCombined(results, [2, 3], 7, 'High+Low + QuoteVolume')
    }
    
    console.log('\n\n' + '='.repeat(80))
    console.log('📊 FINAL RECOMMENDATIONS')
    console.log('='.repeat(80))
    console.log('\n💡 Best Options:')
    console.log('   1. ใช้ QuoteAssetVolume (มูลค่าการซื้อขาย) แทน Volume')
    console.log('      → มีความหลากหลายสูงมาก แม้กับเหรียญราคาต่ำ')
    console.log('   2. ใช้ NumberOfTrades (จำนวนคำสั่งซื้อขาย)')
    console.log('      → เปลี่ยนแปลงทุกรอบ คาดเดาไม่ได้')
    console.log('   3. ใช้ High + Low รวมกัน')
    console.log('      → เพิ่มความสุ่ม ใช้ข้อมูลทั้งช่วง')
    console.log('\n✅ Analysis completed!')
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

function analyzeDecimals(values) {
  const strValues = values.map(v => v.toFixed(8))
  let maxNonZeroDecimal = 0
  
  strValues.forEach(str => {
    const [int, dec] = str.split('.')
    if (dec) {
      for (let i = dec.length - 1; i >= 0; i--) {
        if (dec[i] !== '0') {
          maxNonZeroDecimal = Math.max(maxNonZeroDecimal, i + 1)
          break
        }
      }
    }
  })
  
  return `มีทศนิยมมากสุด ${maxNonZeroDecimal} ตำแหน่ง`
}

function testFormula(results, priceIndex, volumeIndex, name) {
  const resultsArray = []
  
  results.forEach(kline => {
    const price = kline[priceIndex].toString()
    const volume = kline[volumeIndex].toString()
    
    const [priceInt, priceDec] = price.split('.')
    const priceDecPadded = (priceDec || '').padEnd(3, '0').substring(0, 3)
    const priceStr = priceInt + priceDecPadded
    
    const [volumeInt, volumeDec] = volume.split('.')
    const volumeDecPadded = (volumeDec || '').padEnd(3, '0').substring(0, 3)
    const volumeStr = volumeInt + volumeDecPadded
    
    const three_top = priceStr.slice(-4, -1).padStart(3, '0')
    const two_under = volumeStr.slice(-2).padStart(2, '0')
    
    resultsArray.push(`${three_top}/${two_under}`)
  })
  
  const unique = new Set(resultsArray).size
  console.log(`   ${name}: ${unique}/${results.length} unique results (${(unique/results.length*100).toFixed(1)}%)`)
  console.log(`   Samples: ${resultsArray.slice(0, 5).join(', ')}`)
}

function testFormulaCombined(results, priceIndexes, volumeIndex, name) {
  const resultsArray = []
  
  results.forEach(kline => {
    // รวม high + low
    const high = parseFloat(kline[priceIndexes[0]])
    const low = parseFloat(kline[priceIndexes[1]])
    const combined = (high + low).toFixed(8)
    
    const volume = kline[volumeIndex].toString()
    
    const [priceInt, priceDec] = combined.split('.')
    const priceDecPadded = (priceDec || '').padEnd(3, '0').substring(0, 3)
    const priceStr = priceInt + priceDecPadded
    
    const [volumeInt, volumeDec] = volume.split('.')
    const volumeDecPadded = (volumeDec || '').padEnd(3, '0').substring(0, 3)
    const volumeStr = volumeInt + volumeDecPadded
    
    const three_top = priceStr.slice(-4, -1).padStart(3, '0')
    const two_under = volumeStr.slice(-2).padStart(2, '0')
    
    resultsArray.push(`${three_top}/${two_under}`)
  })
  
  const unique = new Set(resultsArray).size
  console.log(`   ${name}: ${unique}/${results.length} unique results (${(unique/results.length*100).toFixed(1)}%)`)
  console.log(`   Samples: ${resultsArray.slice(0, 5).join(', ')}`)
}

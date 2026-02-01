'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await testDecimalPrecision()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function testDecimalPrecision() {
  try {
    console.log('🧪 Testing Decimal Precision from Binance API\n')
    
    const moment = use('moment')
    const ResultCryptoRepository = make('App/Repositories/Lottery/ResultCryptoRepository')
    
    const date = moment().format('YYYY-MM-DD')
    
    console.log(`📡 Fetching BTC data for ${date}...\n`)
    
    // ดึงข้อมูล BTC
    const btcData = await ResultCryptoRepository.getCryptoResultByDate('BTCUSDT', date)
    const results = btcData['btc_5min'] || []
    
    if (results.length === 0) {
      console.log('❌ No data available')
      process.exit(1)
    }
    
    console.log(`✅ Fetched ${results.length} rounds\n`)
    console.log('📊 Analyzing decimal precision...\n')
    
    // วิเคราะห์ทศนิยม
    const decimalStats = {
      twoDigits: { count: 0, samples: [] },
      threeDigits: { count: 0, samples: [] },
      fourPlusDigits: { count: 0, samples: [] }
    }
    
    const uniqueResults = {
      twoDigits: new Set(),
      threeDigits: new Set()
    }
    
    results.slice(0, 50).forEach((result, index) => {
      const price = result.raw_close_price
      const [intPart, decPart] = price.split('.')
      
      if (!decPart) return
      
      // หาตำแหน่งที่ไม่ใช่ 0
      const significantDec = decPart.replace(/0+$/, '')
      const decLength = significantDec.length
      
      // คำนวณผลแบบ 2 ตำแหน่ง
      const twoDigit = (decPart || '').padEnd(2, '0').substring(0, 2)
      const twoDigitInt = parseInt(intPart + twoDigit)
      const twoDigitResult = (twoDigitInt % 1000).toString().padStart(3, '0')
      uniqueResults.twoDigits.add(twoDigitResult)
      
      // คำนวณผลแบบ 3 ตำแหน่ง
      const threeDigit = (decPart || '').padEnd(3, '0').substring(0, 3)
      const threeDigitInt = parseInt(intPart + threeDigit)
      const threeDigitResult = (threeDigitInt % 1000).toString().padStart(3, '0')
      uniqueResults.threeDigits.add(threeDigitResult)
      
      if (decLength <= 2) {
        decimalStats.twoDigits.count++
        if (decimalStats.twoDigits.samples.length < 5) {
          decimalStats.twoDigits.samples.push({ round: result.round, price, decPart: significantDec })
        }
      } else if (decLength === 3) {
        decimalStats.threeDigits.count++
        if (decimalStats.threeDigits.samples.length < 5) {
          decimalStats.threeDigits.samples.push({ round: result.round, price, decPart: significantDec })
        }
      } else {
        decimalStats.fourPlusDigits.count++
        if (decimalStats.fourPlusDigits.samples.length < 5) {
          decimalStats.fourPlusDigits.samples.push({ round: result.round, price, decPart: significantDec })
        }
      }
    })
    
    const total = results.slice(0, 50).length
    
    console.log('📈 Decimal Precision Analysis (First 50 rounds):')
    console.log(`   2 ตำแหน่งหรือน้อยกว่า: ${decimalStats.twoDigits.count}/${total} (${(decimalStats.twoDigits.count/total*100).toFixed(1)}%)`)
    console.log(`   3 ตำแหน่งพอดี: ${decimalStats.threeDigits.count}/${total} (${(decimalStats.threeDigits.count/total*100).toFixed(1)}%)`)
    console.log(`   4 ตำแหน่งขึ้นไป: ${decimalStats.fourPlusDigits.count}/${total} (${(decimalStats.fourPlusDigits.count/total*100).toFixed(1)}%)`)
    console.log('')
    
    console.log('🎯 Unique Results Comparison:')
    console.log(`   ใช้ทศนิยม 2 ตำแหน่ง: ${uniqueResults.twoDigits.size} unique results`)
    console.log(`   ใช้ทศนิยม 3 ตำแหน่ง: ${uniqueResults.threeDigits.size} unique results`)
    console.log(`   เพิ่มขึ้น: +${uniqueResults.threeDigits.size - uniqueResults.twoDigits.size} results (${((uniqueResults.threeDigits.size - uniqueResults.twoDigits.size) / uniqueResults.twoDigits.size * 100).toFixed(1)}%)`)
    console.log('')
    
    if (decimalStats.twoDigits.samples.length > 0) {
      console.log('📝 Samples (2 ตำแหน่ง):')
      decimalStats.twoDigits.samples.forEach(s => {
        console.log(`   Round ${s.round}: ${s.price} (dec: "${s.decPart}")`)
      })
      console.log('')
    }
    
    if (decimalStats.threeDigits.samples.length > 0) {
      console.log('📝 Samples (3 ตำแหน่ง):')
      decimalStats.threeDigits.samples.forEach(s => {
        console.log(`   Round ${s.round}: ${s.price} (dec: "${s.decPart}")`)
      })
      console.log('')
    }
    
    if (decimalStats.fourPlusDigits.samples.length > 0) {
      console.log('📝 Samples (4+ ตำแหน่ง):')
      decimalStats.fourPlusDigits.samples.forEach(s => {
        console.log(`   Round ${s.round}: ${s.price} (dec: "${s.decPart}")`)
      })
      console.log('')
    }
    
    console.log('💡 Recommendation:')
    if (uniqueResults.threeDigits.size > uniqueResults.twoDigits.size * 1.3) {
      console.log('   ✅ ใช้ x1000 (3 ตำแหน่ง) จะดีกว่า - เพิ่มความหลากหลายของผลลัพธ์มาก')
    } else if (uniqueResults.threeDigits.size > uniqueResults.twoDigits.size * 1.1) {
      console.log('   👍 ใช้ x1000 (3 ตำแหน่ง) ก็ได้ - เพิ่มความหลากหลายได้บ้าง')
    } else {
      console.log('   ⚠️  ใช้ x100 (2 ตำแหน่ง) น่าจะเหมาะกว่า - เพิ่ม 3 ตำแหน่งไม่ได้เพิ่มความหลากหลายมากพอ')
    }
    
    console.log('')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

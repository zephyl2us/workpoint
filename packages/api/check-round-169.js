'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await checkRound169()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function checkRound169() {
  try {
    console.log('🔍 Checking Round 169...\n')
    
    const Lottery = use('App/Models/Lottery')
    const moment = use('moment')
    const date = '2026-02-01'
    
    // หารอบ 169 ของ BTC
    const lottery = await Lottery.query()
      .where('date', date)
      .where('slug', 'btc_5min')
      .where('round', 169)
      .first()
    
    if (!lottery) {
      console.log('❌ Round 169 not found!')
      process.exit(1)
    }
    
    const lotteryData = lottery.toJSON()
    const result = JSON.parse(lotteryData.result || '{}')
    
    console.log('📊 Round 169 Data:')
    console.log(`   ID: ${lotteryData.id}`)
    console.log(`   Slug: ${lotteryData.slug}`)
    console.log(`   Round: ${lotteryData.round}`)
    console.log(`   Status: ${lotteryData.status}`)
    console.log(`   End At: ${lotteryData.end_at}`)
    console.log(`   Result At: ${lotteryData.result_at}`)
    console.log(`   Updated At: ${lotteryData.updated_at}`)
    console.log('')
    
    console.log('🎯 Result:')
    console.log(`   3 ตัวบน: "${result.three_top}"`)
    console.log(`   2 ตัวบน: "${result.two_top}"`)
    console.log(`   2 ตัวล่าง: "${result.two_under}"`)
    console.log(`   Close Price: ${result.raw_close_price}`)
    console.log(`   Volume: ${result.raw_volume}`)
    console.log(`   Symbol: ${result.symbol}`)
    console.log('')
    
    // ตรวจสอบว่ามี raw data หรือไม่
    if (result.raw_close_price) {
      console.log('✅ This is a NEW result (has raw_close_price)')
      
      // คำนวณใหม่เพื่อเทียบ
      const closePrice = parseFloat(result.raw_close_price)
      const closePriceInt = Math.floor(closePrice * 100)
      const expectedThreeTop = (closePriceInt % 1000).toString().padStart(3, '0')
      const expectedTwoTop = (closePriceInt % 100).toString().padStart(2, '0')
      
      console.log('')
      console.log('🧮 Recalculation:')
      console.log(`   Close Price: ${result.raw_close_price}`)
      console.log(`   Float: ${closePrice}`)
      console.log(`   Int (×100): ${closePriceInt}`)
      console.log(`   Expected 3 ตัวบน: "${expectedThreeTop}" (${closePriceInt} % 1000 = ${closePriceInt % 1000})`)
      console.log(`   Expected 2 ตัวบน: "${expectedTwoTop}" (${closePriceInt} % 100 = ${closePriceInt % 100})`)
      console.log('')
      
      if (result.three_top === expectedThreeTop) {
        console.log('✅ Result is CORRECT!')
      } else {
        console.log(`❌ Result is WRONG! Expected "${expectedThreeTop}" but got "${result.three_top}"`)
      }
    } else {
      console.log('⚠️  This is an OLD result (no raw_close_price)')
      console.log('   Please wait for the system to recalculate this round')
    }
    
    console.log('')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

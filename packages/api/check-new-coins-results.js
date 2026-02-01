'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await checkNewCoins()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function checkNewCoins() {
  try {
    console.log('🔍 Checking New Coins (BNB, XRP, TRX)...\n')
    
    const Database = use('Database')
    const moment = use('moment')
    
    const date = moment().format('YYYY-MM-DD')
    
    console.log(`📅 Date: ${date}\n`)
    console.log('=' .repeat(80))
    
    // 1. ตรวจสอบ Categories
    console.log('\n📋 1. Checking Categories...\n')
    const categories = await Database
      .table('lottery_categories')
      .whereIn('zone', ['bnb', 'xrp', 'trx'])
      .select('id', 'zone', 'slug', 'is_enable')
    
    categories.forEach(cat => {
      const icon = cat.is_enable ? '✅' : '❌'
      console.log(`   ${icon} ${cat.zone.toUpperCase().padEnd(5)} (${cat.slug.padEnd(10)}): ID=${cat.id}, Enabled=${cat.is_enable}`)
    })
    
    // 2. ตรวจสอบ Lotteries
    console.log('\n📊 2. Checking Lotteries...\n')
    
    for (const zone of ['bnb', 'xrp', 'trx']) {
      const counts = await Database
        .table('lotteries')
        .join('lottery_categories', 'lotteries.lottery_category_id', 'lottery_categories.id')
        .where('lottery_categories.zone', zone)
        .where('lotteries.date', date)
        .count('* as total')
        .first()
      
      const total = counts ? parseInt(counts.total) : 0
      
      if (total === 0) {
        console.log(`   ❌ ${zone.toUpperCase().padEnd(5)}: No rounds found!`)
        continue
      }
      
      const finished = await Database
        .table('lotteries')
        .join('lottery_categories', 'lotteries.lottery_category_id', 'lottery_categories.id')
        .where('lottery_categories.zone', zone)
        .where('lotteries.date', date)
        .where('lotteries.status', 'finished')
        .count('* as total')
        .first()
      
      const finishedCount = finished ? parseInt(finished.total) : 0
      const openCount = total - finishedCount
      
      const finishedIcon = finishedCount > 0 ? '✅' : '⚠️'
      console.log(`   ${finishedIcon} ${zone.toUpperCase().padEnd(5)}: Total=${total}, Open=${openCount}, Finished=${finishedCount}`)
    }
    
    // 3. แสดงตัวอย่างผล
    console.log('\n📝 3. Sample Results...\n')
    
    for (const zone of ['bnb', 'xrp', 'trx']) {
      const samples = await Database
        .table('lotteries')
        .join('lottery_categories', 'lotteries.lottery_category_id', 'lottery_categories.id')
        .where('lottery_categories.zone', zone)
        .where('lotteries.date', date)
        .where('lotteries.status', 'finished')
        .select('lotteries.round', 'lotteries.result')
        .orderBy('lotteries.round', 'asc')
        .limit(3)
      
      if (samples.length > 0) {
        console.log(`   ✅ ${zone.toUpperCase()}:`)
        samples.forEach(s => {
          const result = JSON.parse(s.result || '{}')
          console.log(`      Round ${s.round}: ${result.three_top || 'N/A'}/${result.two_under || 'N/A'}`)
        })
      } else {
        console.log(`   ❌ ${zone.toUpperCase()}: No results found`)
      }
      console.log('')
    }
    
    console.log('=' .repeat(80))
    console.log('\n✅ Check completed!')
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await createRoundsSimple()
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

async function createRoundsSimple() {
  try {
    console.log('🚀 Creating Rounds for New Coins...\n')
    
    const moment = use('moment')
    const Database = use('Database')
    const LotteryRepository = make('App/Repositories/LotteryRepository')
    
    const date = moment().format('YYYY-MM-DD')
    
    console.log(`📅 Date: ${date}\n`)
    
    // ดึง categories ของเหรียญใหม่โดยตรง
    const newCoins = ['bnb_5min', 'xrp_5min', 'trx_5min']
    
    let totalCreated = 0
    
    for (const slug of newCoins) {
      const category = await Database
        .table('lottery_categories')
        .where('slug', slug)
        .where('is_enable', 1)
        .first()
      
      if (!category) {
        console.log(`❌ ${slug}: Not found or disabled`)
        continue
      }
      
      console.log(`🪙 ${slug.replace('_5min', '').toUpperCase()} (${category.slug})...`)
      
      // เช็คว่ามีรอบอยู่แล้วหรือไม่
      const existing = await Database
        .table('lotteries')
        .where('date', date)
        .where('slug', slug)
        .count('* as total')
        .first()
      
      if (existing.total > 0) {
        console.log(`   ⚠️  Already has ${existing.total} rounds, skipping`)
        continue
      }
      
      // สร้างรอบ
      const created = await LotteryRepository.autoGenerateLotteryRounds({
        category,
        date,
      })
      
      console.log(`   ✅ Created ${created} rounds`)
      totalCreated += created
    }
    
    console.log(`\n${'='.repeat(60)}`)
    console.log(`✅ Total Created: ${totalCreated} rounds`)
    console.log('='.repeat(60))
    
    if (totalCreated > 0) {
      console.log('\n💡 Next: Wait for Task to fetch results')
      console.log('   Or manually check: node check-new-coins-status.js\n')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

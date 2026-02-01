'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await createRoundsDirect()
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

async function createRoundsDirect() {
  try {
    console.log('🚀 Creating Rounds for New Coins (Direct Method)...\n')
    
    const moment = use('moment')
    const _ = use('lodash')
    const LotteryRepository = make('App/Repositories/LotteryRepository')
    const LotteryCategoryRepository = make('App/Repositories/LotteryCategoryRepository')
    
    const date = moment().format('YYYY-MM-DD')
    
    console.log(`📅 Date: ${date}\n`)
    
    // ดึง categories ของ crypto ที่เปิดใช้งาน
    const categories = await LotteryCategoryRepository.getEnableZones('crypto')
    
    console.log(`📊 Found ${categories.length} enabled crypto zones`)
    
    const newCoins = ['bnb', 'xrp', 'trx']
    const newCategories = categories.filter(c => newCoins.includes(c.zone))
    
    console.log(`🆕 New coins to create: ${newCategories.map(c => c.zone.toUpperCase()).join(', ')}\n`)
    
    let totalCreated = 0
    
    for (const category of newCategories) {
      console.log(`🪙 Processing ${category.zone.toUpperCase()} (${category.slug})...`)
      
      // สร้างรอบสำหรับ category นี้
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
    
    console.log('\n💡 Next: node check-new-coins-status.js\n')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

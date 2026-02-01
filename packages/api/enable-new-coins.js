'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await enableNewCoins()
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

async function enableNewCoins() {
  try {
    console.log('🔓 Enabling New Crypto Coins...\n')
    
    const Database = use('Database')
    
    const coins = ['bnb_5min', 'xrp_5min', 'trx_5min']
    
    for (const slug of coins) {
      const category = await Database
        .table('lottery_categories')
        .where('slug', slug)
        .first()
      
      if (!category) {
        console.log(`❌ ${slug}: Not found`)
        continue
      }
      
      if (category.is_enable === 1) {
        console.log(`✅ ${slug}: Already enabled`)
        continue
      }
      
      await Database
        .table('lottery_categories')
        .where('slug', slug)
        .update({ is_enable: 1 })
      
      console.log(`🟢 ${slug}: Enabled!`)
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 Current Status:')
    console.log('='.repeat(60) + '\n')
    
    const allCrypto = await Database
      .table('lottery_categories')
      .where('type', 'crypto')
      .orderBy('id', 'asc')
    
    allCrypto.forEach(c => {
      const status = c.is_enable === 1 ? '🟢 Enabled' : '🔴 Disabled'
      const coin = c.zone.toUpperCase()
      console.log(`${status} - ${coin} (${c.slug})`)
    })
    
    const enabledCount = allCrypto.filter(c => c.is_enable === 1).length
    console.log(`\n✅ Total: ${enabledCount}/${allCrypto.length} coins enabled`)
    
    console.log('\n💡 Next steps:')
    console.log('   1. Task will automatically create rounds for enabled coins')
    console.log('   2. Wait for next task run (every 1 minute)')
    console.log('   3. Check: node check-all-coins.js\n')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

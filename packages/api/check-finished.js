'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await checkFinished()
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

async function checkFinished() {
  try {
    const Database = use('Database')
    
    const results = await Database
      .table('lotteries')
      .where('date', '2026-02-01')
      .where('type', 'crypto')
      .where('status', 'finished')
      .orderBy('slug', 'asc')
      .orderBy('round', 'asc')
      .limit(30)
    
    console.log(`\n📊 Finished Crypto Lotteries: ${results.length}\n`)
    
    if (results.length === 0) {
      console.log('⚠️  No finished lotteries yet.')
      console.log('💡 Jobs may still be processing. Try:')
      console.log('   - Check if bull:listen is running')
      console.log('   - Wait a few more seconds')
      console.log('   - Check PM2 logs: pm2 logs | grep Crypto')
    } else {
      const grouped = {}
      results.forEach(r => {
        if (!grouped[r.slug]) grouped[r.slug] = []
        grouped[r.slug].push(r)
      })
      
      Object.keys(grouped).forEach(slug => {
        const items = grouped[slug]
        console.log(`\n🪙 ${slug.toUpperCase()} (${items.length} rounds):`)
        items.forEach(r => {
          console.log(`   Round ${r.round}: ${r.result} (${r.end_at})`)
        })
      })
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await checkNewCoinsStatus()
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

async function checkNewCoinsStatus() {
  try {
    const Database = use('Database')
    
    const newCoins = ['bnb_5min', 'xrp_5min', 'trx_5min']
    
    console.log('\n📊 Checking New Coins Status:\n')
    
    let allCreated = true
    let totalRounds = 0
    let totalFinished = 0
    
    for (const slug of newCoins) {
      const count = await Database
        .table('lotteries')
        .where('date', '2026-02-01')
        .where('slug', slug)
        .count('* as total')
        .first()
      
      const finished = await Database
        .table('lotteries')
        .where('date', '2026-02-01')
        .where('slug', slug)
        .where('status', 'finished')
        .count('* as total')
        .first()
      
      const coin = slug.replace('_5min', '').toUpperCase()
      const icon = count.total > 0 ? '🟢' : '⏳'
      
      console.log(`${icon} ${coin}: ${count.total} rounds created, ${finished.total} finished`)
      
      if (count.total === 0) allCreated = false
      totalRounds += parseInt(count.total)
      totalFinished += parseInt(finished.total)
      
      // แสดงตัวอย่างผล
      if (finished.total > 0) {
        const sample = await Database
          .table('lotteries')
          .where('slug', slug)
          .where('status', 'finished')
          .orderBy('round', 'asc')
          .first()
        
        if (sample) {
          const result = JSON.parse(sample.result)
          console.log(`   Sample Round 1: ${result.three_top}/${result.two_under}\n`)
        }
      } else {
        console.log('')
      }
    }
    
    console.log('='.repeat(60))
    console.log(`📊 Summary: ${totalRounds} rounds, ${totalFinished} finished`)
    console.log('='.repeat(60))
    
    if (!allCreated) {
      console.log('\n⏳ Waiting for Task to create rounds...')
      console.log('💡 Run this script again in 1-2 minutes')
    } else if (totalFinished === 0) {
      console.log('\n⏳ Waiting for Jobs to fetch results...')
      console.log('💡 Results will appear after Task runs')
    } else {
      console.log('\n✅ Everything is working!')
    }
    
    console.log('')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

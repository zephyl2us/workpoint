'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await runCryptoJobSync()
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

async function runCryptoJobSync() {
  try {
    console.log('🚀 Running Crypto Job Synchronously...\n')
    
    const moment = use('moment')
    const LotteryCryptoResultJob = use('App/Jobs/LotteryCryptoResult')
    
    const date = moment().format('YYYY-MM-DD')
    const zones = ['btc', 'eth', 'ada', 'sol', 'dot', 'avax']
    
    for (const zone of zones) {
      console.log(`\n${'='.repeat(60)}`)
      console.log(`🪙 Processing ${zone.toUpperCase()}...`)
      console.log('='.repeat(60))
      
      const job = new LotteryCryptoResultJob()
      await job.handle({ data: { zone, date } })
      
      console.log(`✅ ${zone.toUpperCase()} completed!`)
    }
    
    console.log('\n\n' + '='.repeat(60))
    console.log('📊 CHECKING RESULTS')
    console.log('='.repeat(60) + '\n')
    
    const Database = use('Database')
    const results = await Database
      .table('lotteries')
      .where('date', date)
      .where('type', 'crypto')
      .where('status', 'finished')
      .orderBy('slug', 'asc')
      .orderBy('round', 'asc')
      .limit(50)
    
    console.log(`✅ Total Finished: ${results.length} lotteries\n`)
    
    const grouped = {}
    results.forEach(r => {
      if (!grouped[r.slug]) grouped[r.slug] = []
      grouped[r.slug].push(r)
    })
    
    Object.keys(grouped).sort().forEach(slug => {
      const items = grouped[slug]
      console.log(`\n🪙 ${slug.toUpperCase().replace('_5MIN', '')} (${items.length} rounds):`)
      items.slice(0, 10).forEach(r => {
        console.log(`   Round ${r.round.toString().padStart(3)}: ${r.result}`)
      })
      if (items.length > 10) {
        console.log(`   ... and ${items.length - 10} more`)
      }
    })
    
    console.log('\n✅ All jobs completed!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await checkAllCoins()
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

async function checkAllCoins() {
  try {
    const Database = use('Database')
    
    // นับตาม slug
    const counts = await Database
      .table('lotteries')
      .where('date', '2026-02-01')
      .where('type', 'crypto')
      .where('status', 'finished')
      .select('slug')
      .count('* as total')
      .groupBy('slug')
      .orderBy('slug', 'asc')
    
    console.log('\n📊 Finished Lotteries by Coin:\n')
    counts.forEach(c => {
      const coin = c.slug.replace('_5min', '').toUpperCase()
      const icon = c.total >= 100 ? '🟢' : c.total >= 50 ? '🟡' : '🟠'
      console.log(`${icon} ${coin}: ${c.total} rounds`)
    })
    
    const totalAll = counts.reduce((sum, c) => sum + parseInt(c.total), 0)
    console.log(`\n✅ Total: ${totalAll} finished lotteries\n`)
    
    // ตัวอย่างผลจากแต่ละเหรียญ (Round 1)
    console.log('📝 Sample Results (Round 1):\n')
    for (const item of counts) {
      const sample = await Database
        .table('lotteries')
        .where('date', '2026-02-01')
        .where('slug', item.slug)
        .where('status', 'finished')
        .orderBy('round', 'asc')
        .first()
      
      if (sample) {
        const result = JSON.parse(sample.result)
        const coin = item.slug.replace('_5min', '').toUpperCase()
        console.log(`🪙 ${coin}: ${result.three_top}/${result.two_under}`)
        console.log(`   (H+L)/2: ${result.raw_avg_price}`)
        console.log(`   QuoteVol × 1.001: ${result.raw_quote_volume}\n`)
      }
    }
    
    // เช็คความหลากหลายของผล
    console.log('🔍 Checking Uniqueness:\n')
    for (const item of counts) {
      const results = await Database
        .table('lotteries')
        .where('date', '2026-02-01')
        .where('slug', item.slug)
        .where('status', 'finished')
        .select('result')
      
      const uniqueResults = new Set()
      results.forEach(r => {
        const parsed = JSON.parse(r.result)
        uniqueResults.add(`${parsed.three_top}/${parsed.two_under}`)
      })
      
      const percentage = (uniqueResults.size / results.length * 100).toFixed(1)
      const coin = item.slug.replace('_5min', '').toUpperCase()
      const icon = parseFloat(percentage) >= 98 ? '🟢' : parseFloat(percentage) >= 95 ? '🟡' : '🟠'
      
      console.log(`${icon} ${coin}: ${uniqueResults.size}/${results.length} unique (${percentage}%)`)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

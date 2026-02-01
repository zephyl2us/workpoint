'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await analyzeCryptoRandomness()
  })
  .catch(error => {
    console.error('❌ Bootstrap Error:', error)
    process.exit(1)
  })

async function analyzeCryptoRandomness() {
  try {
    console.log('🔬 Analyzing Crypto Randomness & Predictability\n')
    console.log('=' .repeat(80))
    
    const moment = use('moment')
    const _ = use('lodash')
    const ResultCryptoRepository = make('App/Repositories/Lottery/ResultCryptoRepository')
    
    const date = moment().format('YYYY-MM-DD')
    
    const coins = [
      { name: 'Bitcoin (BTC)', symbol: 'BTCUSDT', method: 'btc' },
      { name: 'Ethereum (ETH)', symbol: 'ETHUSDT', method: 'eth' },
      { name: 'Cardano (ADA)', symbol: 'ADAUSDT', method: 'ada' },
      { name: 'Solana (SOL)', symbol: 'SOLUSDT', method: 'sol' },
      { name: 'Polkadot (DOT)', symbol: 'DOTUSDT', method: 'dot' },
      { name: 'Avalanche (AVAX)', symbol: 'AVAXUSDT', method: 'avax' }
    ]
    
    const allAnalysis = []
    
    for (const coin of coins) {
      console.log(`\n\n${'='.repeat(80)}`)
      console.log(`📊 Analyzing: ${coin.name} (${coin.symbol})`)
      console.log('='.repeat(80))
      
      // ดึงข้อมูล
      const data = await ResultCryptoRepository[coin.method](date)
      const results = data[Object.keys(data)[0]] || []
      
      if (results.length === 0) {
        console.log('❌ No data available')
        continue
      }
      
      console.log(`✅ Fetched ${results.length} rounds\n`)
      
      // วิเคราะห์ราคา
      const prices = results.map(r => parseFloat(r.raw_close_price))
      const volumes = results.map(r => parseFloat(r.raw_volume))
      
      const priceMin = _.min(prices)
      const priceMax = _.max(prices)
      const priceAvg = _.mean(prices)
      const priceStdDev = Math.sqrt(_.mean(prices.map(p => Math.pow(p - priceAvg, 2))))
      
      console.log('💰 Price Analysis:')
      console.log(`   Min: $${priceMin.toFixed(8)}`)
      console.log(`   Max: $${priceMax.toFixed(8)}`)
      console.log(`   Avg: $${priceAvg.toFixed(8)}`)
      console.log(`   Std Dev: $${priceStdDev.toFixed(8)}`)
      console.log(`   Range: $${(priceMax - priceMin).toFixed(8)} (${((priceMax - priceMin) / priceAvg * 100).toFixed(2)}%)`)
      
      // วิเคราะห์ทศนิยม
      console.log('\n🔍 Decimal Analysis:')
      const decimalChanges = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      
      for (let i = 1; i < prices.length; i++) {
        const prev = prices[i-1].toFixed(8)
        const curr = prices[i].toFixed(8)
        const [prevInt, prevDec] = prev.split('.')
        const [currInt, currDec] = curr.split('.')
        
        for (let d = 0; d < 5; d++) {
          if (prevDec[d] !== currDec[d]) {
            decimalChanges[d + 1]++
          }
        }
      }
      
      for (let d = 1; d <= 5; d++) {
        const changeRate = (decimalChanges[d] / (results.length - 1) * 100).toFixed(1)
        console.log(`   Decimal ${d}: ${decimalChanges[d]}/${results.length - 1} changes (${changeRate}%)`)
      }
      
      // วิเคราะห์ผลลัพธ์
      console.log('\n🎯 Result Distribution Analysis:')
      
      const threeTopCounts = {}
      const twoTopCounts = {}
      const twoUnderCounts = {}
      
      // นับการกระจายตัวของแต่ละหลัก
      const digitDistribution = {
        threeTop: { 0: {}, 1: {}, 2: {} }, // position 0=หลักร้อย, 1=หลักสิบ, 2=หลักหน่วย
        twoTop: { 0: {}, 1: {} },
        twoUnder: { 0: {}, 1: {} }
      }
      
      results.forEach(r => {
        // 3 ตัวบน
        threeTopCounts[r.three_top] = (threeTopCounts[r.three_top] || 0) + 1
        for (let i = 0; i < 3; i++) {
          const digit = r.three_top[i]
          digitDistribution.threeTop[i][digit] = (digitDistribution.threeTop[i][digit] || 0) + 1
        }
        
        // 2 ตัวบน
        twoTopCounts[r.two_top] = (twoTopCounts[r.two_top] || 0) + 1
        for (let i = 0; i < 2; i++) {
          const digit = r.two_top[i]
          digitDistribution.twoTop[i][digit] = (digitDistribution.twoTop[i][digit] || 0) + 1
        }
        
        // 2 ตัวล่าง
        twoUnderCounts[r.two_under] = (twoUnderCounts[r.two_under] || 0) + 1
        for (let i = 0; i < 2; i++) {
          const digit = r.two_under[i]
          digitDistribution.twoUnder[i][digit] = (digitDistribution.twoUnder[i][digit] || 0) + 1
        }
      })
      
      const uniqueThreeTop = Object.keys(threeTopCounts).length
      const uniqueTwoTop = Object.keys(twoTopCounts).length
      const uniqueTwoUnder = Object.keys(twoUnderCounts).length
      
      console.log(`   3 ตัวบน: ${uniqueThreeTop}/1000 unique (${(uniqueThreeTop/10).toFixed(1)}%)`)
      console.log(`   2 ตัวบน: ${uniqueTwoTop}/100 unique (${uniqueTwoTop}%)`)
      console.log(`   2 ตัวล่าง: ${uniqueTwoUnder}/100 unique (${uniqueTwoUnder}%)`)
      
      // คำนวณ Entropy (ความสุ่ม)
      const calcEntropy = (counts, total, maxUnique) => {
        let entropy = 0
        Object.values(counts).forEach(count => {
          const p = count / total
          entropy -= p * Math.log2(p)
        })
        const maxEntropy = Math.log2(maxUnique)
        return { entropy, maxEntropy, normalized: entropy / maxEntropy }
      }
      
      const entropyThreeTop = calcEntropy(threeTopCounts, results.length, 1000)
      const entropyTwoTop = calcEntropy(twoTopCounts, results.length, 100)
      const entropyTwoUnder = calcEntropy(twoUnderCounts, results.length, 100)
      
      console.log('\n🔐 Entropy (Randomness Score):')
      console.log(`   3 ตัวบน: ${entropyThreeTop.entropy.toFixed(2)}/${entropyThreeTop.maxEntropy.toFixed(2)} (${(entropyThreeTop.normalized * 100).toFixed(1)}%)`)
      console.log(`   2 ตัวบน: ${entropyTwoTop.entropy.toFixed(2)}/${entropyTwoTop.maxEntropy.toFixed(2)} (${(entropyTwoTop.normalized * 100).toFixed(1)}%)`)
      console.log(`   2 ตัวล่าง: ${entropyTwoUnder.entropy.toFixed(2)}/${entropyTwoUnder.maxEntropy.toFixed(2)} (${(entropyTwoUnder.normalized * 100).toFixed(1)}%)`)
      
      // วิเคราะห์การกระจายตัวของแต่ละหลัก
      console.log('\n📈 Digit Distribution (0-9) in Each Position:')
      console.log('   3 ตัวบน:')
      for (let i = 0; i < 3; i++) {
        const pos = ['หลักร้อย', 'หลักสิบ', 'หลักหน่วย'][i]
        const dist = digitDistribution.threeTop[i]
        const uniqueDigits = Object.keys(dist).length
        const mostCommon = _.maxBy(Object.entries(dist), ([k, v]) => v)
        const leastCommon = _.minBy(Object.entries(dist), ([k, v]) => v)
        console.log(`      ${pos}: ${uniqueDigits}/10 digits used, Most: ${mostCommon[0]}(${mostCommon[1]}×), Least: ${leastCommon[0]}(${leastCommon[1]}×)`)
      }
      
      console.log('   2 ตัวล่าง (from Volume):')
      for (let i = 0; i < 2; i++) {
        const pos = ['หลักสิบ', 'หลักหน่วย'][i]
        const dist = digitDistribution.twoUnder[i]
        const uniqueDigits = Object.keys(dist).length
        const mostCommon = _.maxBy(Object.entries(dist), ([k, v]) => v)
        const leastCommon = _.minBy(Object.entries(dist), ([k, v]) => v)
        console.log(`      ${pos}: ${uniqueDigits}/10 digits used, Most: ${mostCommon[0]}(${mostCommon[1]}×), Least: ${leastCommon[0]}(${leastCommon[1]}×)`)
      }
      
      // ตรวจสอบ pattern ที่ซ้ำ
      const consecutiveRepeats = {}
      for (let i = 1; i < results.length; i++) {
        if (results[i].three_top === results[i-1].three_top) {
          consecutiveRepeats[results[i].three_top] = (consecutiveRepeats[results[i].three_top] || 0) + 1
        }
      }
      
      if (Object.keys(consecutiveRepeats).length > 0) {
        console.log('\n⚠️  Consecutive Repeats (3ตัวบน):')
        const sorted = _.sortBy(Object.entries(consecutiveRepeats), ([k, v]) => -v).slice(0, 5)
        sorted.forEach(([num, count]) => {
          console.log(`      "${num}" repeated ${count} times consecutively`)
        })
      }
      
      // เก็บข้อมูลสำหรับเปรียบเทียบ
      allAnalysis.push({
        coin: coin.name,
        symbol: coin.symbol,
        rounds: results.length,
        priceRange: (priceMax - priceMin) / priceAvg,
        decimalChange2: decimalChanges[2] / (results.length - 1),
        decimalChange3: decimalChanges[3] / (results.length - 1),
        uniqueThreeTop,
        uniqueTwoUnder,
        entropyThreeTop: entropyThreeTop.normalized,
        entropyTwoUnder: entropyTwoUnder.normalized
      })
    }
    
    // สรุปเปรียบเทียบ
    console.log('\n\n' + '='.repeat(80))
    console.log('📊 COMPARATIVE SUMMARY')
    console.log('='.repeat(80))
    console.log('\n🏆 Best for Randomness (Higher is Better):\n')
    
    const sortedByEntropy = _.sortBy(allAnalysis, a => -a.entropyThreeTop)
    sortedByEntropy.forEach((a, i) => {
      const star = i === 0 ? '⭐' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  '
      console.log(`${star} ${i+1}. ${a.coin}`)
      console.log(`      Entropy (3ตัวบน): ${(a.entropyThreeTop * 100).toFixed(1)}%`)
      console.log(`      Entropy (2ตัวล่าง): ${(a.entropyTwoUnder * 100).toFixed(1)}%`)
      console.log(`      Unique Results: ${a.uniqueThreeTop}/1000 (3ตัวบน), ${a.uniqueTwoUnder}/100 (2ตัวล่าง)`)
      console.log(`      Decimal Change Rate: ทศนิยมตำแหน่ง2=${(a.decimalChange2*100).toFixed(1)}%, ตำแหน่ง3=${(a.decimalChange3*100).toFixed(1)}%`)
      console.log('')
    })
    
    console.log('\n💡 RECOMMENDATIONS:\n')
    
    const avgEntropy = _.mean(allAnalysis.map(a => a.entropyThreeTop))
    const poorCoins = allAnalysis.filter(a => a.entropyThreeTop < avgEntropy * 0.9)
    
    if (poorCoins.length > 0) {
      console.log('⚠️  Coins with Lower Randomness:')
      poorCoins.forEach(c => {
        console.log(`   - ${c.coin}: May need different calculation method`)
      })
    } else {
      console.log('✅ All coins show good randomness with current method!')
    }
    
    console.log('\n📋 Suggested Improvements:')
    console.log('   1. Consider using Volume more (ทศนิยมตำแหน่งที่สูงกว่า)')
    console.log('   2. For low-entropy coins, combine Close + Open + High + Low')
    console.log('   3. Use different decimal positions based on coin price range')
    console.log('   4. Consider using timestamp in calculation for extra randomness')
    
    console.log('\n✅ Analysis completed!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await testCryptoAPI()
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

async function testCryptoAPI() {
  try {
    console.log('🧪 Testing Crypto API Endpoints...\n')
    
    const moment = use('moment')
    const LotteryController = use('App/Controllers/Http/Core/Lottery/LotteryController')
    
    const controller = new LotteryController(
      make('App/Repositories/LotteryRepository'),
      make('App/Repositories/LotteryZoneRateRepository'),
      make('App/Repositories/LotteryCategoryRepository')
    )
    
    const date = moment().format('YYYY-MM-DD')
    
    console.log('📅 Testing /core/lottery/crypto')
    console.log(`   Date: ${date}\n`)
    
    const mockRequest = {
      input: (key) => {
        if (key === 'date') return date
        return null
      }
    }
    
    const result = await controller.crypto({
      request: mockRequest,
      params: {},
      response: {}
    })
    
    console.log(`✅ Response:`)
    console.log(`   Categories: ${result.categories.length}`)
    console.log(`   Lotteries: ${result.lotteries.length}\n`)
    
    if (result.categories.length > 0) {
      console.log('📋 Categories:')
      result.categories.forEach(c => {
        console.log(`   - ${c.zone.toUpperCase()} (${c.slug}): ${c.is_enable === 1 ? '🟢 Enabled' : '🔴 Disabled'}`)
      })
    }
    
    console.log('\n✅ API is working!')
    console.log('\n💡 If you still see "Page Not Found", check:')
    console.log('   1. User ACL permissions: lottery.crypto.view = 1')
    console.log('   2. Frontend route: /admin/lottery/crypto')
    console.log('   3. Browser console for errors\n')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

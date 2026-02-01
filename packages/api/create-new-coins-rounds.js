'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await createNewCoinsRounds()
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

async function createNewCoinsRounds() {
  try {
    console.log('🚀 Creating Rounds for New Coins...\n')
    
    const moment = use('moment')
    const LotteryStartTask = use('App/Tasks/LotteryStart')
    
    const task = new LotteryStartTask()
    
    console.log('📅 Running LotteryStart Task...')
    console.log('   This will create rounds for all enabled crypto coins')
    console.log('   (including BNB, XRP, TRX)\n')
    
    await task.handle()
    
    console.log('\n✅ Task completed!')
    console.log('\n💡 Now check: node check-new-coins-status.js\n')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

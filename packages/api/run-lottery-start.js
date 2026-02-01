'use strict'

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .preLoad('start/app')
  .fire()
  .then(async () => {
    await runLotteryStart()
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

async function runLotteryStart() {
  try {
    console.log('🚀 Running LotteryStart Scheduler...\n')
    console.log('   This will create rounds for ALL enabled lotteries')
    console.log('   (including new crypto coins: BNB, XRP, TRX)\n')
    
    const LotteryStartRepository = make('App/Repositories/Lottery/LotteryStartRepository')
    
    await LotteryStartRepository.scheduler()
    
    console.log('\n✅ LotteryStart completed!')
    console.log('\n💡 Check results: node check-new-coins-status.js\n')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

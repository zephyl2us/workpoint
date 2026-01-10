'use strict'

const _ = use('lodash')
const md5 = use('md5')
const moment = use('moment')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const ResultStockRepository = make('App/Repositories/Lottery/ResultStockRepository')
const LotteryRepository = make('App/Repositories/LotteryRepository')
const ExampleLottery = make('App/Models/Example/Lottery')

class LotteryStockRetrospective {

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
      removeOnFail: true
    }
  }

  static get key() {
    return 'LotteryStockRetrospective-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job
    
    try {
      const date = data.date
      const lottery = data.lottery
      const result = await ResultStockRepository.stockRetro(lottery.key, date)
      if (result) {
        for (const stock of result.stocks) await this.createLottery(stock, lottery)
      }
    } catch (e) {
			const dataLogs = {
				title: 'LotteryStockRetrospective-job',
				path: 'app/Jobs',
				channel: 'kue',
				message: e.message,
				data: e,
				params: data
			}
			LogRepository.fire(dataLogs)
    }
  }

  async createLottery(stock, lottery) {
    const categoryId = lottery.id
    const slug = lottery.slug
    const type = lottery.type
    const date = _.get(stock, 'date')
    const round = null
    const hash = md5(`${date}_${categoryId}${round ? '_' + round : ''}`)
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    const data = _.pick(stock, ['three_top', 'two_top', 'two_under'])

    const exist = await ExampleLottery.query()
      .where('lottery_category_id', categoryId)
      .where('slug', slug)
      .where('type', type)
      .where('date', date)
      .first()
    
    if (exist) return

    // console.log(stock)

    const createLottery = await ExampleLottery.create({
      lottery_category_id: categoryId,
      slug: slug,
      type: type,
      date: date,
      // round: round,
      hash: hash,
      result: JSON.stringify(data),
      // status: 'finished',
      // start_at: now,
      // end_at: now,
      // result_at: now
    })
  }

  // async onCompleted(job, result) {
  //   // console.log(result)
  //   const ltoUserId = job.data.lto_user_id

  //   console.log('Job Compleate...', ltoUserId)
  // }
}

module.exports = LotteryStockRetrospective

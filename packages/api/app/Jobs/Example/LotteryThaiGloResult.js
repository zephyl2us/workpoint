'use strict'

const _ = use('lodash')
const ResultYeekeeRepository = make('App/Repositories/Lottery/ResultYeekeeRepository')
const ExampleLottery = make('App/Models/Example/Lottery')
const LotteryRepository = make('App/Repositories/LotteryRepository')
const Redis = use('Redis')
const md5 = use('md5')
const moment = use('moment')

class LotteryThaiGloResult {

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'LotteryThaiGloResult-job'
  }

  // This is where the work is done.
  async handle(job) {
    try {
      const { data } = job
      const date = data.date
      const category = data.category

      const result = await ResultYeekeeRepository.thaigov(date)
      if (result) {
        const categoryId = 1
        const round = 1
        const hash = md5(`${date}_${categoryId}${round ? '_' + round : ''}`)
        const now = moment().format('YYYY-MM-DD HH:mm:ss')

        const startAt = moment(date).subtract(category.pre_start, 'days').format(`YYYY-MM-DD ${category.start_time}`)
        const endAt = moment(date).add(category.end_delay, 'days').format(`YYYY-MM-DD ${category.end_time}`)
        const resultAt = moment(date).add(category.result_delay, 'days').format(`YYYY-MM-DD ${category.result_time}`)

        const exist = await ExampleLottery.query()
          .where('lottery_category_id', category.id)
          .where('slug', category.slug)
          .where('type', category.type)
          .where('date', date)
          .first()

        if (exist) return

        const lottery = {
          lottery_category_id: category.id,
          slug: category.slug,
          type: category.type,
          date: date,
          // round: null,
          hash: hash,
          result: JSON.stringify(result),
          // status: 'finished',
          // start_at: startAt,
          // end_at: endAt,
          // result_at: resultAt
        }

        await ExampleLottery.create(lottery)

    
        // const createLottery = await LotteryRepository.create({
        //   lottery_category_id: category.id,
        //   slug: category.slug,
        //   type: category.type,
        //   date: date,
        //   round: null,
        //   hash: hash,
        //   result: data,
        //   status: 'finished',
        //   start_at: now,
        //   end_at: now,
        //   result_at: now
        // })
      }
      
      // await this.createLottery(result, date)

    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = LotteryThaiGloResult

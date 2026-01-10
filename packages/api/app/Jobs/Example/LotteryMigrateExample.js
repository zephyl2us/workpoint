'use strict'

const _ = use('lodash')
const ExampleLottery = make('App/Models/Example/Lottery')
const LotteryRepository = make('App/Repositories/LotteryRepository')
const md5 = use('md5')
const moment = use('moment')

class LotteryMigrateExample {

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'LotteryMigrateExample-job'
  }

  // This is where the work is done.
  async handle(job) {
    // console.log('LotteryMigrateExample')
    try {
      const { data } = job
      const categories = data.categories
      const page = data.page
      const limit = data.limit
      const totalPage = data.total_page
      // console.log(categories)

      let ExampleLotteries = await ExampleLottery.query().orderBy('date').paginate(page, limit)
      ExampleLotteries = ExampleLotteries.toJSON()
      ExampleLotteries = _.get(ExampleLotteries, 'data')

      // console.log(ExampleLotteries)

      for(let i = 0; i < _.size(ExampleLotteries); i++) {
        const lottery = ExampleLotteries[i]
        // console.log(lottery)
        const index = _.findIndex(categories, ['slug', lottery.slug])
        const category = categories[index]
        // console.log(category)
  
        const date = moment(lottery.date).format('YYYY-MM-DD')
        // const hash = md5(`${date}_${category.id}`)
        const hash = `${date}_${category.id}${category.round ? '_' + category.round : ''}`

        const startAt = moment(date).subtract(category.pre_start, 'days').format(`YYYY-MM-DD ${category.start_time}`)
        const endAt = moment(date).add(category.end_delay, 'days').format(`YYYY-MM-DD ${category.end_time}`)
        const resultAt = moment(date).add(category.result_delay, 'days').format(`YYYY-MM-DD ${category.result_time}`)

        // console.log(date)
        // console.log(endAt)
        // console.log(category.result_time)
        // console.log(resultAt)

        const createData = {
          lottery_category_id: category.id,
          slug: category.slug,
          type: category.type,
          date: date,
          round: null,
          hash: hash,
          result: JSON.parse(lottery.result),
          status: 'finished',
          start_at: startAt,
          end_at: endAt,
          result_at: resultAt
        }
        // console.log(createData)

        const createdLottery = await LotteryRepository.create(createData)
      }
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = LotteryMigrateExample

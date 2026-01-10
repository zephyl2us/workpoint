'use strict'

const _ = use('lodash')
const moment = use('moment')
const md5 = use('md5')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const LotteryRepository = make('App/Repositories/LotteryRepository')

class LotteryStart {
  // static get connection() {
  //   return "remote";
  // }

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'LotteryStart-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job
    
		try {
      const category = data.category
      const lotteries = data.lotteries

      await this.createLotteries(category, lotteries)

      // console.log(category)
      // console.log(lottery)

      
		} catch (e) {
			const dataLogs = {
				title: 'LotteryStart-job',
				path: 'app/Jobs',
				channel: 'kue',
				message: e.message,
				data: e,
				params: data
			}
			LogRepository.fire(dataLogs)
		}
  }


  async createLotteries (category, data) {
    // console.log('creatingLottery', category.id, data)

    const categoryId = category.id
    const categorySlug = _.get(category, 'slug')
    const categoryType = _.get(category, 'type')

    const filterDate = _.maxBy(data, (item) => new Date(item.end_at))
    const latestData = moment(filterDate.end_at).subtract(5, 'hours').format('YYYY-MM-DD')

    const filter = {
      lottery_category_id: categoryId,
      date: latestData
    }
    let lotteries = await LotteryRepository.browse({ filter: filter }).fetch()
    lotteries = lotteries.toJSON()

    const createLotteries = []

    for(let i = 0; i < _.size(data); i++) {
      const lottery = data[i]
      const round = _.get(lottery, 'round') || null
      const startAt = _.get(lottery, 'start_at')
      const endAt = _.get(lottery, 'end_at')
      const resultAt = _.get(lottery, 'result_at')

      const date = moment(endAt).subtract(5, 'hours').format('YYYY-MM-DD')
      const hash = `${date}_${categoryId}${round ? '_' + round : ''}`

      // console.log('------------------------------')
      // console.log(`creatingLottery ${category.type}:${category.slug}`, category.id, data)
      // console.log(`Category: #${category.id} ${category.type}:${category.slug}`)

      const findLottery = _.find(lotteries, ['hash', hash])
      // const lotteryHash = _.get(lottery, 'hash')
      if(findLottery) {
        // console.log(`Lottery: #${findLottery.id} Duplicated`,)
        return
      }

      const createLottery = {
        lottery_category_id: categoryId,
        slug: categorySlug,
        type: categoryType,
        date: date,
        round: round,
        hash: hash,
        start_at: startAt,
        end_at: endAt,
        result_at: resultAt
      }

      createLotteries.push(createLottery)
      // console.log(`Lottery: #${createLottery.id}${_.eq(createLottery.type, 'yeekee') ? `:${createLottery.round}` : ''} Created`,)

      // console.log(`Created:`, createLottery)
    }

    // console.log(createLotteries)
    LotteryRepository.createMany(createLotteries)
  }


  // async onCompleted(job, result) {
  //   console.log('Job Compleate...', result)
  // }
}

module.exports = LotteryStart

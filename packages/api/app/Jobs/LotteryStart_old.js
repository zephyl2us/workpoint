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
      const lottery = data.lottery

      await this.createLottery(category, lottery)

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


  async createLottery (category, data) {
    // console.log('creatingLottery', category.id, data)

    const startAt = _.get(data, 'start_at')
    const endAt = _.get(data, 'end_at')
    const resultAt = _.get(data, 'result_at')

    if (moment().isSameOrAfter(startAt) && moment().isBefore(endAt)) {
      const date = moment(endAt).subtract(5, 'hours').format('YYYY-MM-DD')

      const categoryId = category.id

      const round = _.get(data, 'round') || null
      const filter = {
        lottery_category_id: categoryId,
        date: date,
        round: round
      }
      let lottery = await LotteryRepository.browse({ filter: filter }).first()

      const lotteryId = _.get(lottery, 'id')

      if(lotteryId) {
        return
      }

      // const hash = md5(`${date}_${categoryId}${round ? '_' + round : ''}`)
      const hash = `${date}_${categoryId}${round ? '_' + round : ''}`
      const categorySlug = _.get(category, 'slug')
      const categoryType = _.get(category, 'type')

      // console.log('------------------------------')
      // console.log(`creatingLottery ${category.type}:${category.slug}`, category.id, data)
      // console.log(`Category: #${category.id} ${category.type}:${category.slug}`)

      // Rechech has exist
      const lotteryHash = _.get(lottery, 'hash')
      if(_.eq(lotteryHash, hash)) {
        // console.log(`Lottery: #${lottery.id} Duplicated`,)
        return
      }
      const type = _.get(category, 'type')
      const createLottery = await LotteryRepository.create({
        lottery_category_id: categoryId,
        slug: categorySlug,
        type: categoryType,
        date: date,
        round: round,
        hash: hash,
        start_at: startAt,
        end_at: endAt,
        result_at: resultAt
      })

      // console.log(`Lottery: #${createLottery.id}${_.eq(createLottery.type, 'yeekee') ? `:${createLottery.round}` : ''} Created`,)

      // console.log(`Created:`, createLottery)
    }
  }


  // async onCompleted(job, result) {
  //   console.log('Job Compleate...', result)
  // }
}

module.exports = LotteryStart

'use strict'

const _ = use('lodash')
const moment = use('moment')
const md5 = use('md5')
const Helper = use('App/Helper')
const Bull = use('Bull')
const LotteryStartJob = use('App/Jobs/LotteryStart')

class LotteryStartRepository {

  static get inject() {
    return [
      'App/Repositories/LotteryRepository',
      'App/Repositories/LotteryCategoryRepository',
    ]
  }

  constructor(LotteryRepository, LotteryCategoryRepository) {
    this.LotteryRepository = LotteryRepository
    this.LotteryCategoryRepository = LotteryCategoryRepository
  }


  async scheduler () {
    if(Helper.isDevMode()) console.log('Scheduler : Lottery Start every 5 Minute')

    const filter = {
      is_enable: true
    }
    
    // let lotteryCategories = await this.LotteryCategoryRepository.browse({ filter: filter })
    //   .with('lottery', (builder) => {
    //     builder.orderBy('id', 'asc')
    //   }).fetch()

    let lotteryCategories = await this.LotteryCategoryRepository.browse({ 
      filter: filter,
      sort: 'id|asc'
    }).fetch()

    lotteryCategories = lotteryCategories.toJSON()

    // console.log(lotteryCategories)

    for (let i in lotteryCategories) {
      const category = lotteryCategories[i]
      // console.log(category)
      await this.start(category)
    }
  }

  async start (category) {
    const type = _.get(category, 'type')
    const categoryId = _.get(category, 'id')
    // const lottery = _.get(category, 'lottery')

    // console.log('------------------------------')
    // console.log(`Category ID: ${category.id}`)
    // console.log(lottery)

    // if(!lottery) {
    //   this.create(category)
    //   return
    // }

    if(_.includes(['government', 'stock'], type)) {
      let lottery = await this.LotteryRepository.browse({ filter: {
        lottery_category_id: categoryId,
      }}).orderBy('date', 'desc').first()

      const date = _.get(lottery, 'date')
      // console.log(date)
      if(moment().isAfter(moment(date).add(1, 'day'))) {
        // console.log('Create Government & Stock')
        this.create(category)
        return
      }
    }

    if(_.eq('yeekee', type)) {
      const totalRound = _.get(category, 'total_round')
      const date = moment().subtract(5, 'hours').format('YYYY-MM-DD')

      const filter = {
        lottery_category_id: categoryId,
        date: date
      }
      
      let lotteries = await this.LotteryRepository.browse({ filter: filter}).fetch()

      lotteries = lotteries.toJSON()
      // console.log(_.size(lotteries), totalRound)

      // if(_.size(lotteries) < totalRound) {
      if(_.size(lotteries) < 1) {
        // console.log('Create Yeekee')
        this.create(category)
        return
      }

      // console.log(_.size(lotteries))

      // _.each(lotteries, (lottery) => {
      //   console.log(lottery.id)
      // })

    }

  }

  async create (category) {
    const type = category.type
    const slug = category.slug

    const nextDate = this.nextDate(category)

    // console.log(category.id)

    if (!nextDate) {
      return
    }

    // console.log(`nextDate`, nextDate)
    // return

    const startAt = this.timeConverter(nextDate, category.start_time, category.pre_start, true)
    const endAt = this.timeConverter(nextDate, category.end_time, category.end_delay)
		const resultAt = this.timeConverter(nextDate, category.result_time, category.result_delay)

    // console.log(startAt, endAt, resultAt)

    const lotteries = []

    switch (type) {
      case 'yeekee':
        const totalRound = parseInt(_.get(category, 'total_round')) || 0
        const firstRoundEndAt = moment(startAt).add(1, 'hour')
        const diffTime = Math.abs(firstRoundEndAt.diff(endAt)) / 1000
        const diffMinute = diffTime / 60
        // const diffHour = diffMinute / 60

        const minutePerRound = Math.floor(diffMinute / totalRound)
        // console.log(diffTime, diffMinute, minutePerRound)

        const addResultMinute = /5min/.test(slug) || /10min/.test(slug) ? 1 : 2

        for (let i = 0; i < totalRound; i++) {
          const addMinute = (minutePerRound * i)
          const roundEndAt = moment(firstRoundEndAt).add(addMinute, 'minutes')
          const roundResultAt = moment(roundEndAt).add(addResultMinute, 'minutes')
          
          const lottery = {
            round: i + 1,
            start_at: startAt,
            end_at: roundEndAt.format('YYYY-MM-DD HH:mm:ss'),
            result_at: roundResultAt.format('YYYY-MM-DD HH:mm:ss'),
          }
          lotteries.push(lottery)
          // Bull.add(LotteryStartJob.key, {
          //   category: category,
          //   lottery: {
          //     round: i + 1,
          //     start_at: startAt,
          //     end_at: roundEndAt.format('YYYY-MM-DD HH:mm:ss'),
          //     result_at: roundResultAt.format('YYYY-MM-DD HH:mm:ss'),
          //   }
          // })
        }
        break

      default:
		    // Bull.add(LotteryStartJob.key, {
        //   category: category,
        //   lottery: {
        //     start_at: startAt,
        //     end_at: endAt,
        //     result_at: resultAt
        //   }
        // })
        const lottery = {
          start_at: startAt,
          end_at: endAt,
          result_at: resultAt
        }
        lotteries.push(lottery)
        break
    }

    // await this.createLotteries(category, lotteries)

    Bull.add(LotteryStartJob.key, {
      category: category,
      lotteries: lotteries
    })
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
    let lotteries = await this.LotteryRepository.browse({ filter: filter }).fetch()
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
    }

    console.log('test')

    // console.log(createLotteries)
  }


  timeConverter (nextDate, time, days, isBefore = false) {
    if(!time) {
      return
    }

    let datetime = moment(nextDate)
		datetime = isBefore ? datetime.subtract(days, 'days') : datetime.add(days, 'days')
    return datetime.format(`YYYY-MM-DD ${time}:00`)
  }

  nextDate (category) {
    const type = _.get(category, 'type')
    const preStart = parseInt(_.get(category, 'pre_start')) || 0
    const availableDays = _.get(category, 'available_day')
    const specialDays = _.get(category, 'special_day')
    const holidays = _.get(category, 'holiday')

    // console.log(availableDays, specialDays, holidays)

    const startTime = _.get(category, 'start_time')
    const startTimes = _.split(startTime, ':')
    const startHour = parseInt(startTimes[0])
    let date = moment().subtract(1, 'day').subtract(startHour, 'hours')

		let dateFormat
    // for (let i = 0; i < 14; i++) {
    for (let i = 0; i <= preStart; i++) {
      date.add(1, 'day')

      dateFormat = date.format('YYYY-MM-DD')

      // console.log(date.format('YYYY-MM-DD'), date.isoWeekday())

      if(holidays) {
        if(_.includes(holidays, dateFormat)) {
          continue
        }
      }

      if(specialDays) {
        if(_.includes(specialDays, dateFormat)) {
          return dateFormat
        }
      }

      if(availableDays) {
        const currentWeekday = date.isoWeekday()
        if (!_.includes(availableDays, currentWeekday)) {
          // console.log(`Skip Weekday ${currentWeekday}`)
          continue
        }
      } else if(_.eq(type, 'government')) {
        // console.log('Skip Government')
        continue
      }

    }
		return dateFormat

  }
}

module.exports = LotteryStartRepository

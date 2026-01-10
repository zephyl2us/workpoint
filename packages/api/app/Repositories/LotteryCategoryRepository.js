'use strict'

const _ = use('lodash')
const moment = use('moment')
// const Cache = use('Cache')
const Redis = use('Redis')
// const Config = use('Config')
// const Event = use('Event')
const Helper = use('App/Helper')
const Database = use('Database')
const Pusher = use('Pusher')
// const LogRepository = make('App/Repositories/LogRepository')

class LotteryCategoryRepository {

  static get inject() {
    return [
      'App/Models/Lottery',
      'App/Models/LotteryCategory',
      // 'App/Repositories/LotteryRepository',
    ]
  }

  constructor(Lottery, LotteryCategory) {
    this.Lottery = Lottery
    this.LotteryCategory = LotteryCategory
    // this.LotteryCategoryRepository = LotteryCategoryRepository
    // this.Redis = Redis.connection('lotto_common')
    // this.RedisRO = Redis.connection('lotto_common_ro')
    this.cacheDuration = 60
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('LotteryCategory', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

  async findBy(field, value) {
    return await this.LotteryCategory.findBy(field, value)
  }

  async update(category, data) {
    category = _.assign(category, _.pick(data, [
      'is_enable'
    ]))

    let availableDays = []
    if(_.isArray(data.available_day)) {
      _.each(data.available_day, (day) => {
        if(day >= 1 && day <= 7) {
          // console.log(day)
          availableDays.push(day)
          _.uniq(availableDays)
        }
      })
      category.available_day = availableDays
    }


    let specialDays = []
    if(_.isArray(data.special_day)) {
      specialDays = this.renderSpecialDay(data.special_day)
      category.special_day = specialDays
    }

    let holidays = []
    if(_.isArray(data.special_day)) {
      holidays = this.renderSpecialDay(data.holiday)
      category.holiday = holidays
    }
    
    if (await category.save()) {
      return category
    }

    return false
  }

  async getEnableZones (zones) {
    const filter = {
      type: 'yeekee',
      zones: zones,
      is_enable: true
    }

    let categories = await this.browse({ filter }).fetch()

    categories = categories.toJSON()
    const categoryZones = []
    
    _.each(categories, (category) => {
      if(!_.includes(categoryZones, category.zone)) {
        categoryZones.push(category.zone)
      }
    })

    return categoryZones
  }

  renderSpecialDay (days) {
    let specialDays = []

    _.each(days, (day) => {
      if(moment().isBefore(day)) {
        specialDays.push(day)
      }
    })

    return specialDays
  }
}

module.exports = LotteryCategoryRepository

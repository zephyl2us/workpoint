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

class LotteryRepository {

  static get inject() {
    return [
      'App/Models/Lottery',
      // 'App/Models/LotteryCategory',
      'App/Repositories/LotteryCategoryRepository',
    ]
  }

  constructor(Lottery, LotteryCategoryRepository) {
    this.Lottery = Lottery
    // this.LotteryCategory = LotteryCategory
    this.LotteryCategoryRepository = LotteryCategoryRepository
    this.Redis = Redis.connection('lottery')
    
    this.cacheDuration = 60
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('Lottery', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
		return await Cache.model(this.Lottery, `lottery:${id}`, 60, async () => {
			return await this.Lottery.findOrFail(id)
		})
	}

	async findBy(field, value) {
		return await this.Lottery.findByOrFail(field, value)
	}

  // async findBy(field, value, options = { mode: 'write' }) {
  //   // let query = Helpers.clusterDb(this, 'Lotto', {
  //   //   mode: options.mode
  //   // })

  //   let query = this.Lottery.query()

  //   if (field === 'id') {
  //     return query.find(value)
  //   }
  //   return query.findBy(field, value)
  // }

  async create(data) {
    const lottery = await this.Lottery.create(data)
    // await lottery.reload()
    // Event.fire('lottery::created', lottery)
    return lottery
  }

  async createMany(data) {
    const lotteries = await this.Lottery.createMany(data)
    // await lottery.reload()
    // Event.fire('lottery::created', lottery)
    return lotteries
  }

  async update(lottery, data) {

    // if (_.has(data, 'result')) {
    //   data.result = data.result
    // }

    if (_.has(data, 'end_at')) {
      data.end_at = moment(data.end_at).format('YYYY-MM-DD HH:mm:ss')
    }

    if (_.has(data, 'result_at')) {
      data.result_at = moment(data.result_at).format('YYYY-MM-DD HH:mm:ss')
    }

    if (_.has(data, 'process_start_at')) {
      data.process_start_at = moment(data.process_start_at).format('YYYY-MM-DD HH:mm:ss')
    }

    if (_.has(data, 'process_end_at')) {
      data.process_end_at = moment(data.process_end_at).format('YYYY-MM-DD HH:mm:ss')
    }

    if (_.has(data, 'payout_start_at')) {
      data.payout_start_at = moment(data.payout_start_at).format('YYYY-MM-DD HH:mm:ss')
    }

    if (_.has(data, 'payout_end_at')) {
      data.payout_end_at = moment(data.payout_end_at).format('YYYY-MM-DD HH:mm:ss')
    }

    lottery.merge(data)
    const lotteryData = lottery.toJSON()

    if (await lottery.save()) {

      const id = lottery.id
      await this.updateNotification(_.assign({ id: id }, lotteryData))

      // await this.clearCache()
      // const cacheKey = `lotto:${lotto.type}:${lotto.uid}`
      // await this.Redis.del(cacheKey)

      return lottery
    }

    return false
  }

  updateNotification (data) {
    // console.log(data)
    const id = _.get(data, 'id')
    // const publicData = _.pick(data, [
    //   'id',
    //   'result',
    //   'start_at',
    //   'end_at',
    //   'result_at',
    //   'status',
    // ])
    const publicData = data

    Pusher.trigger(`lottery`, 'update', publicData)
    Pusher.trigger(`lottery.${id}`, 'update', publicData)
  }

  async getStockByDate(date) {

    const query = this.browse({
      filter: {
        date: date,
        type: 'stock'
      },
      options: { db: 'read' }
    })

    const filter = {
      type: 'stock'
    }
    let categories = await this.LotteryCategoryRepository.browse({ 
      filter,
      options: { db: 'read' }
    }).fetch()

    categories = categories.toJSON()

    const categoryIds = _.map(categories, (category) => category.id)
    query.whereIn('lottery_category_id', categoryIds)


    let lotteries = await query.fetch()
    lotteries = lotteries.toJSON()

    lotteries = _.map(lotteries, (lottery) => {
      lottery.result = JSON.parse(lottery.result)
      return lottery
    })

    // console.log(`lotteries size: ${_.size(lotteries)}`)

    return lotteries

  }

  async getLotteryLasted (type) {
    const categoryFilter = {
      type: type
    }


    let categories = await this.LotteryCategoryRepository.browse({ 
      filter: categoryFilter,
      options: { db: 'read' }
    })
    .fetch()
    categories = categories.toJSON()

    const categoryIds = _.map(categories, (category) => category.id)
    let lotteries = []
    const categoryIdString = _.join(categoryIds, ',')

    const resultCount = 1
    lotteries = await Database.raw(`select lottery.* from (select * , Row_Number() over (partition by lottery_category_id order by date desc) as rw from lotteries where type = '${type}' and status = 'finished' and \`lottery_category_id\` in (${categoryIdString})) lottery where lottery.rw <= '${resultCount}'`)
    lotteries = _.get(lotteries, '0')

    lotteries = _.map(lotteries, (lottery) => {
      lottery.date = moment(lottery.date).format('YYYY-MM-DD')
      lottery.start_at = moment(lottery.start_at).format('YYYY-MM-DD HH:mm:ss')
      lottery.end_at = moment(lottery.end_at).format('YYYY-MM-DD HH:mm:ss')
      lottery.result_at = lottery.result_at ? moment(lottery.result_at).format('YYYY-MM-DD HH:mm:ss') : null
      lottery.result = JSON.parse(lottery.result)
      lottery.created_at = moment(lottery.created_at).format('YYYY-MM-DD HH:mm:ss')
      lottery.updated_at = moment(lottery.updated_at).format('YYYY-MM-DD HH:mm:ss')
      if(_.has(lottery, 'rw')) {
        delete lottery.rw
      }

      return lottery
    })

    // console.log(`stock lotteries size: ${_.size(lotteries)}`)

    return lotteries
  }

  async getLotteryBySlug (type, slug) {

    const filter = {
      type: type,
      slug: slug
    }

    let lotteries = await this.browse({
      filter
    }).fetch()

    lotteries = lotteries.toJSON()

    lotteries = _.map(lotteries, (lottery, i) => {
      lottery.result = JSON.parse(lottery.result)
      lottery.round = _.size(lotteries) - i
      return lottery
    })

    return lotteries
  }

  // async getLastedYeekeeByDate(date) {
    
  //   const query = this.browse({
  //     filter: {
  //       date: date,
  //     },
  //     options: { db: 'read' }
  //   })
  //   .groupBy('lotteries.slug')

  //   let categories = await this.LotteryCategoryRepository.browse({ 
  //     filter,
  //     options: { db: 'read' }
  //   }).fetch()

  //   categories = categories.toJSON()


  // }
  
  async getYeekeeByDate(date, options = { zone: null, slug: null, has_result: null, result_count: null }) {

    const categoryFilter = {
      type: 'yeekee'
    }

    if(_.result(options, 'slug')) {
      categoryFilter.slug = options.slug
    } else if(_.result(options, 'zone')) {
      categoryFilter.zone = options.zone
    }

    let categories = await this.LotteryCategoryRepository.browse({
      filter: categoryFilter,
      options: { db: 'read' }
    })
    .fetch()
    categories = categories.toJSON()

    const categoryIds = _.map(categories, (category) => category.id)

    // console.log(options)
    let lotteries = []
    const resultCount = _.get(options, 'result_count')
    const hasResult = _.get(options, 'has_result')
    if(resultCount) {
      const categoryIdString = _.join(categoryIds, ',')
      lotteries = await Database.raw(`select lottery.* from (select * , Row_Number() over (partition by lottery_category_id order by round desc) as rw from lotteries where date = '${date}' and type = 'yeekee' and status = 'finished' and \`lottery_category_id\` in (${categoryIdString})) lottery where lottery.rw <= '${resultCount}'`)
      lotteries = _.get(lotteries, '0')
    } else {
      const filter = {
        date: date,
        type: 'yeekee'
      }

      if(hasResult) {
        filter.status = 'finished'
      }

      const query = this.browse({
        filter,
        options: { db: 'read' }
      })

      query.whereIn('lottery_category_id', categoryIds)

      lotteries = await query.fetch()
      lotteries = lotteries.toJSON()
    }

    lotteries = _.map(lotteries, (lottery) => {
      lottery.date = moment(lottery.date).format('YYYY-MM-DD')
      lottery.start_at = moment(lottery.start_at).format('YYYY-MM-DD HH:mm:ss')
      lottery.end_at = moment(lottery.end_at).format('YYYY-MM-DD HH:mm:ss')
      lottery.result_at = lottery.result_at ? moment(lottery.result_at).format('YYYY-MM-DD HH:mm:ss') : null
      lottery.result = JSON.parse(lottery.result)
      lottery.created_at = moment(lottery.created_at).format('YYYY-MM-DD HH:mm:ss')
      lottery.updated_at = moment(lottery.updated_at).format('YYYY-MM-DD HH:mm:ss')
      if(_.has(lottery, 'rw')) {
        delete lottery.rw
      }

      return lottery
    })

    // console.log(`yeekee lotteries size: ${_.size(lotteries)}`)

    return lotteries

  }
}

module.exports = LotteryRepository

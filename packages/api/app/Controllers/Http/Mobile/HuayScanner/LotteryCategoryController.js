'use strict'

const _ = use('lodash')
const moment = use('moment')
const md5 = use('md5')
const Helper = use('App/Helper')

class LotteryCategoryController {
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

  async index ({ guard, auth, request, params, response }) {
    const filter = {
      is_enable: true
    }

    let categories = await this.LotteryCategoryRepository.browse({ 
      filter,
      options: { db: 'read' }
    }).fetch()

    categories = categories.toJSON()

    // console.log(categories)

    // Development : If not admin disable some data.
    const data = {
      records: categories
    }

    return response.ok(data)
  }
}

module.exports = LotteryCategoryController

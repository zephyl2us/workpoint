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
    const filter = {}
    const sort = 'id|asc'

    let categories = await this.LotteryCategoryRepository.browse({ filter, sort }).fetch()

    categories = categories.toJSON()

    // console.log(categories)

    // Development : If not admin disable some data.
    const data = {
      records: categories
    }

    return response.ok(data)
  }

	async update ({ request, response, params }) {
    const { id } = params
		const category = await this.LotteryCategoryRepository.findBy('id', id)

		const props = request.only(['available_day', 'special_day', 'holiday', 'is_enable'])

		const updated = await this.LotteryCategoryRepository.update(category, props)

    if(!updated) {
      return response.status(400).json({
        code: 'nothing_update',
        message: 'Nothing Update'
      })
    }

    updated.available_day = JSON.parse(updated.available_day)
    updated.special_day = JSON.parse(updated.special_day)
    updated.holiday = JSON.parse(updated.holiday)

		return response.ok({
			status: 'success',
			code: 'lottery_category_updated',
			record: updated
		})
	}
}

module.exports = LotteryCategoryController

'use strict'

const _ = use('lodash')
const Redis = use('Redis')
const Bull = use('Bull')
const Helper = use('App/Helper')

class CollectionController {

	static get inject() {
		return [
			'App/Repositories/Movie/CollectionRepository',
		]
	}

	constructor(CollectionRepository) {
    this.CollectionRepository = CollectionRepository
	}

  async index ({request, response}) {
		const currentPage = request.input('page', 1)
		const search = request.input('search', 1)

		const filter = _.assign({}, request.only(['search']), {
		})

    let collections = await this.CollectionRepository
			.browse({ filter: filter })
			.paginate(currentPage)

    return response.status(200).json({
      records: _.get(collections.toJSON(), 'data'),
      pagination: Helper.pager(collections),
    })
  }

}

module.exports = CollectionController

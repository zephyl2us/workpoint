'use strict'

const _ = use('lodash')
const Redis = use('Redis')
const Bull = use('Bull')
const Helper = use('App/Helper')

class GenreController {

	static get inject() {
		return [
			'App/Repositories/Movie/GenreRepository',
		]
	}

	constructor(GenreRepository) {
    this.GenreRepository = GenreRepository
	}

  async index ({request, response}) {
		const currentPage = request.input('page', 1)
		const search = request.input('search', 1)

		const filter = _.assign({}, request.only(['search']), {
		})

    let genres = await this.GenreRepository
			.browse({ filter: filter })
			.paginate(currentPage)

    return response.status(200).json({
      records: _.get(genres.toJSON(), 'data'),
      pagination: Helper.pager(genres),
    })
  }

}

module.exports = GenreController

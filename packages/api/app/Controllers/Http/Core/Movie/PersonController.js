'use strict'

const _ = use('lodash')
const Redis = use('Redis')
const Bull = use('Bull')
const Helper = use('App/Helper')

class PersonController {

	static get inject() {
		return [
			'App/Repositories/Movie/PersonRepository',
		]
	}

	constructor(PersonRepository) {
    this.PersonRepository = PersonRepository
	}

  async index ({request, response}) {
		const currentPage = request.input('page', 1)
		const search = request.input('search', 1)

		const filter = _.assign({}, request.only(['search']), {
		})

    let people = await this.PersonRepository
			.browse({ filter: filter })
			.paginate(currentPage)

    return response.status(200).json({
      records: _.get(people.toJSON(), 'data'),
      pagination: Helper.pager(people),
    })
  }

}

module.exports = PersonController

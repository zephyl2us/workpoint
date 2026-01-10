'use strict'

const _ = use('lodash')
const Redis = use('Redis')
const Bull = use('Bull')
const Helper = use('App/Helper')

class CompanyController {

	static get inject() {
		return [
			'App/Repositories/Movie/CompanyRepository',
		]
	}

	constructor(CompanyRepository) {
    this.CompanyRepository = CompanyRepository
	}

  async index ({request, response}) {
		const currentPage = request.input('page', 1)
		const search = request.input('search', 1)

		const filter = _.assign({}, request.only(['search']), {
		})

    let companies = await this.CompanyRepository
			.browse({ filter: filter })
			.paginate(currentPage)

    return response.status(200).json({
      records: _.get(companies.toJSON(), 'data'),
      pagination: Helper.pager(companies),
    })
  }

}

module.exports = CompanyController

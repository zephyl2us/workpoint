'use strict'

const _ = use('lodash')
const Config = use('Config')
const Redis = use('Redis')
const Bull = use('Bull')
const Helper = use('App/Helper')
const CryptoJS = use("crypto-js")

class ProxyController {

	static get inject() {
		return [
			'App/Repositories/ArmyAntProxyRepository',
		]
	}

	constructor(ArmyAntProxyRepository) {
		this.ArmyAntProxyRepository = ArmyAntProxyRepository
	}

  async index ({request, response}) {
		// const currentPage = request.input('page', 1)
		// const userId = request.input('user_id', null)
		// const search = request.input('search')

		const filter = _.assign({}, request.only(['search']), {
		})

    let proxies = await this.ArmyAntProxyRepository
			.browse({ filter: filter, sort: 'aircard_label|asc' })
			.fetch()
			// .paginate(currentPage)

		proxies = proxies.toJSON()

    return response.status(200).json({
      records: proxies
    })
  }
}

module.exports = ProxyController

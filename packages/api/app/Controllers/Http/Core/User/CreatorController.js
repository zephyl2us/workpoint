'use strict'

const _ = use('lodash')
const Config = use('Config')
const Redis = use('Redis')
const Bull = use('Bull')
const Helper = use('App/Helper')

class CreatorController {

	static get inject() {
		return [
			'App/Repositories/UserRepository',
		]
	}

	constructor(UserRepository) {
    this.UserRepository = UserRepository
	}

  async index ({request, response}) {
		const currentPage = request.input('page', 1)
		const search = request.input('search', 1)

		const filter = _.assign({}, request.only(['search']), {
			group: 'admin'
		})

    let users = await this.UserRepository
			.browse({ filter: filter })
			.fetch()

		users = users.toJSON()

		const creators = []
		_.each(users, (user) => {
			const creator = user
			creators.push(creator)
		})

    return response.status(200).json({
      records: creators,
    })
  }
}

module.exports = CreatorController

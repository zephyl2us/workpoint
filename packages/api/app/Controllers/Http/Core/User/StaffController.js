'use strict'

const _ = use('lodash')
const Config = use('Config')
const Redis = use('Redis')
const Bull = use('Bull')
const Helper = use('App/Helper')

class StaffController {

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
			.paginate(currentPage)

    return response.status(200).json({
      records: _.get(users.toJSON(), 'data'),
      pagination: Helper.pager(users),
    })
  }

	async store ({ request, response }) {
		const props = request.only(['display_name', 'username', 'password'])
		const permissions = request.input('permissions')

		// console.log(props, permissions)

		props.username = `${props.username}@core`
		props.group = 'admin'

		const user = await this.UserRepository.create(props)
		const createPermission = await this.UserRepository.createPermission({
			user_id: user.id,
			group: user.group,
			payload: permissions
		})

		return response.ok({
			status: 'success',
			code: 'staff_created',
			record: user
		})
	}

	async view ({ request, response, params }) {
		const id = params.id

		const filter = {
			id: id
		}

		let user = await this.UserRepository
			.browse({ filter: filter })
			.first()

    if(!user) {
      return response.status(404).json({
        message: 'request.user.notfound'
      })
    }

		const permissions = await this.UserRepository.permission(user)

		user = user.toJSON()

    return response.status(200).json({
      record: user,
			permissions: permissions
    })
	}

	async update ({ request, response, params }) {
		const user = await this.UserRepository.findBy('id', params.id)

		const props = request.only([])

		const password = request.input('password')
		
		if (password) {
			_.assign(props, { password: password })
		}

		const updated = await this.UserRepository.update(user, props)

		// // For subuser we update permission too
		const permissions = request.input('permissions')
		if (_.size(permissions)) {
			await this.UserRepository.updatePermission(user, permissions)
		}

		return response.ok({
			status: 'success',
			code: 'staff_updated',
			user: updated
		})
	}

	async permission ({ request, response }) {
		const permissions = Config.get(`acl.admin`)

		return {
			permissions: permissions
		}
	}

}

module.exports = StaffController

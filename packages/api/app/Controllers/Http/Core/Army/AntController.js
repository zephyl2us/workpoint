'use strict'

const _ = use('lodash')
const moment = use('moment')
const Config = use('Config')
const Redis = use('Redis')
const Bull = use('Bull')
const Helper = use('App/Helper')
const CryptoJS = use("crypto-js")

class AntController {

	static get inject() {
		return [
			'App/Repositories/ArmyAntRepository',
			'App/Repositories/ArmyAntBotRepository',
			'App/Repositories/ArmyAntSecurityRepository',
		]
	}

	constructor(ArmyAntRepository, ArmyAntBotRepository, ArmyAntSecurityRepository) {
    this.ArmyAntRepository = ArmyAntRepository
		this.ArmyAntBotRepository = ArmyAntBotRepository
		this.ArmyAntSecurityRepository = ArmyAntSecurityRepository
	}

  async index ({request, response}) {
		const currentPage = request.input('page', 1)
		const userId = request.input('user_id', null)
		const status = request.input('status', null)
		// const search = request.input('search')

		const filter = _.assign({}, request.only(['id', 'search']), {
			group: 'admin',
			created_user_id: userId,
			status: status
		})
		
    let ants = await this.ArmyAntRepository
			.browse({ filter: filter })
			.with('photo')
			.with('passwords', (builder) => {
				builder
					.where('status', 'active')
				})
			.with('creator', (builder) => {
				builder
					.select('id', 'display_name', 'username')
				})
			.paginate(currentPage)

		const records = _.get(ants.toJSON(), 'data')
		const pagination = Helper.pager(ants)

		for(let i = 0; i < _.size(records); i++) {
			const record = records[i]
			const latestBot = await this.ArmyAntBotRepository.browse({ filter: {
				army_ant_id: record.id
			}})
			.orderBy('id', 'desc')
			.first()

			if(latestBot) {
				record.latest_bot = latestBot.toJSON()
			}
		}

    return response.status(200).json({
      records: records,
      pagination: pagination,
    })
  }

	async store ({ auth, request, response }) {
		const authUser = auth.user
		const userId = authUser.id
		const props = request.all()

		props.created_user_id = userId

		const ant = await this.ArmyAntRepository.create(props)

		if(!ant) {
      return response.status(400).json({
				code: 'create.army.create_failed',
        message: 'Create failed'
      })
		}

		const antId = ant.id

		const preSecurityData = {
			army_ant_id: antId,
			created_user_id: userId
		}

		const googlePassword = _.get(props, 'password.google')
		if(googlePassword) {
			const data = _.assign({}, preSecurityData, {
				social: 'google',
				password: googlePassword,
			})
			const createdGooglePassword = await this.ArmyAntSecurityRepository.createOrUpdate(data)
		}

		const groupIds = ['3347124', '3347125', '3347126']
		const groupId = _.get(props, 'group_id')
		let adsPowerGroupId = '0'
		if(_.includes(groupIds, groupId)) {
			adsPowerGroupId = groupId
		}

		const farm = await this.ArmyAntRepository.farmUserCreate(ant, adsPowerGroupId)

		if(!farm) {
      return response.status(400).json({
				code: 'create.army.create_farm_failed',
        message: 'Create farm failed'
      })
		}

    const farmId = _.get(farm, 'data.id')

		await this.ArmyAntRepository.update(ant, {
			adspower_id: farmId
		})

		return response.ok({
			status: 'success',
			code: 'army_ant_created',
			record: ant
		})
	}

	async view ({ request, response, params }) {
		const id = params.id

		const filter = {
			id: id
		}

		let ant = await this.ArmyAntRepository
			.browse({ filter: filter })
			.with('passwords', (builder) => {
				builder
					.where('status', 'active')
				})
			.with('creator', (builder) => {
				builder
				.select('id', 'display_name', 'username')
				})
			.first()

    if(!ant) {
      return response.status(404).json({
        message: 'request.army_ant.notfound'
      })
    }

		ant = ant.toJSON()

    return response.status(200).json({
      record: ant
    })
	}

	async update ({ auth, request, response, params }) {
		const ant = await this.ArmyAntRepository.findBy('id', params.id)

		const authUser = auth.user
		const userId = authUser.id
		const props = request.all()
		
		const updated = await this.ArmyAntRepository.update(ant, props)

		const antId = ant.id

		const preSecurityData = {
			army_ant_id: antId,
			created_user_id: userId
		}

		const googlePassword = _.get(props, 'password.google')
		if(googlePassword) {
			const data = _.assign({}, preSecurityData, {
				social: 'google',
				password: googlePassword,
			})
			const createdGooglePassword = await this.ArmyAntSecurityRepository.createOrUpdate(data)
		}

		const facebookPassword = _.get(props, 'password.facebook')
		if(facebookPassword) {
			const data = _.assign({}, preSecurityData, {
				social: 'facebook',
				password: facebookPassword,
			})
			const createdFacebookPassword = await this.ArmyAntSecurityRepository.createOrUpdate(data)
		}

		const instagramPassword = _.get(props, 'password.instagram')
		if(instagramPassword) {
			const data = _.assign({}, preSecurityData, {
				social: 'instagram',
				password: instagramPassword,
			})
			const createdInstagramPassword = await this.ArmyAntSecurityRepository.createOrUpdate(data)
		}

		const tiktokPassword = _.get(props, 'password.tiktok')
		if(tiktokPassword) {
			const data = _.assign({}, preSecurityData, {
				social: 'tiktok',
				password: tiktokPassword,
			})
			const createdTiktokPassword = await this.ArmyAntSecurityRepository.createOrUpdate(data)
		}

		const linePassword = _.get(props, 'password.line')
		if(linePassword) {
			const data = _.assign({}, preSecurityData, {
				social: 'line',
				password: linePassword,
			})
			const createdLinePassword = await this.ArmyAntSecurityRepository.createOrUpdate(data)
		}

		return response.ok({
			status: 'success',
			code: 'army_ant_updated',
			record: updated
		})
	}

	async updateSocial ({ auth, request, response, params }) {
		const ant = await this.ArmyAntRepository.findBy('id', params.id)

		const authUser = auth.user
		const userId = authUser.id
		const props = request.only([
			'gmail_status',
			'facebook_id', 
			'facebook_status',
			'instagram_id', 
			'instagram_status',
			'tiktok_id', 
			'tiktok_status',
			'youtube_id', 
			'youtube_status'
		])
		
		const updated = await this.ArmyAntRepository.update(ant, props)
		
		return response.ok({
			status: 'success',
			code: 'army_ant_updated',
			record: updated
		})
	}

	async destroy ({ auth, request, response, params }) {
		const ant = await this.ArmyAntRepository.findBy('id', params.id)

		const authUser = auth.user
		const userId = authUser.id
		const props = request.all()

    if(!ant) {
      return response.status(404).json({
        message: 'request.army_ant.notfound'
      })
    }

		const farm = await this.ArmyAntRepository.farmUserDelete(ant)

		// console.log(`farm`, farm)

		if(!farm) {
      return response.status(400).json({
				code: 'army.delete_farm_failed',
        message: 'Delete farm failed'
      })
		}

		const deleted = await this.ArmyAntRepository.delete(ant)

		return response.ok({
			status: 'success',
			code: 'army_ant_deleted',
		})
	}

}

module.exports = AntController

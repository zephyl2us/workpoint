'use strict'

const md5 = require('md5')

const _ = use('lodash')
const moment = use('moment')
const Env = use('Env')
const Bull = use('Bull')
const Redis = use('Redis')
const Pusher = use('Pusher')
const Helper = use('App/Helper')
const ExtOneUser = use('App/Models/ExtOneUser')
const CampaignLottooneJob = use('App/Jobs/CampaignLottoone')
const rp = use('request-promise')

class CampaignController {

	static get inject() {
		return [
			'App/Repositories/CampaignRepository',
			'App/Repositories/CampaignUserRepository',
			'App/Repositories/SmsRepository',
		]
	}

  constructor(CampaignRepository, CampaignUserRepository, SmsRepository) {
    this.CampaignRepository = CampaignRepository
    this.CampaignUserRepository = CampaignUserRepository
		this.SmsRepository = SmsRepository

    this.domain = Helper.isDevMode() ? `backend.lotter.lab` : `lotter.tech`
    this.api = Helper.isDevMode() ? `http://127.0.0.1:8888` : `https://lotter.tech`
    this.checkerEndpoint = `${this.api}/service/transition/checker`
    this.apiKey = `YPWBbZ0NOnqvJNWhfHCw5jCaL1pNwoB9`
  }

  async index ({ request, response }) {
		const currentPage = request.input('page', 1)
		const search = request.input('search')

		const filter = {
			// group: 'admin',
			// created_user_id: userId,
			// status: status
		}
		
    let campaigns = await this.CampaignRepository
			.browse({ filter: filter })
			.paginate(currentPage)

		const records = _.get(campaigns.toJSON(), 'data')
		const pagination = Helper.pager(campaigns)

    return response.status(200).json({
      records: records,
      pagination: pagination,
    })
  }

  async view ({ request, response, params }) {
		const id = params.id
		const currentPage = request.input('page', 1)

		const filter = {
			id: id
		}

		let campaign = await this.CampaignRepository
			.browse({ filter: filter })
			.first()

    if(!campaign) {
      return response.status(404).json({
        message: 'request.campaign.notfound'
      })
    }

		campaign = campaign.toJSON()

		const userFilter = {
			campaign_id: id,
			// created_user_id: userId,
			// status: status
		}
		
    let users = await this.CampaignUserRepository
			.browse({ filter: userFilter })
			.paginate(currentPage)

		const records = _.get(users.toJSON(), 'data')
		const pagination = Helper.pager(users)

    return response.status(200).json({
      record: campaign,
      users: records,
      pagination: pagination
    })
  }

  async updateStatus ({ auth, request, response, params }) {
		const authUser = auth.user
		const actorId = authUser.id

		const status = request.input('status')
		const isCalling = request.input('is_calling')
    // console.log(props)

		const userId = params.user_id
		const user = await this.CampaignUserRepository.findBy('id', userId)

    if(!_.get(user, 'id')) {
      return response.status(400).json({
        code: 'query.not_found',
        message: 'User not found'
      })
    }

		if (user.actor_user_id && !_.eq(actorId, user.actor_user_id)) {
      return response.status(400).json({
        code: 'campaign.assigned_to_another_agent',
        message: 'Member is assigned to another agent'
      })
		}

		if (isCalling && _.eq(status, 'calling')) {
			if (_.eq(user.status,'waiting')) {
				const updated = await this.CampaignUserRepository.update(user, {
					status: 'calling',
					actor_user_id: actorId
				})
			}

			return response.ok({
				// status: 'success',
			})
		}

		if (!user.actor_user_id) {
      return response.status(400).json({
        code: 'campaign.not_assign',
        message: 'Member is not assign'
      })
		}
		
		if (!_.includes(['calling', 'answered', 'no_answer', 'rejected', 'unreachable'], status)) {
      return response.status(400).json({
        code: 'campaign.status_invalid',
        message: 'Status Invalid'
      })
		}
		
		const updated = await this.CampaignUserRepository.update(user, {
			status: status
		})

    if(!updated) {
      return response.status(400).json({
        code: 'nothing_update',
        message: 'Nothing Update'
      })
    }

		return response.ok({
			status: 'success',
			code: 'campaign.status_updated',
			record: updated
		})
  }

	async sendSms ({ auth, request, response, params }) {
		const authUser = auth.user
		const actorId = authUser.id

		// const mobile = request.input('mobile')
		// const message = request.input('message')
    // console.log(props)

		const userId = params.user_id
		const user = await this.CampaignUserRepository.findBy('id', userId)

    if(!_.get(user, 'id')) {
      return response.status(400).json({
        code: 'query.not_found',
        message: 'User not found'
      })
    }

		if (user.actor_user_id && !_.eq(actorId, user.actor_user_id)) {
      return response.status(400).json({
        code: 'campaign.assigned_to_another_agent',
        message: 'Member is assigned to another agent'
      })
		}

		if (!user.actor_user_id) {
      return response.status(400).json({
        code: 'campaign.not_assign',
        message: 'Member is not assign'
      })
		}

		const status = user.status
		const mobile = user.mobile
		
		if (!_.includes(['answered', 'no_answer', 'rejected', 'unreachable'], status)) {
      return response.status(400).json({
        code: 'campaign.status_invalid',
        message: 'Status Invalid'
      })
		}
		
		const sendSmsCount = user.send_sms_count || 0
		const updated = await this.CampaignUserRepository.update(user, {
			send_sms_count: sendSmsCount + 1
		})

    if(!updated) {
      return response.status(400).json({
        code: 'nothing_update',
        message: 'Nothing Update'
      })
    }


		const from = 'ONE'
		const phone = mobile
		// const phone = '0956387138'
		const message = request.input('message')
		const driver = 'clicksend'

		await this.SmsRepository.send(from, phone, message, driver)

		return response.ok({
			status: 'success',
			code: 'campaign.sms_sended',
			// record: updated
		})
	}

	async checker ({ auth, request, response, params }) {
		const authUser = auth.user
		const actorId = authUser.id

		const userId = params.user_id
		const user = await this.CampaignUserRepository.findBy('id', userId)

    if(!_.get(user, 'id')) {
      return response.status(400).json({
        code: 'query.not_found',
        message: 'User not found'
      })
    }

		if (user.actor_user_id && !_.eq(actorId, user.actor_user_id)) {
      return response.status(400).json({
        code: 'campaign.assigned_to_another_agent',
        message: 'Member is assigned to another agent'
      })
		}

		if (!_.eq(user.status, 'answered')) {
      return response.status(400).json({
        code: 'campaign.not_answered',
        message: 'Member is not answered'
      })
		}

		if (!user.actor_user_id) {
      return response.status(400).json({
        code: 'campaign.not_assign',
        message: 'Member is not assign'
      })
		}

    // const data = {
    //   mobile: user.mobile,
    // }

    const timestamp = moment().unix()
    const url = `${this.checkerEndpoint}?mobile=${user.mobile}&timestamp=${timestamp}`
    const options = {
      method: 'GET',
      uri: url,
      json: true,
      headers: {
        'service-secret': `${this.apiKey}`,
        'X-Domain': this.domain
      },
      // body: data
    }

    let rp = await this.request(options)

		// console.log(rp)

		const isRegister = _.get(rp, 'is_register')
		const isLogin = _.get(rp, 'is_login')
		const deposit = _.get(rp, 'deposit')

		// if ()

    const ExtOneUser = use('App/Models/ExtOneUser')
		let query = ExtOneUser.query()

		query.where('role', 'member')
		query.where('mobile', user.mobile)

		const oneUser = await query.first()

		const oneUserStatus = oneUser?.status
		if (oneUser && oneUserStatus == 'active' && isRegister) {
			oneUser.status = 'transfered'
			oneUser.save()
		}


		let isUpdate = false
		const updateData = {}

		if (!_.eq(isRegister, user.is_register)) {
			updateData.is_register = isRegister
			isUpdate = true
		}
		if (!_.eq(isLogin, user.is_login)) {
			updateData.is_login = isLogin
			isUpdate = true
		}
		if (!_.eq(deposit, user.deposit)) {
			updateData.deposit = deposit
			isUpdate = true
		}

		if (_.has(updateData, 'is_register') || _.has(updateData, 'is_login') || _.has(updateData, 'deposit')) {
			await this.CampaignUserRepository.update(user, updateData)
		}

		return response.ok({
			status: 'success',
			code: 'campaign.user_updated',
			// record: updated
		})
	}

	async one ({ request, response }) {
		const currentPage = request.input('page', 1)
		const agentIds = request.input('agent_ids') || null
		const conditions = request.input('conditions') || []

		// agentIds = 
		const filter = {}

		if (agentIds) {
			filter.agent_ids = agentIds.split(',')
		}

		if (_.size(conditions)) {
			filter.conditions = conditions
		}

		const users = await this.queryUsers(filter).paginate(currentPage)

		const records = _.get(users.toJSON(), 'data')
		const pagination = Helper.pager(users)

    // console.log(reward)
    return response.status(200).json({
      records: records,
      pagination: pagination,
    })
	}

  async storeOne ({ auth, request, response }) {
		const authUser = auth.user
		const actorId = authUser.id

		const props = request.all()
    // console.log(props)

		const filter = {}

		if (_.size(props.agent_ids)) {
			filter.agent_ids = props.agent_ids
		}

		if (_.size(props.conditions)) {
			filter.conditions = props.conditions
		}

		let agents = await ExtOneUser.query().where('role', 'agent').fetch()

		agents = agents.toJSON().map(agent => {
			return {
				id: agent.one_user_id,
				label: _.lowerCase(agent.username)
			}
		})

		const users = await this.queryUsers(filter).paginate(1)

		const records = _.get(users.toJSON(), 'data')
		const pagination = Helper.pager(users)

    const totalPage = pagination.last_page
    // const totalPage = 1

    const campaign = await this.CampaignRepository.create({
      name: props.name,
      total_user: pagination.total,
      total_answered: 0,
      total_no_answer: 0,
      total_rejected: 0,
      total_unreachable: 0,
      total_register: 0,
      total_login: 0,
      payload: {
        agent_ids: filter.agent_ids,
        condition: filter.conditions
      }
    })

    const campaignId = campaign.id

    for(let i = 1; i <= totalPage; i++) {
      // console.log(`Page : ${i}`)
      Bull.add(CampaignLottooneJob.key, {
        filter: filter,
        page: i,
        campaign_id: campaignId
      })
    }

    // _.each(users, (user) => {
    //   console.log(user.id)
    // })

    // _.size(users.toJSON())

		return response.ok({
			status: 'success',
			code: 'campaign_created',
			record: campaign
		})
 
  }

	queryUsers (filter, select = '*') {
		let query = ExtOneUser.query()

		query.where('role', 'member')

		if (_.has(filter, 'agent_ids')) {
			query.whereIn('agent_user_id', filter.agent_ids)
		}

		const conditions = filter.conditions

		// console.log(`conditions`, conditions)

		for (let i = 0; i < _.size(conditions); i++) {
			const filter = conditions[i]
			let condition = '='

			if (filter.condition == 'more') {
				condition = '>='
			} else if (filter.condition == 'less') {
				condition = '<'
			}

			query.where(filter.key, condition, filter.value)
		}
		
		return query
	}

  async request (options) {
    const result = await rp(options)
    .then(function (response) {
      return response
    })
    .catch(function (error) {
      return error
    })
    
    return result
	}
}

module.exports = CampaignController

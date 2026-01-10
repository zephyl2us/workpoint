'use strict'

const md5 = require('md5')

const _ = use('lodash')
const moment = use('moment')
const Env = use('Env')
const Redis = use('Redis')
const Pusher = use('Pusher')
const Helper = use('App/Helper')
const ExtOneUser = use('App/Models/ExtOneUser')

class OneController {
  constructor() {
    this.Redis = Redis.connection('temp')
    this.cacheDuration = 86400
  }

	async index ({ request, response }) {
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

		let agents = await ExtOneUser.query().where('role', 'agent').fetch()

		agents = agents.toJSON().map(agent => {
			return {
				id: agent.one_user_id,
				label: _.lowerCase(agent.username)
			}
		})

		const users = await this.queryUsers(filter).paginate(currentPage)

		const records = _.get(users.toJSON(), 'data')
		const pagination = Helper.pager(users)

    // console.log(reward)
    return response.status(200).json({
      records: records,
			agents: agents,
      pagination: pagination,
    })
	}

	async export ({ request, response }) {
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

		let agents = await ExtOneUser.query().where('role', 'agent').fetch()

		agents = agents.toJSON().map(agent => {
			return {
				id: agent.one_user_id,
				label: _.lowerCase(agent.username)
			}
		})

		try {
      const filename = `one_${moment().unix()}.csv`

			console.log(filename)

      let csvContent = ''
      csvContent = `first_name,last_name,mobile\r\n`

			const users = await this.queryUsers(filter).fetch()

			_.each(users.toJSON(), (user) => {

				let mobile = user.mobile

				if (!mobile) return true

				mobile = _.replace(mobile, '#', '')
				mobile = `+66${mobile}`
				mobile = _.replace(mobile, '+660', '66')

				csvContent += `${user.first_name},${user.last_name},${mobile}\r\n`
			})

      response.header('Content-Type', 'text/csv')
      response.header('Content-Disposition', `attachment; filename="${filename}"`)
      
      return response.send(csvContent)

		} catch (error) {
      console.error('Error downloading data:', error)
      return response.status(500).send({ error: 'Failed to download data' })
		}
		// const users = await this.queryUsers(filter).paginate(currentPage)

		// const records = _.get(users.toJSON(), 'data')

	}

	queryUsers (filter) {
		let query = ExtOneUser.query()

		query.where('role', 'member')

		if (_.has(filter, 'agent_ids')) {
			query.whereIn('agent_user_id', filter.agent_ids)
		}

		const conditions = filter.conditions

		console.log(`conditions`, conditions)

		for (let i = 0; i < _.size(conditions); i++) {
			const filter = conditions[i]
			let condition = '='

			if (filter.condition == 'more') {
				condition = '>'
			} else if (filter.condition == 'less') {
				condition = '<'
			}

			query.where(filter.key, condition, filter.value)
		}
		
		return query
	}
}

module.exports = OneController

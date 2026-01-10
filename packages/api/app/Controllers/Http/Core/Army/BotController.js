'use strict'

const { format } = require("util")

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
		]
	}

	constructor(ArmyAntRepository, ArmyAntBotRepository) {
    this.ArmyAntRepository = ArmyAntRepository
		this.ArmyAntBotRepository = ArmyAntBotRepository
	}

  async index ({request, response}) {
    const date = request.input('date')
		const currentPage = request.input('page', 1)

		const filter = _.assign({}, request.only(['search', 'status']), {
			date: date
		})

    let bots = await this.ArmyAntBotRepository
			.browse({ filter: filter })
			.with('ant', (builder) => {
				builder.with('creator')
			})
			.paginate(currentPage)

		let records = _.get(bots.toJSON(), 'data')
		
		// for(let i = 0; i < _.size(records); i++) {
		// 	let record = records[i]
		// 	console.log(record.payload)
		// 	// record.payload = JSON.parse(record.payload)
			
		// 	records[i] = record
		// }
		// for (let item of records) {
		// 	item.payload = JSON.parse(item.payload)
		// }

    return response.status(200).json({
      records: records,
      pagination: Helper.pager(bots),
    })
  }

  async stats ({request, response}) {
    const date = request.input('date')

    const stats = await this.ArmyAntBotRepository.getStatsByDate(date)

    return response.status(200).json({
			stats
		})
  }

  async monitor ({request, response}) {
    const config = await this.ArmyAntBotRepository.getConfig()

		const filter = {
			statuses: ['ready', 'running']
		}

		let bots = await this.ArmyAntBotRepository
			.browse({ filter: filter })
			.with('ant')
			.fetch()

		bots = bots.toJSON()

		for(let i = 0; i < _.size(bots); i++) {
			const bot = bots[i]
			const activities = await this.ArmyAntBotRepository.getActivityById(bot.id)

			bots[i].activities = activities || []
		}

    return response.status(200).json({
      config: config,
			records: bots
    })
  }

	async start ({request, response}) {
		await this.ArmyAntBotRepository.updateConfig({
			automation: true
		})

		return response.ok({
			status: 'success',
			code: 'army_automation_started',
		})
	}

	async stop ({request, response}) {
		let config = {
			automation: false
		}

		await this.ArmyAntBotRepository.updateConfig(config)

		return response.ok({
			status: 'success',
			code: 'army_automation_stopped',
		})
	}
}

module.exports = AntController

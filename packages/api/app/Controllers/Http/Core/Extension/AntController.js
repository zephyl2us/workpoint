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
      'App/Repositories/Army/AddressRepository',
      'App/Repositories/Army/ImageRepository',
		]
	}

	constructor(ArmyAntRepository, ArmyAntBotRepository, AddressRepository, ImageRepository) {
    this.ArmyAntRepository = ArmyAntRepository
    this.ArmyAntBotRepository = ArmyAntBotRepository
		this.AddressRepository = AddressRepository
		this.ImageRepository = ImageRepository
	}
  
  async ant ({ request, params, response }) {
		const adspowerId = params.id

		const filter = {
			adspower_id: adspowerId
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

    const addresses = await this.AddressRepository.all()
		let province = null
		let district = null
		let tambon = null

		if(_.get(ant, 'province_id')) {
      const provinceId = _.get(ant, 'province_id')
      const pIndex = _.findIndex(addresses, ['id', provinceId])

      const p = _.get(addresses, `${pIndex}`)
			province = _.get(p, 'name')

			if(_.get(ant, 'district_id')) {
				const districts = _.get(p, 'district')
				const districtId = _.get(ant, 'district_id')
				const dIndex = _.findIndex(districts, ['id', districtId])
	
				const d = _.get(districts, `${dIndex}`)
				district = _.get(d, 'name')
				
				if(_.get(ant, 'tambon_id')) {
					const tambons = _.get(d, 'tambon')
					const tambonId = _.get(ant, 'tambon_id')
					const tIndex = _.findIndex(tambons, ['id', tambonId])
		
					const t = _.get(tambons, `${tIndex}`)
					tambon = _.get(t, 'name')
					
				}
			}
		}

		ant.province = province
		ant.district = district
		ant.tambon = tambon

		// console.log(ant)

		const pvaData = await this.getPvaData(ant.email)
		// console.log(pvaData)

		ant.default_google_password = _.get(pvaData, 'password')
		ant.default_google_recovery = _.get(pvaData, 'recovery')

		const filterBot = {
			army_ant_id: ant.id,
			status: 'running'
		}

		let antBot = await this.ArmyAntBotRepository
			.browse({ filter: filterBot })
			.first()

    return response.status(200).json({
      record: ant,
			bot: antBot ? antBot.toJSON() : null
    })
  }

	async forceStop ({ request, params, response }) {
		const botId = params.bot_id
		let checkpointPath = null
		let screenshot = request.input('screenshot') || null
		
		if (screenshot) {
			screenshot = screenshot.replace(/^data:image\/\w+;base64,/, "");
			const buffer = Buffer.from(screenshot, 'base64')
			const upload = await this.ImageRepository.uploadPhotoCheckpoint(botId, buffer)
			if (upload.status === 200) checkpointPath = upload.path
		}

		const bot = await this.ArmyAntBotRepository.find(botId)

		const antId = _.get(bot, 'army_ant_id')
		if(!antId) {
      return response.status(404).json({
        message: 'request.army_ant_bot.notfound'
      })
		}

    const updated = await this.ArmyAntBotRepository.update(bot, {
			screenshot: checkpointPath,
      stopped_at: moment().format('YYYY-MM-DD HH:mm:ss')
    })

    return response.status(200).json({
			status: 'success'
		})
	}

  async storeBotActivity ({ request, params, response }) {
		const botId = params.bot_id

		const action = request.input('action')
		const url = request.input('url') || ''
		const payload = request.input('payload') || {}

		const bot = await this.ArmyAntBotRepository.find(botId)

		const antId = _.get(bot, 'army_ant_id')
		if(!antId) {
      return response.status(404).json({
        message: 'request.army_ant_bot.notfound'
      })
		}

		const data = {
			action,
			url,
			...payload
		}

		await this.ArmyAntBotRepository.createActivityById(botId, data)

    return response.status(200).json({
			status: 'success',
			data
		})
	}

	async getBotActivity ({ request, params, response }) {
		const botId = params.bot_id
		const bot = await this.ArmyAntBotRepository.find(botId)

		const antId = _.get(bot, 'army_ant_id')
		if(!antId) {
      return response.status(404).json({
        message: 'request.army_ant_bot.notfound'
      })
		}

		const activities = await this.ArmyAntBotRepository.getActivityById(botId)

    return response.status(200).json({
			status: 'success',
			activities
		})
	}


	async getPvaData (email) {
		// console.log(email)
		const fs = use('fs')
		const path = require('path');

		const directoryPath = path.join(__dirname, '../../../../../storages/pva')

		const exist = fs.existsSync(directoryPath)
		// console.log(directoryPath)
		if (!exist) return false
		
		let results = []
		// console.log('test 1')

		let result = false

		const readFile = (path, option = 'utf-8') =>
			new Promise((resolve, reject) => {
				fs.readFile(path, option, (err, data) => {
					if (err) reject(err)
					else resolve(data)
				})
			})

		const filePath = `${directoryPath}/email.csv`
		const res = await readFile(filePath)
		// console.log(res)
		
		const users = _.split(res, "\r\n")
		// console.log(users)
		for(let user of users) {
			user = _.replace(user, / /g, '')
			const userSplit = _.split(user, ',')

			const userEmail = _.get(userSplit, '0')
			// console.log(email, userEmail)
			
			if(_.eq(email, userEmail)) {
				result = {
					email: userEmail,
					password: _.get(userSplit, '1'),
					recovery: _.get(userSplit, '2')
				}
				// console.log(result)

				break
			}

			// const data = {
			// 	email: userEmail,
			// 	password: _.get(userSplit, '1'),
			// 	recovery: _.get(userSplit, '2')
			// }
			
			// results.push(data)
		}

		return result
	}
}

module.exports = AntController

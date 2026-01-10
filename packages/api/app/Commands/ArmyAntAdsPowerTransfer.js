'use strict'

const { Command } = require('@adonisjs/ace')
const _ = use('lodash')
const moment = use('moment')
const rp = use('request-promise')
const Config = use('Config')
const Bull = use('Bull')
const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')
const AdsPowerRepository = make('App/Repositories/AdsPowerRepository')

const apiUrl = 'https://adspower-01.megatron.team'

class ArmyAntAdsPowerTransfer extends Command {
  static get signature () {
    return 'ant:transfer'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {
    const users = await this.getProfileData()

		// console.log(_.size(users))
		// console.log()
		
		const filter = {
			deploy: 0
		}

    let ants = await ArmyAntRepository
			.browse({ filter: filter, sort: 'id|asc' })
			.limit(300)
			.fetch()
		// for()

		ants = ants.toJSON()
		// console.log(ants)

		for(let i = 0; i < _.size(ants); i++) {
			const antData = ants[i]
			const adsPowerId = _.get(antData, 'adspower_id')

			if(!adsPowerId) {
				// console.log(`#${antData.id} : No AdsPower Id`)
				continue
			}

			const farmData = _.get(users, adsPowerId)

			if(!_.has(farmData, 'name')) {
				// console.log(`#${antData.id} : No AdsPower Name`)
				continue
			}
			
			const createFarm = await AdsPowerRepository.createUser(farmData)
	
			const farmId = _.get(createFarm, 'data.id')

			if(!farmId) {
				// console.log(`#${antData.id} : Cann't Create Farm`)
				continue
			}

			if(_.size(farmData.tags)) {
				// for(let i = 0; i < _.size(farmData.tags); i++) {
				// 	const tag = farmData.tags[i]
				// 	const addTag = await GoLoginRepository.addTagToProfile({
				// 		title: tag.title,
				// 		color: tag.color,
				// 		profile_id: goLoginId
				// 	})
				// }
			}

			let data = {
				adspower_id: farmId,
				gmail_status: _.get(farmData, 'gmail_status'),
				facebook_status: _.get(farmData, 'facebook_status'),
				instagram_status: _.get(farmData, 'instagram_status'),
				tiktok_status: _.get(farmData, 'tiktok_status'),
				deploy: 1
			}

			if(_.get(farmData, 'is_bot')) {
				data['type'] = 'user'
			}

			const ant = await ArmyAntRepository.findBy('id', antData.id)
			await ArmyAntRepository.update(ant, data)
		}

		// return response.ok('ok')
    // console.log(`Completed`)
    return
  }

	async getProfileData () {
		const fs = require('fs')
		const dataFile = `./data/adspower_20231124.csv`
		
		if (!fs.existsSync(dataFile)){
			// console.log('no data')
			return
		}

    const userFile = fs.readFileSync(dataFile, 'utf8')
		const files = userFile.split("\n")

		const size = _.size(files)
		let records = []
		let users = {}
		for(let i = 0; i < size; i++) {
			const index = size - 1 - i
			let data = files[index]

			const regex = /,,"\[?.*\]"$/g
			const found = data.match(regex)

			// console.log(data)
			let cookie = null
			if(found) {
				data = _.replace(data, found, ',,,')
				cookie = _.replace(found, ',,"[', '[')
				cookie = _.replace(cookie, ']",', ']')
				cookie = _.replace(cookie, new RegExp("\"\"","g"), '"')
				cookie = _.replace(cookie, new RegExp("\\\\","g"), '\\')
				cookie = _.replace(cookie, new RegExp("\"$", "g"), '')

				// const cookies = JSON.parse(cookie)

				// _.each(cookies, (c, i) => {
				// 	c.expirationDate = c.expires

				// 	_.unset(c, 'expires')

				// 	cookies[i] = c
				// })

				// cookie = cookies
			}

			const largeCookie = /Cookie too large and exceeds Excel\'s grid limits$/g
			const findLargeCookie = data.match(largeCookie)

			let isLargeCookie = false
			if(findLargeCookie) {
				isLargeCookie = true
				data = _.replace(data, 'Cookie too large and exceeds Excel\'s grid limits', ',')
			}
			data = _.replace(data, ',,,,,,', '')

			// console.log(data)
			const dataSplit = _.split(data, ',')

			const group = _.get(dataSplit, 2)
			let groupId = '0'
      let remark = ''
			if(group === 'NEW') {
				// groupId = 'NEW'
			} else if(isLargeCookie) {
				// groupId = 'Cookie'
        remark = 'Large Cookie'
			} else if(group === 'NBC') {
				groupId = '3347125'
			} else if(group === 'TMB') {
				groupId = '3347126'
			} else if(group === 'EMP') {
				groupId = '3347124'
			// } else {
			// 	groupId = 'Ungrouped'
			}

			// console.log(dataSplit)

			let gmailStatus = 0
			let facebookStatus = 0
			let instagramStatus = 0
			let tiktokStatus = 0
			let isBot = 0
			const dataSlice = dataSplit.slice(4)
			// console.log(dataSlice)
			_.each(dataSlice, (value) => {
				value = _.replace(value, new RegExp("\"","g"), '')
				// console.log(value)

				if(value === 'Gmail') {
					gmailStatus = 1
				} else if(value === 'Facebook') {
					facebookStatus = 1
				} else if(value === 'Instagram') {
					instagramStatus = 1
				} else if(value === 'Tiktok') {
					tiktokStatus = 1
				} else if(value === '_______ Gmail') {
					gmailStatus = 3
				} else if(value === '_______ FB') {
					facebookStatus = 3
				} else if(value === '_______ IG') {
					instagramStatus = 3
				} else if(value === 'Bot ______') {
					isBot = 1
				} else if(value === 'ban') {
					facebookStatus = 0
					instagramStatus = 0
					tiktokStatus = 0
				}
			})

			const record = {
				name: _.get(dataSplit, 3),
				group_id: groupId,
				cookie: cookie,
        remark: remark,
				user_proxy_config: {
					proxy_soft: 'no_proxy'
				},
				fingerprint_config: {
					automatic_timezone: '1',
					language: ['en-US','en','th-TH','th'],
					ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
					screen_resolution: '1440_3088'
				},

				is_bot: isBot,
				gmail_status: gmailStatus,
				facebook_status: facebookStatus,
				instagram_status: instagramStatus,
				tiktok_status: tiktokStatus
			}

			const id = _.get(dataSplit, 1)
			users[id] = record
		}

		return users
	}

}

module.exports = ArmyAntAdsPowerTransfer

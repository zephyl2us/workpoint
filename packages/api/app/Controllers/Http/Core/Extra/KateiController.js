'use strict'

const md5 = require('md5')

const _ = use('lodash')
const moment = use('moment')
const Env = use('Env')
const Redis = use('Redis')
const Pusher = use('Pusher')
// const BullTestJob = use('App/Jobs/BullTest')

class KateiController {
  constructor() {
    this.Redis = Redis.connection('temp')
    this.cacheDuration = 86400
  }

	async index ({ request, response }) {
		const reward = await this.getReward()
    // console.log(reward)
    return response.status(200).json({
      reward: reward,
    })
	}

	async update ({ auth, request, response }) {
		const reward = await this.getReward()
		const props = request.all()

		const timestamp = _.get(reward, 'timestamp')
		const newTimestamp = _.get(props, 'timestamp')

		if(timestamp > newTimestamp) {
      return response.status(400).json({
        message: 'Update failed'
      })
		}

		const data = this.mergeRewardData(reward, props)

    Pusher.trigger(`extra.katei`, 'update', data)
		
		const cacheKey = `katei:reward`
		const cached = JSON.stringify(data)
		await this.Redis.set(cacheKey, cached)
		await this.Redis.expire(cacheKey, this.cacheDuration)

		return response.ok({
			status: 'success'
		})
	}

	async getReward () {
		const cacheKey = `katei:reward`
		let cached = await this.Redis.get(cacheKey)

		if (!cached) {
			let data = {
				curtain_open: false,
				reward_status: 0,
				reward_1: {
					label: 'ทองคำแท่งหนัก 1 บาท',
					number: null,
					name: null,
				},
				reward_2: {
					label: 'โทรศัพท์ iPhone 16',
					number: null,
					name: null,
				},
				reward_3: {
					label: 'ทองรูปพรรณ 2 สลึง',
					number: null,
					name: null,
				},
				timestamp: moment().valueOf()
			}

			cached = JSON.stringify(data)
      await this.Redis.set(cacheKey, cached)
      await this.Redis.expire(cacheKey, this.cacheDuration)
		}

		const result = JSON.parse(cached)
		return result
	}

	mergeRewardData (originalData, newData) {
		// สร้าง deep clone ของข้อมูลเดิม
		const updatedData = JSON.parse(JSON.stringify(originalData));
		
		// อัพเดทข้อมูลระดับบนสุด
		if (newData.hasOwnProperty('curtain_open')) {
				updatedData.curtain_open = newData.curtain_open;
		}
		if (newData.hasOwnProperty('reward_status')) {
				updatedData.reward_status = newData.reward_status;
		}
		
		// อัพเดทข้อมูลรางวัล
		['reward_1', 'reward_2', 'reward_3'].forEach(rewardKey => {
				if (newData[rewardKey]) {
						// อัพเดทเฉพาะฟิลด์ที่มีในโครงสร้างเดิม
						const reward = newData[rewardKey];
						if (reward.hasOwnProperty('label')) {
								updatedData[rewardKey].label = reward.label;
						}
						if (reward.hasOwnProperty('number')) {
								updatedData[rewardKey].number = reward.number;
						}
						if (reward.hasOwnProperty('name')) {
								updatedData[rewardKey].name = reward.name;
						}
				}
		});
		
		return updatedData;
	}
}

module.exports = KateiController

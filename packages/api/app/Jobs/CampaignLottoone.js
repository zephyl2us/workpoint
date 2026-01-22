'use strict'

const _ = use('lodash')
const moment = use('moment')
const Redis = use('Redis')
const Helper = make('App/Helper')
const CampaignUserRepository = make('App/Repositories/CampaignUserRepository')

class CampaignLottoone {
  // static get connection() {
  //   return "remote";
  // }

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'CampaignLottoone-job'
  }

  // This is where the work is done.
  async handle(job) {
    const { data } = job

    const filter = data.filter
    const page = data.page
		const campaignId = data.campaign_id

		try {
			const users = await this.queryUsers(filter).paginate(page)

			const records = _.get(users.toJSON(), 'data')
			const pagination = Helper.pager(users)

			for (let i = 0; i < _.size(records); i++) {
				const record = records[i]
				// console.log(record.one_user_id)

				const user = await CampaignUserRepository.findBy('mobile', record.mobile)

				if (!user) {
					await CampaignUserRepository.create({
						campaign_id: campaignId,
						first_name: record.first_name,
						last_name: record.last_name,
						mobile: record.mobile,
						send_sms_count: 0,
						is_register: 0,
						is_login: 0,
						payload: record,
					})
				}
			}

		} catch (e) {
			console.log(e)
			// const dataLogs = {
			// 	title: 'CampaignLottoone-job',
			// 	path: 'app/Jobs',
			// 	channel: 'kue',
			// 	message: e.message,
			// 	data: e,
			// 	params: data
			// }
			// LogRepository.fire(dataLogs)
		} finally {
      // await LotteryResultRepository.clearRequestCache(cacheKey)
		}
  }

	queryUsers (filter) {
    const ExtOneUser = use('App/Models/ExtOneUser')
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
}

module.exports = CampaignLottoone

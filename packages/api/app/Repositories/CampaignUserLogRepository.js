'use strict'

const _ = use('lodash')
const moment = use('moment')
// const Cache = use('Cache')
const Redis = use('Redis')
// const Config = use('Config')
// const Event = use('Event')
const Helper = use('App/Helper')
const Database = use('Database')
const Pusher = use('Pusher')
// const LogRepository = make('App/Repositories/LogRepository')

class CampaignUserLogRepository {

  static get inject() {
    return [
      'App/Models/CampaignUserLog',
    ]
  }

  constructor(CampaignUserLog) {
    this.CampaignUserLog = CampaignUserLog
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('Campaign', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
		return await Cache.model(this.CampaignUserLog, `campaign-user:${id}`, 60, async () => {
			return await this.CampaignUserLog.findOrFail(id)
		})
	}

	async findBy(field, value) {
		return await this.CampaignUserLog.findByOrFail(field, value)
	}

  async create(data) {
    let log = new this.CampaignUserLog()

    log = _.assign(log, _.pick(data, [
      'campaign_user_id',
      'payload',
      'ip',
      'actor_user_id',
    ]))

    // console.log(log)

    if(await log.save()) {
      return log
    }
    return false
  }

}

module.exports = CampaignUserLogRepository

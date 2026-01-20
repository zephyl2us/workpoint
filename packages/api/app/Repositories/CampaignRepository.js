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

class CampaignRepository {

  static get inject() {
    return [
      'App/Models/Campaign',
      'App/Repositories/CampaignUserRepository',
      'App/Repositories/CampaignUserLogRepository',
    ]
  }

  constructor(Campaign, CampaignUserRepository, CampaignUserLogRepository) {
    this.Campaign = Campaign
    this.CampaignUserRepository = CampaignUserRepository
    this.CampaignUserLogRepository = CampaignUserLogRepository
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('Campaign', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
		return await Cache.model(this.Campaign, `campaign:${id}`, 60, async () => {
			return await this.Campaign.findOrFail(id)
		})
	}

	async findBy(field, value) {
		return await this.Campaign.findByOrFail(field, value)
	}

  async create(data) {
    let campaign = new this.Campaign()

    campaign = _.assign(campaign, _.pick(data, [
      'name',
      'total_user',
      'total_answered',
      'total_no_answer',
      'total_rejected',
      'total_unreachable',
      'total_register',
      'total_login',
      'payload',
    ]))

    // console.log(campaign)

    if(await campaign.save()) {
      return campaign
    }
    return false
  }

  async update(campaign, data) {

    campaign = _.assign(campaign, _.pick(data, [
      'total_user',
      'total_answered',
      'total_no_answer',
      'total_rejected',
      'total_unreachable',
      'total_register',
      'total_login',
    ]))
    
    if (await campaign.save()) {
      await Cache.forget(`campaign:${campaign.id}`)
      return campaign
    }

    return false
  }

  async delete(campaign) {
    if (await campaign.delete()) {
      await Cache.forget(`campaign:${campaign.id}`)
      return campaign
    }

    return false
  }
}

module.exports = CampaignRepository

'use strict'

const _ = use('lodash')
const moment = use('moment')
const Cache = use('Cache')
const Redis = use('Redis')
// const Config = use('Config')
// const Event = use('Event')
const Helper = use('App/Helper')
const Database = use('Database')
const Pusher = use('Pusher')
// const LogRepository = make('App/Repositories/LogRepository')

class CampaignUserRepository {

  static get inject() {
    return [
      'App/Models/CampaignUser',
    ]
  }

  constructor(CampaignUser) {
    this.CampaignUser = CampaignUser
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('CampaignUser', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
		return await Cache.model(this.CampaignUser, `campaign-user:${id}`, 60, async () => {
			return await this.CampaignUser.findOrFail(id)
		})
	}

	async findBy(field, value) {
		return await this.CampaignUser.findBy(field, value)
	}

  async create(data) {
    let campaignUser = new this.CampaignUser()

    campaignUser = _.assign(campaignUser, _.pick(data, [
      'campaign_id',
      'first_name',
      'last_name',
      'mobile',
      'status',
      'send_sms_count',
      'is_register',
      'is_login',
      'deposit',
      'payload',
      'actor_user_id',
    ]))

    // console.log(campaignUser)

    if(await campaignUser.save()) {
      return campaignUser
    }
    return false
  }

  async update(campaignUser, data) {

    campaignUser = _.assign(campaignUser, _.pick(data, [
      // 'campaign_id',
      // 'first_name',
      // 'last_name',
      // 'mobile',
      'status',
      'send_sms_count',
      'is_register',
      'is_login',
      'deposit',
      // 'payload',
      'actor_user_id',
    ]))

    // console.log(campaignUser)
    
    if (await campaignUser.save()) {
      await Cache.forget(`campaign-user:${campaignUser.id}`)
      Pusher.trigger(`campaign-user`, 'update', campaignUser)
      Pusher.trigger(`campaign-user.${campaignUser.id}`, 'update', campaignUser)
      return campaignUser
    }

    return false
  }

  async delete(campaignUser) {
    if (await campaignUser.delete()) {
      await Cache.forget(`campaign-user:${campaignUser.id}`)
      return campaignUser
    }

    return false
  }
}

module.exports = CampaignUserRepository

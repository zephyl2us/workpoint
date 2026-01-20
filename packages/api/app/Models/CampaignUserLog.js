'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const moment = use('moment')

class CampaignUserLog extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeSave', async (data) => {
      if (data.dirty.payload) {
        data.payload = JSON.stringify(data.payload)
      }
    })

    this.addHook('afterFind', async (data) => {
      data.payload = JSON.parse(data.payload)
    })

    this.addHook('afterFetch', async (data) => {
      for (let item of data) {
        item.payload = JSON.parse(item.payload)
      }
    })

    this.addHook('afterPaginate', async (data) => {
      for (let item of data) {
        item.payload = JSON.parse(item.payload)
      }
    })
  }

  campaignUser () {
    return this.belongsTo('App/Models/CampaignUser', 'campaign_user_id', 'id')
	}

}

module.exports = CampaignUserLog

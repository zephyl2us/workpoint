'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Filter = use('App/Models/Filters/CampaignUserFilter')
const Sorter = use('App/Models/Sorters/CampaignUserSorter')
const moment = use('moment')

class CampaignUser extends Model {
  static boot () {
    super.boot()

    this.addTrait('@provider:Filterable', Filter)
    this.addTrait('@provider:Sortable', Sorter)
    

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

  campaign () {
    return this.belongsTo('App/Models/Campaign', 'campaign_id', 'id')
	}

}

module.exports = CampaignUser

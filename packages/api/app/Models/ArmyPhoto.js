'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Filter = use('App/Models/Filters/ArmyPhotoFilter')
const Sorter = use('App/Models/Sorters/ArmyPhotoSorter')
const moment = use('moment')

class ArmyPhoto extends Model {
  static boot () {
    super.boot()

    this.addTrait('@provider:Filterable', Filter)
    this.addTrait('@provider:Sortable', Sorter)
		this.addTrait('@provider:Lucid/SoftDeletes')

    this.addHook('beforeSave', async (data) => {
      if (data.dirty.payload) {
        if(data.payload) data.payload = JSON.stringify(data.payload)
      }
    })

    this.addHook('afterFind', async (data) => {
      if(data.payload) data.payload = JSON.parse(data.payload)
    })

    this.addHook('afterFetch', async (data) => {
      for (let item of data) {
        if(item.payload) item.payload = JSON.parse(item.payload)
      }
    })

    this.addHook('afterPaginate', async (data) => {
      for (let item of data) {
        if(item.payload) item.payload = JSON.parse(item.payload)
      }
    })
  }

  ant () {
    return this.belongsTo('App/Models/ArmyAnt', 'army_ant_id', 'id')
	}

  creator () {
    return this.belongsTo('App/Models/User', 'created_user_id', 'id')
	}

}

module.exports = ArmyPhoto

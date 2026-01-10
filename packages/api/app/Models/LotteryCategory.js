'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Filter = use('App/Models/Filters/LotteryCategoryFilter')
const Sorter = use('App/Models/Sorters/LotteryCategorySorter')

class LotteryCategory extends Model {
  static boot () {
    super.boot()

    this.addTrait('@provider:Filterable', Filter)
    this.addTrait('@provider:Sortable', Sorter)

    this.addHook('beforeSave', async (data) => {
      if (data.dirty.available_day) {
        data.available_day = JSON.stringify(data.available_day)
      }
      if (data.dirty.special_day) {
        data.special_day = JSON.stringify(data.special_day)
      }
      if (data.dirty.holiday) {
        data.holiday = JSON.stringify(data.holiday)
      }
    })

    this.addHook('afterFetch', async (data) => {
      for (let item of data) {
        item.available_day = JSON.parse(item.available_day)
        item.special_day = JSON.parse(item.special_day)
        item.holiday = JSON.parse(item.holiday)
      }
    })
  }

  lottery () {
    return this.hasOne('App/Models/Lottery')
	}

}

module.exports = LotteryCategory

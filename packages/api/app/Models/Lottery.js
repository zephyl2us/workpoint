'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Filter = use('App/Models/Filters/LotteryFilter')
const Sorter = use('App/Models/Sorters/LotterySorter')
const _ = use('lodash')
const moment = use('moment')

class Lottery extends Model {
  static boot () {
    super.boot()

    this.addTrait('@provider:Filterable', Filter)
    this.addTrait('@provider:Sortable', Sorter)
    
    this.addHook('beforeSave', async (data) => {
      if (data.dirty.result) {
        data.result = JSON.stringify(data.result)
      }
    })

    this.addHook('afterFetch', async (data) => {
      for (let item of data) {
        item.date = moment(item.date).format('YYYY-MM-DD')
        item.start_at = moment(item.start_at).format('YYYY-MM-DD HH:mm:ss')
        item.end_at = moment(item.end_at).format('YYYY-MM-DD HH:mm:ss')
        item.result_at = item.result_at ? moment(item.result_at).format('YYYY-MM-DD HH:mm:ss') : null
      }
    })

    // this.addHook('afterFind', async (data) => {
    //   console.log(data)
    //   data.date = moment(data.date).format('YYYY-MM-DD')
    //   data.start_at = moment(data.start_at).format('YYYY-MM-DD HH:mm:ss')
    //   data.end_at = moment(data.end_at).format('YYYY-MM-DD HH:mm:ss')
    //   data.result_at = data.result_at ? moment(data.result_at).format('YYYY-MM-DD HH:mm:ss') : null
    // })
  }

  category () {
    return this.belongsTo('App/Models/LotteryCategory')
	}
}

module.exports = Lottery

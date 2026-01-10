'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const _ = use('lodash')
const moment = use('moment')

class LotteryStockResult extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeSave', async (data) => {
      if (data.dirty.result) {
        data.result = JSON.stringify(data.result)
      }
    })

    this.addHook('afterFetch', async (data) => {
      for (let item of data) {
        item.date = moment(item.date).format('YYYY-MM-DD')
      }
    })
  }

  lottery () {
    return this.belongsTo('App/Models/Lottery')
	}
}

module.exports = LotteryStockResult

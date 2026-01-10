'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class LotteryZoneRate extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeSave', async (data) => {
      if (data.dirty.payload) {
        data.payload = JSON.stringify(data.payload)
      }
    })

    this.addHook('afterFetch', async (data) => {
      for (let item of data) {
        item.payload = JSON.parse(item.payload)
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
}

module.exports = LotteryZoneRate

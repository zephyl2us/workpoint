'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Filter = use('App/Models/Filters/MdbSourceFilter')
const Sorter = use('App/Models/Sorters/MdbSourceSorter')

class MdbSource extends Model {
  static boot() {
    super.boot()
    this.addTrait('@provider:Filterable', Filter)
    this.addTrait('@provider:Sortable', Sorter)

    this.addHook('beforeSave', async (data) => {
      if (data.dirty.info) {
        data.info = JSON.stringify(data.info)
        data.transcode_audio = JSON.stringify(data.transcode_audio)
      }
    })

    this.addHook('afterFind', async (data) => {
      data.info = JSON.parse(data.info)
      data.transcode_audio = JSON.parse(data.transcode_audio)
    })

    this.addHook('afterFetch', async (data) => {
      for (let item of data) {
        item.info = JSON.parse(item.info)
        item.transcode_audio = JSON.parse(item.transcode_audio)
      }
    })
  }
}

module.exports = MdbSource

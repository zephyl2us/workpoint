'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Filter = use('App/Models/Filters/MdbMovieMediaFilter')
const Sorter = use('App/Models/Sorters/MdbMovieMediaSorter')

class MdbMovieMedia extends Model {
  static boot() {
    super.boot()
    this.addTrait('@provider:Filterable', Filter)
    this.addTrait('@provider:Sortable', Sorter)

    this.addHook('beforeSave', async (data) => {
      if (data.dirty.transcode_audio) {
        data.transcode_audio = JSON.stringify(data.transcode_audio)
      }
    })

    this.addHook('afterFind', async (data) => {
      data.transcode_audio = JSON.parse(data.transcode_audio)
    })

    this.addHook('afterFetch', async (data) => {
      for (let item of data) {
        item.transcode_audio = JSON.parse(item.transcode_audio)
      }
    })
  }

  movie () {
    return this.belongsTo('App/Models/MdbMovie')
	}

  source () {
    return this.belongsTo('App/Models/MdbSource')
	}
}

module.exports = MdbMovieMedia

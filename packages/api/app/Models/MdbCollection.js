'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Filter = use('App/Models/Filters/MdbCollectionFilter')
const Sorter = use('App/Models/Sorters/MdbCollectionSorter')

class MdbCollection extends Model {
  static boot() {
    super.boot()
    this.addTrait('@provider:Filterable', Filter)
    this.addTrait('@provider:Sortable', Sorter)

    this.addHook('beforeSave', async (data) => {
      if (data.dirty.parts) {
        data.parts = JSON.stringify(data.parts)
      }
    })

    this.addHook('afterFetch', async (data) => {
      for (let item of data) {
        item.parts = JSON.parse(item.parts)
      }
    })
  }
}

module.exports = MdbCollection

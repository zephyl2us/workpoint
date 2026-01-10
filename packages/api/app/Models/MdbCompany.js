'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Filter = use('App/Models/Filters/MdbCompanyFilter')
const Sorter = use('App/Models/Sorters/MdbCompanySorter')

class MdbCompany extends Model {
  static boot() {
    super.boot()
    this.addTrait('@provider:Filterable', Filter)
    this.addTrait('@provider:Sortable', Sorter)
  }
}

module.exports = MdbCompany

'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Filter = use('App/Models/Filters/MdbPersonFilter')
const Sorter = use('App/Models/Sorters/MdbPersonSorter')

class MdbPerson extends Model {
  static boot() {
    super.boot()
    this.addTrait('@provider:Filterable', Filter)
    this.addTrait('@provider:Sortable', Sorter)
  }
}

module.exports = MdbPerson

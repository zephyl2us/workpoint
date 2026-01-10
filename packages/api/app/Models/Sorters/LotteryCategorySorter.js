'use strict'

const ModelSorter = use('ModelSorter')

class LotteryCategorySorter extends ModelSorter {

  static get sortable () {
    return  [
      'id'
    ]
  }

}

module.exports = LotteryCategorySorter

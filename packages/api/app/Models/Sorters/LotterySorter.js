'use strict'

const ModelSorter = use('ModelSorter')

class LotterySorter extends ModelSorter {

  static get sortable () {
    return  [
      'id'
    ]
  }

}

module.exports = LotterySorter

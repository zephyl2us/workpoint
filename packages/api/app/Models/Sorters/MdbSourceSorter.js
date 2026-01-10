'use strict'

const ModelSorter = use('ModelSorter')

class MdbSourceSorter extends ModelSorter {

  static get sortable () {
    return  [
      'id'
    ]
  }

}

module.exports = MdbSourceSorter

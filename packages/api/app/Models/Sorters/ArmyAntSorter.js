'use strict'

const ModelSorter = use('ModelSorter')

class ArmyAntSorter extends ModelSorter {

  static get sortable () {
    return  [
      'id'
    ]
  }

}

module.exports = ArmyAntSorter

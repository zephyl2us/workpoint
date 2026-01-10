'use strict'

const ModelSorter = use('ModelSorter')

class ArmyAntPowerSorter extends ModelSorter {

  static get sortable () {
    return  [
      'id'
    ]
  }

}

module.exports = ArmyAntPowerSorter

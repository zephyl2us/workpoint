'use strict'

const ModelSorter = use('ModelSorter')

class ArmyAntProxySorter extends ModelSorter {

  static get sortable () {
    return  [
      'id',
      'aircard_label'
    ]
  }

}

module.exports = ArmyAntProxySorter

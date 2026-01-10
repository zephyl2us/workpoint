'use strict'

const ModelSorter = use('ModelSorter')

class ArmyAntBotSorter extends ModelSorter {

  static get sortable () {
    return  [
      'id',
      'stopped_at'
    ]
  }

}

module.exports = ArmyAntBotSorter

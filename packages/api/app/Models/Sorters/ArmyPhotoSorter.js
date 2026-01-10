'use strict'

const ModelSorter = use('ModelSorter')

class ArmyPhotoSorter extends ModelSorter {

  static get sortable () {
    return  [
      'id'
    ]
  }

}

module.exports = ArmyPhotoSorter

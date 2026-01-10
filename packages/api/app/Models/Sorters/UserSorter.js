'use strict'

const ModelSorter = use('ModelSorter')

class UserSorter extends ModelSorter {

  static get sortable () {
    return  [
      'id'
    ]
  }

}

module.exports = UserSorter

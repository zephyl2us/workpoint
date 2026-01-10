'use strict'

const ModelSorter = use('ModelSorter')

class MdbMovieCompanySorter extends ModelSorter {

  static get sortable () {
    return  [
      'id'
    ]
  }

}

module.exports = MdbMovieCompanySorter

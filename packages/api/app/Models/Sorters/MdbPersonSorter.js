'use strict'

const ModelSorter = use('ModelSorter')

class MdbMoviePersonSorter extends ModelSorter {

  static get sortable () {
    return  [
      'id'
    ]
  }

}

module.exports = MdbMoviePersonSorter

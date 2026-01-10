'use strict'

const ModelSorter = use('ModelSorter')

class MdbMovieCollectionSorter extends ModelSorter {

  static get sortable () {
    return  [
      'id'
    ]
  }

}

module.exports = MdbMovieCollectionSorter

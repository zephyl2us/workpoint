'use strict'

const ModelSorter = use('ModelSorter')

class MdbMovieMediaSorter extends ModelSorter {

  static get sortable () {
    return  [
      'id'
    ]
  }

}

module.exports = MdbMovieMediaSorter

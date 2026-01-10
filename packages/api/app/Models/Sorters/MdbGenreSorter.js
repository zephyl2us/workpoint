'use strict'

const ModelSorter = use('ModelSorter')

class MdbMovieGenreSorter extends ModelSorter {

  static get sortable () {
    return  [
      'id'
    ]
  }

}

module.exports = MdbMovieGenreSorter

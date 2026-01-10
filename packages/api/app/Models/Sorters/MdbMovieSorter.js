'use strict'

const ModelSorter = use('ModelSorter')

class MdbMovieSorter extends ModelSorter {

  static get sortable () {
    return  [
      'id',
      'popularity',
      'vote_average',
      'original_title',
    ]
  }

}

module.exports = MdbMovieSorter

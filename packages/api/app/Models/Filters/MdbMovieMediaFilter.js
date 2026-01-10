'use strict'

const ModelFilter = use('ModelFilter')

class MdbMovieMediaFilter extends ModelFilter {
  static get dropId () {
    return false
  }

  search (search) {
    //
  }

  id (value) {
    return this.where('id', value)
  }

  ids (value) {
    return this.whereIn('id', value)
  }

  movieId (value) {
    return this.where('mdb_movie_id', value)
  }

  sourceId (value) {
    return this.where('mdb_source_id', value)
  }

  resolution (value) {
    return this.where('resolution', value)
  }

  status (value) {
    return this.where('status', value)
  }

}

module.exports = MdbMovieMediaFilter

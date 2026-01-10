'use strict'

const ModelFilter = use('ModelFilter')

class MdbSourceFilter extends ModelFilter {
  static get dropId () {
    return false
  }

	search(value) {
		return this.where((builder) => {
			builder.where('name', 'LIKE', '%' + value + '%')
			builder.orWhere('file', 'LIKE', '%' + value + '%')
		})
	}


	id (id) {
		return this.where('id', id)
	}

	movieId (id) {
		return this.where('mdb_movie_id', id)
	}

  linked (value) {
    return value ? this.where('mdb_movie_id', 'IS NOT', null) : this.where('mdb_movie_id', null)
  }
}

module.exports = MdbSourceFilter

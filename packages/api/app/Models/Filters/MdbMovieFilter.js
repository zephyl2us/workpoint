'use strict'

const ModelFilter = use('ModelFilter')

class MdbMovieFilter extends ModelFilter {
  static get dropId () {
    return false
  }

	search(value) {
		return this.where((builder) => {
			builder.where('original_title', 'LIKE', '%' + value + '%')
			builder.orWhere('title', 'LIKE', '%' + value + '%')
		})
	}

  id (value) {
    return this.where('id', value)
  }

  ids (value) {
    return this.whereIn('id', value)
  }

  refId (value) {
    return this.where('ref_id', value)
  }

  slug (value) {
    return this.where('slug', value)
  }

  refIds (value) {
    return this.whereIn('ref_id', value)
  }

  originalTitle (value) {
    return this.where('original_title', value)
  }

  title (value) {
    return this.where('title', value)
  }

  originalOverview (value) {
    return this.where('original_overview', value)
  }

  overview (value) {
    return this.where('overview', value)
  }

  budget (value) {
    return this.where('budget', value)
  }

  originalLanguage (value) {
    return this.where('original_language', value)
  }

  release_date (value) {
    return this.where('release_date', value)
  }

  isEnable (value) {
    // console.log(value)
    return value === true ? this.where('is_enable', 1) : this.where('is_enable', 0)
  }
}

module.exports = MdbMovieFilter

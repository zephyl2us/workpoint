'use strict'

const ModelFilter = use('ModelFilter')

class LotteryFilter extends ModelFilter {
  static get dropId () {
    return false
  }

  search (search) {
    //
  }

  id (value) {
    return this.where('id', value)
  }

  lotteryCategoryId (value) {
    return this.where('lottery_category_id', value)
  }

  type (value) {
    return this.where('type', value)
  }

  types (value) {
    return this.whereIn('type', value)
  }

  slug (value) {
    return this.where('slug', value)
  }

  slugs (value) {
    return this.whereIn('slug', value)
  }

  date (value) {
    return this.where('date', value)
  }

  round (value) {
    return this.where('round', value)
  }

}

module.exports = LotteryFilter

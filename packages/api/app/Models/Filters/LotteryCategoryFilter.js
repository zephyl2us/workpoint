'use strict'

const ModelFilter = use('ModelFilter')

class LotteryCategoryFilter extends ModelFilter {
  static get dropId () {
    return false
  }

  search (search) {
    //
  }

  id (value) {
    return this.where('id', value)
  }

  zone (value) {
    // console.log(`zone`, value)
    return this.where('zone', value)
  }

  zones (value) {
    // console.log(`zones`, value)
    return this.whereIn('zone', value)
  }

  slug (value) {
    // console.log(`slug`, value)
    return this.where('slug', value)
  }

  type (value) {
    return this.where('type', value)
  }

  types (value) {
    return this.whereIn('type', value)
  }

  isEnable (value) {
    // console.log(value)
    return value === true ? this.where('is_enable', 1) : this.where('is_enable', 0)
  }

}

module.exports = LotteryCategoryFilter

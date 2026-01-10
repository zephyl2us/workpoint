'use strict'

const ModelFilter = use('ModelFilter')

class MdbPersonFilter extends ModelFilter {
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

  refId (value) {
    return this.where('ref_id', value)
  }

  refIds (value) {
    return this.whereIn('ref_id', value)
  }

}

module.exports = MdbPersonFilter

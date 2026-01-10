'use strict'

const ModelFilter = use('ModelFilter')

class MdbCompanyFilter extends ModelFilter {
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

  ref_id (value) {
    return this.where('ref_id', value)
  }

  ref_ids (value) {
    return this.whereIn('ref_id', value)
  }

}

module.exports = MdbCompanyFilter

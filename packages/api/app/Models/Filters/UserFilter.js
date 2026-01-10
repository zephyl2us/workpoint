'use strict'

const ModelFilter = use('ModelFilter')

class UserFilter extends ModelFilter {
  static get dropId () {
    return false
  }

  search (search) {
    //
  }

  id (value) {
    return this.where('id', value)
  }

  group (value) {
    return this.where('group', value)
  }

  groups (value) {
    return this.whereIn('groups', value)
  }

}

module.exports = UserFilter

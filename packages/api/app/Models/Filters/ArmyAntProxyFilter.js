'use strict'

const ModelFilter = use('ModelFilter')

class ArmyAntProxyFilter extends ModelFilter {
  static get dropId () {
    return false
  }

  id (value) {
    return this.where('id', value)
  }

  ids (value) {
    return this.whereIn('id', value)
  }

  aircardLabel (value) {
    return this.where('aircard_label', value)
  }

  server (value) {
    return this.where('server', value)
  }

  // armyAntId (value) {
  //   return this.where('army_ant_id', value)
  // }

  // status (value) {
  //   return this.where('status', value)
  // }

}

module.exports = ArmyAntProxyFilter

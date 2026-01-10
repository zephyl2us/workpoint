'use strict'

const ModelFilter = use('ModelFilter')

class ArmyAntPowerFilter extends ModelFilter {
  static get dropId () {
    return false
  }

  id (value) {
    return this.where('id', value)
  }

  ids (value) {
    return this.whereIn('id', value)
  }
}

module.exports = ArmyAntPowerFilter

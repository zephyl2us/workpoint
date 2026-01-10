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

  armyAntId (value) {
    return this.where('army_ant_id', value)
  }

  date (value) {
    return this.where('date', value)
  }

  status (value) {
    if(value === 'checkpoint') {
      return this.whereNotNull('checkpoint')
    }

    if(value === 'stopped') {
      return this.where('status', value).whereNull('checkpoint')
    }

    return this.where('status', value)
  }

  statuses (value) {
    return this.whereIn('status', value)
  }
}

module.exports = ArmyAntPowerFilter

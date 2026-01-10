'use strict'

const ModelFilter = use('ModelFilter')

class ArmyAntPowerFilter extends ModelFilter {
  static get dropId () {
    return false
  }

  id (value) {
    return this.where('id', value)
  }

  armyAntId (value) {
    if(value === true) {
      return this.whereNotNull('army_ant_id')
    } else if(value === false) {
      return this.whereNull('army_ant_id')
    }
    return this.where('army_ant_id', value)
  }

  gender (value) {
    return this.where('gender', value)
  }

  ageRange (value) {
    return this.where('age_range', value)
  }
}

module.exports = ArmyAntPowerFilter

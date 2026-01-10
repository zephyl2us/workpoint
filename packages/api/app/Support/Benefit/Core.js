'use strict'

const Repository = require('./Repository')
const PlanGeneric = require('./Drivers/PlanGeneric')

class Core {

  constructor () {
    this._drivers = []
  }

  driver (name = null) {
    return this._drivers[name] = this._get(name)
  }

  _get (name) {
    return this._drivers[name] !== undefined ? this._drivers[name] : this._resolve(name)
  }

  _resolve (name) {
    const driveName = name.charAt(0).toUpperCase() + name.substr(1).toLowerCase()
    const driverMethod = '_createPlan' + driveName + 'Driver'
    return this[driverMethod]()
  }

  _createPlanGenericDriver () {
    return this.repository(new PlanGeneric())
  }

  _createPlanFutureDriver () {
    // TO-DO
  }

  repository (driver) {
    return new Repository(driver)
  }

}

module.exports = Core

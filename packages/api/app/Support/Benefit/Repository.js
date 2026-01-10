'use strict'

const _ = use('lodash')
const Config = use('Config')

class Repository {

  constructor (driver) {
    const benefitConfig = Config.get('benefit')
    this._benefitConfig = _.cloneDeep(benefitConfig)

    this._driver = driver
    this._additional = {}
    this._processing = {}
  }

  _benefit () {
    return this._benefitConfig
  }

  addition (data) {
    const defaults = {
      created_at: null,
      updated_at: null
    }
    this._additional = Object.assign(defaults, data)
    return this
  }

  processing (thePlanYouSelected) {
    this._processing = this._driver.processing(
      this._benefit(),
      thePlanYouSelected,
      this._additional
    )
    return this
  }

  getCombination (plan) {
    const benefit = _.cloneDeep(this._benefit())
    return _.merge(benefit.template, benefit.packages[this._driver.PLAN_NAME])

  }

  _changeToNumber (replacements) {
    _.forIn(replacements, (value, key) => {
      if (_.isObject(value)) {
        this._changeToNumber(value, replacements[key])
      } else {
        replacements[key] = parseFloat(value) || 0
      }
    })
  }

  toJSON () {
    // Change all to the float.
    this._changeToNumber(this._processing)
    return {
      information: {
        plan: this._driver.PLAN_NAME,
        created_at: this._additional.created_at,
        updated_at: this._additional.updated_at,
      },
      commissions: this._processing,
      configuration: {
        // Water bill true mean, we share center commission to master and agent.
        water_bill: true,
				master_returning: this._additional.returning,
				is_mater_share: this._additional.isMasterShare,
        is_agent_share: this._additional.isAgentShare
      }
    }
  }

}

module.exports = Repository

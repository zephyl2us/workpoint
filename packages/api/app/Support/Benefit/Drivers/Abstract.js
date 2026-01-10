'use strict'

const _ = use('lodash')
const Helper = use('App/Helper')
class Abstract {

  _combine (commissions, replacements, plan) {
		const preprocess = _.merge({}, commissions.template, commissions.packages[plan])
		Helper.recursiveLeftMerge(preprocess, replacements)
    return preprocess
  }

  _processingShare (downline, upline, commissions) {
    this._reduction(commissions[downline].share, commissions[upline].share)
  }

  _processingCommissions (downline, upline, commissions) {
    this._reduction(commissions[downline].commissions, commissions[upline].commissions)
  }

  _procsssReturnShare (commissions, returning) {
    const rates = returning
    this._incrementWithRate(commissions['master'].share, commissions['admin'].share, rates)
  }

  _incrementWithRate (compare, defaults, rates) {
    _.forIn(compare, (value, key) => {
      if (_.isObject(value)) {
        this._incrementWithRate(value, defaults[key], rates)
      } else {
        if (_.gt(value, 0)) {
          const rate = parseFloat(_.get(rates, key, 0))
          const adjust = parseFloat(defaults[key]) + parseFloat(value)
          compare[key] -= rate
          defaults[key] = parseFloat(defaults[key]) + rate
        }
      }
    })
  }

  _increment (compare, defaults) {
    _.forIn(compare, (value, key) => {
      if (_.isObject(value)) {
        this._increment(value, defaults[key])
      } else {
        if (_.gt(value, 0)) {
          const adjust = parseFloat(defaults[key]) + parseFloat(value)
          compare[key] -= parseFloat(value)
          defaults[key] = adjust.toFixed(2)
        }
      }
    })
  }

  _reduction (compare, defaults) {
    _.forIn(compare, (value, key) => {
      if (_.isObject(value)) {
				// console.log(key)
        this._reduction(value, defaults[key])
      } else {

        if (_.gt(value, 0)) {
          const adjust = parseFloat(defaults[key]) - parseFloat(value)
          defaults[key] = adjust.toFixed(2)
        }
      }
    })
  }

  /**
   * This method make a bug on json by -10%, 60% 50%.
   *
   * @param {object} commissions
   */
  fixOnAllCondition (combination, additional) {
    // Doing something like hard fixed.
    const baseOnMainGame = 'government'
    const group = ['admin', 'master', 'agent']
    for (let i in group) {
      const g = group[i]
      combination[g].share.member = combination[g].share.games[baseOnMainGame]
      combination[g].share.commission = combination[g].share.games[baseOnMainGame]
    }
  }

}

module.exports = Abstract

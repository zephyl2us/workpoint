'use strict'

const _ = use('lodash')
const moment = use('moment')
const Abstract = use('App/Support/Benefit/Drivers/Abstract')

class PlanGeneric extends Abstract {

  processing (commissions, plan, additional) {
		const combination = this._combine(commissions, plan, 'generic')
    // Processing share.
    this._processingShare('master', 'admin', combination)
    this._processingShare('agent', 'master', combination)
    // Processing commissions.
    // This line below is in the future admin has com?
    // this._processingCommissions('master', 'admin', combination)
    this._processingCommissions('agent', 'master', combination)
    // this._processingCommissions('member', 'agent', combination)
    // this._processingCommissions('advisor', 'agent', combination)

    // Return share to admin.
    if (additional.returning) {
      this._procsssReturnShare(
        combination,
        additional.returning
      )
    }

    this.conditionOnAdminShare(combination)

    this.conditionOnMasterShare(combination)
    this.conditionOnAgentShare(combination)
    this.conditionOnMasterCommission(combination, additional)
    this.conditionOnAgentCommission(combination, additional)
    this.conditionOnSuperaAvisorCommission(combination, additional)
    this.conditionOnAdvisorCommission(combination, additional)
    this.conditionOnMemberCommission(combination, additional)

    // Fix share on member (member rolling commission)
    this.fixOnAllCondition(combination, additional)

    return combination
  }

  /**
   * Devider on the game have double turnover.
   *
   * @param {string} head
   * @param {object} commissions
   * @param {object} additional
   */
  adjustCommissionGameHaveDoubleInsurance (head, commissions, additional, double = 3) {
    _.each(commissions[head].commissions.games, (v, k) => {
      // Apply on game have double insurance.
      if (v === 0) return
      // if (_.indexOf(['pokdeng', 'pokdeng_machine'], k) !== -1) {
      //   const adapt = new Number(v / double)
      //   _.set(commissions[head].commissions, ['games', k], adapt.toPrecision(2))
      // }
    })
  }

  /**
   * Customn commission master.
   *
   * @param {object} commissions
   */
  conditionOnMasterCommission (commissions, additional) {
    this.adjustCommissionGameHaveDoubleInsurance('master', commissions, additional)
  }

  /**
   * Customn commission agent.
   *
   * @param {object} commissions
   */
  conditionOnAgentCommission (commissions, additional) {
    this.adjustCommissionGameHaveDoubleInsurance('agent', commissions, additional)
  }

  /**
   * Special commission on superadvisor.
   */
  conditionOnSuperaAvisorCommission (commissions, additional) {
    this.adjustCommissionGameHaveDoubleInsurance('supervisor', commissions, additional)
  }

  /**
   * Special commission on advisor.
   */
  conditionOnAdvisorCommission (commissions, additional) {
    // This is an november, december promotion.
    // const begin = moment('2019-09-01 00:00:00')
    // const ended = moment('2019-10-31 23:59:59')
    // if (moment(new Date).isBetween(begin, ended) && additional.isAgentShare) {
    //   _.each(commissions.advisor.commissions.games, (value, key) => {
    //     if (value === 0.5) {
    //       const adjust = 1.0
    //       commissions.advisor.commissions.games[key] = adjust.toFixed(2)
    //     }
    //   })
    // }
    // this.adjustCommissionGameHaveDoubleInsurance('advisor', commissions, additional)
  }

  /**
   * Special commission on member,
   * that agent is not registered between 3 months.
   */
  conditionOnMemberCommission(commissions, additional) {
    if (!additional.created_at) return
    // const compare = moment(additional.created_at).add(48, 'months').format('YYYY-MM-DD')
    // const current = moment().format('YYYY-MM-DD')
    // if (moment(compare).isAfter(current)) {
    //   _.update(commissions, 'member.commissions.rolling', (n) => parseFloat(n) + 1.0)
    // }
  }

  /**
   * Condition, on admin sharing.
   */
  conditionOnAdminShare (commissions) {
    _.each(commissions.admin.share.games, (value, key) => {
      commissions.admin.share.affiliates[key] = value
    })
  }

  /**
   * Condition, if master sharing.
   *
   * @param {any} commissions
   */
  conditionOnMasterShare (commissions) {
    // console.log(commissions.master.share.games)
    _.each(commissions.master.share.games, (value, key) => {
      const percentageOfShare = parseFloat(value)
      if (percentageOfShare > 0) {
        // Master share game so, no commission.
        // _.set(commissions.master.share, ['commission_games', key], 0)
        _.set(commissions.master.share, ['commission_games', key], commissions.master.share.games[key])
        _.set(commissions.master.commissions, ['games', key], 0)
      } else {
        // Master not share game still commission.
        _.set(commissions.master.share, ['commission_games', key], commissions.master.share.games[key])
      }
    })
    // Force commissions_game relate share games.
    // commissions.master.share.commission_games = commissions.master.share.games
		commissions.master.share.affiliates = commissions.master.share.games
  }

  /**
   *
   * Condition, id agent share.
   *
   * @param {object} commissions
   * @memberof PlanA
   */
  conditionOnAgentShare (commissions) {
    _.each(commissions.agent.share.games, (value, key) => {
      const percentageOfShare = parseFloat(value)
      if (percentageOfShare > 0) {
        // _.set(commissions['admin'].share, ['affiliates', key], 0)
        // _.set(commissions['master'].share, ['affiliates', key], 0)
        // _.set(commissions.agent.share, ['affiliates', key], 100)

        // Agent share game so, no commission.
        // _.set(commissions.agent.share, ['commission_games', key], 0)
        _.set(commissions.agent.share, ['commission_games', key], commissions.agent.share.games[key])
        _.set(commissions.agent.commissions, ['games', key], 0)
      } else {
        // Agent not share game still commission.
        _.set(commissions.agent.share, ['commission_games', key], commissions.agent.share.games[key])
      }
    })
    // Force commissions_game relate share games.
    // commissions.agent.share.commission_games = commissions.agent.share.games
    commissions.agent.share.affiliates = commissions.agent.share.games
  }

}

PlanGeneric.prototype.PLAN_NAME = 'generic'
module.exports = PlanGeneric

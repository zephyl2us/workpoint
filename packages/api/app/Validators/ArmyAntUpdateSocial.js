'use strict'

const BaseValidator = use('App/Validators/BaseValidator')

class ArmyAntUpdate extends BaseValidator {
  /**
   * Finding group and add to the same as input
   */
  get data () {
    const reqBody = this.ctx.request.all()
    const authUser = this.ctx.auth.user
    const child = this.ctx.request.getChild(authUser)

    return Object.assign(reqBody, { group: child.group })
  }

  get rules () {
    return {
      google_status: 'min:0|max:4',
      facebook_status: 'min:0|max:4',
      instagram_status: 'min:0|max:4',
      tiktok_status: 'min:0|max:4',
    }
  }
}

module.exports = ArmyAntUpdate

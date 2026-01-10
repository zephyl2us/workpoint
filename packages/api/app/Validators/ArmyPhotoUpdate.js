'use strict'

const BaseValidator = use('App/Validators/BaseValidator')

class ArmyPhotoUpdate extends BaseValidator {
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
      gender: 'required|in:male,female,other',
      age_range: 'integer|range:1,7'
    }
  }
}

module.exports = ArmyPhotoUpdate

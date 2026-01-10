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
      // ref_id: '',
      // email: 'required|unique:army_ants',
      // national_id: '',
      first_name: 'required',
      last_name: 'required',
      // nickname: '',
      first_name_en: 'required',
      last_name_en: 'required',
      // nickname_en: '',
      gender: 'required|in:male,female,other',
      birthday: 'required|date',
      phone: 'number',
      address: 'required',
      tambon_id: 'required|number',
      district_id: 'required|number',
      province_id: 'required|number',
      // profile_path: '',
    }
  }
}

module.exports = ArmyAntUpdate

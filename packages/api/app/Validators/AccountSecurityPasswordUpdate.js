'use strict'

const BaseValidator = use('App/Validators/BaseValidator')

class AccountSecurityPasswordUpdate extends BaseValidator {
  get rules () {
    return {
      old_password: 'required|min:8|max:30',
      password: 'required|min:8|max:30',
      password_confirmation: 'required_if:password|same:password|min:8|max:30',
    }
  }
}

module.exports = AccountSecurityPasswordUpdate

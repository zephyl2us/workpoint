'use strict'

const BaseValidator = use('App/Validators/BaseValidator')

class AuthVerifyOtp extends BaseValidator {
  get rules () {
    return {
      phone: 'required|is_mobile',
    }
  }
}

module.exports = AuthVerifyOtp

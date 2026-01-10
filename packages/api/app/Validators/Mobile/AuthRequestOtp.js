'use strict'

const BaseValidator = use('App/Validators/BaseValidator')

class AuthRequestOtp extends BaseValidator {
  get rules () {
    return {
      phone: 'required|is_mobile',
    }
  }
}

module.exports = AuthRequestOtp

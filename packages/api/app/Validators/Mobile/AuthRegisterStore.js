'use strict'

const BaseValidator = use('App/Validators/BaseValidator')

class AuthRegisterStore extends BaseValidator {
  get rules () {
    return {
      phone: 'required|is_mobile',
    }
  }
}

module.exports = AuthRegisterStore

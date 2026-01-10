'use strict'

const BaseValidator = use('App/Validators/BaseValidator')

class AuthLoginStore extends BaseValidator {
  get rules () {
    return {
      phone: 'required|is_mobile',
      password: 'required|min:6|max:20',
    }
  }
}

module.exports = AuthLoginStore

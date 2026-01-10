'use strict'

const BaseValidator = use('App/Validators/BaseValidator')

class UserStore extends BaseValidator {
  get rules () {
    return {
      old_password: 'required|min:6|max:20',
      password: 'required|min:6|max:20',
      password_confirmation: 'required_if:password|same:password|min:6|max:20',
    }
  }
}

module.exports = UserStore

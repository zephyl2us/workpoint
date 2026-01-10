'use strict'

const BaseValidator = use('App/Validators/BaseValidator')

class UserStore extends BaseValidator {
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
      display_name: 'required|min:2|max:30',
      username: 'required|unique:users|min:5|max:30|regex:^\\d*[a-zA-Z_][a-zA-Z_\\d]*$',
      password: 'required|min:8|max:30',
    }
  }
}

module.exports = UserStore

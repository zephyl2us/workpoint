'use strict'

const _ = use('lodash')
const UserRepository = make('App/Repositories/UserRepository')

class Acl {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ auth, guard, response, params }, next, properties) {
    var [ permission ] = properties
    const user = await auth.getUser()
    const group = user.group
    const permissions = await UserRepository.permission(user)
    // console.log(user)
    // console.log(permission)
    // console.log(permissions)

    const hasPermission = _.get(permissions, permission)

    if (!_.includes(['god', 'admin'], group) || !hasPermission) {
      return response.forbidden(`Access Denied on "${permission}"`)
    }
    
    await next()
  }
}

module.exports = Acl

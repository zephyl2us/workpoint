'use strict'

const _ = use('lodash')
const AuthenticationRepository = make('App/Repositories/AuthenticationRepository')

class Shield {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ auth, guard, request, response, params }, next, properties) {

    const user = await auth.getUser()
    const [ app ] = properties
    const token = request.header('user-secret')

    const checker = await AuthenticationRepository.check(app, user, token)

    if(!checker) {
      return response.status(401).send(`Invalid Session`)
    }

    // await AuthenticationRepository.check()
    // var [ permission ] = properties
    // const user = await auth.getUser()
    // const group = user.group
    // const permissions = await UserRepository.permission(user)
    // console.log(user)
    // console.log(permission)
    // console.log(permissions)

    // const hasPermission = _.get(permissions, permission)

    // if (!_.includes(['god', 'admin'], group) || !hasPermission) {
    //   return response.forbidden(`Access Denied on "${permission}"`)
    // }
    
    await next()
  }
}

module.exports = Shield

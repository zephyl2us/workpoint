'use strict'

const _ = use('lodash')
const moment = use('moment')
const md5 = use('md5')
const Helper = use('App/Helper')

class LtobetController {
  static get inject() {
    return [
      'App/Repositories/Ltobet/LtobetUserFunctionRepository'
    ]
  }

  constructor(LtobetUserFunctionRepository) {
    this.LtobetUserFunctionRepository = LtobetUserFunctionRepository
  }

  async dashbord({ response }) {
    const dashboardData = await this.LtobetUserFunctionRepository.dashboard()
    return response.status(200).json({
      records: dashboardData
    })
  }

  async login({ request, response }) {
    const { username, password } = request.all()
    const isLogged = await this.LtobetUserFunctionRepository.ltoUserLogin(username, password)
    if (isLogged) {
      return response.status(200).json({
        message: 'ltobet.user.logged'
      })
    }

    return response.status(400).json({
      message: 'ltobet.user.not_logged'
    })
  }

  async revenue({ params, response }) {
    const ltoUserId = params.id
    const revenue = await this.LtobetUserFunctionRepository.userRevenue(ltoUserId)
    return response.status(200).json({
      records: revenue
    })
  }

  async affliate({ params, response }) {
    const ltoUserId = params.id
    const affliate = await this.LtobetUserFunctionRepository.userAffliate(ltoUserId)
    return response.status(200).json({
      records: affliate
    })
  }

  async downline({ params, response }) {
    const ltoUserId = params.id
    const downline = await this.LtobetUserFunctionRepository.userDownline(ltoUserId)
    return response.status(200).json({
      records: downline
    })
  }
}

module.exports = LtobetController

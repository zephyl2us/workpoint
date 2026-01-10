'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')
const Validator = use('Validator')
const Config = use('Config')

class RequestController {
  static get inject() {
    return [
      'App/Repositories/Army/AddressRepository',
      'App/Repositories/Army/IdentityRepository',
    ]
  }

  constructor(AddressRepository, IdentityRepository) {
    this.AddressRepository = AddressRepository
    this.IdentityRepository = IdentityRepository
  }

  async addressAll({ response }) {
    const addressList = await this.AddressRepository.all()

    return response.status(200).json({
      records: addressList,
    })
  }

  async generatePerson({ response }) {
    const generatePerson = await this.IdentityRepository.random()
    return response.status(200).json({
      record: generatePerson
    })
  }
}

module.exports = RequestController

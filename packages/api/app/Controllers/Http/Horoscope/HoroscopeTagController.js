'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')
const Validator = use('Validator')
const HoroscopeValidator = use('App/Validators/Horoscope')

class HoroscopeTagController {

  static get inject() {
    return [
      'App/Repositories/Horoscope/HoroscopeTagRepository',
    ]
  }

  constructor(HoroscopeTagRepository) {
    this.HoroscopeTagRepository = HoroscopeTagRepository
  }

  
  async create({ request, response }) {

    const rules = HoroscopeValidator.rules().tag_create
    const messages = HoroscopeValidator.messages()

    const validation = await Validator.validate(request.all(), rules, messages)

    if (validation.fails()) {
      return response.status(400).json(Helper.validateMessage(validation.messages()[0].message))
    }

    const data = { 
      horoscope_id: request.input('horoscope_id'),
      tag: request.input('tag')
    }

    const create = await this.HoroscopeTagRepository.create(data)
    if(!create) {
      return response.status(400).json({
        message: 'create.failed'
      })
    }

    return response.status(200).json({
      message: 'create.successful'
    })
  }
}

module.exports = HoroscopeTagController

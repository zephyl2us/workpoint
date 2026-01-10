'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')
const Validator = use('Validator')
const HoroscopeValidator = use('App/Validators/Horoscope')

class HoroscopeController {

  static get inject() {
    return [
      'App/Repositories/Horoscope/HoroscopeFunctionRepository',
      'App/Repositories/Horoscope/HoroscopeLogRepository',
      'App/Repositories/Horoscope/HoroscopeRepository',
    ]
  }

  constructor(HoroscopeFunctionRepository, HoroscopeLogRepository, HoroscopeRepository) {
    this.HoroscopeFunctionRepository = HoroscopeFunctionRepository
    this.HoroscopeLogRepository = HoroscopeLogRepository
    this.HoroscopeRepository = HoroscopeRepository
  }

  async index({ request, response }) {
    const currentPage = _.get(request.get(), 'page') || 1

    const horoscopes = await this.HoroscopeRepository.browse().paginate(currentPage)
    const records = _.get(horoscopes.toJSON(), 'data')

    return response.status(200).json({
      records: records,
      pagination: Helper.pager(horoscopes)
    })
  }

  async search({ request, response }) {
    const query = _.get(request.get(), 'query') || null
    const results = await this.HoroscopeFunctionRepository.search(query)

    // When cannot found any query it will create a LOG 
    if (_.isEmpty(results)) {
      await this.HoroscopeLogRepository.create({ type: 'not_found', log: query })
      return response.status(400).json({
        message: 'query.not_found'
      })
    }

    return response.status(200).json({
      results: results
    })
  }

  async create({ request, response }) {
    const data = request.only([
      'name',
      'describes',
      'primary_number',
      'secondary_number',
      'lucky_number',
      'tags'
    ])

    const rules = HoroscopeValidator.rules().word_create
    const messages = HoroscopeValidator.messages()

    const validation = await Validator.validate(data, rules, messages)

    if (validation.fails()) {
      return response.status(400).json(Helper.validateMessage(validation.messages()[0].message))
    }

    const result = await this.HoroscopeFunctionRepository.createOrUpdate(data)
    return response.status(200).json({
      message: 'create.successful'
    })
  }


  /* Example data format
   * {
   *   id: 1, //required
   *   name: 'รถชน', //required
   *   describes: [ //required
   *     {
   *       type: 'describe', // ['describe', 'predict']
   *       detail: 'ทดสอบ',
   *       order: 1
   *     },
   *     ...
   *   ],
   *   primary_number: 1,
   *   secondary_number: 9,
   *   lucky_number: '42, 22, 42, 048, 771',
   *   tag: [
   *     'รถ',
   *     'ตาย'
   *   ]
   * } 
   * 
   */

  async update({ request, response, params }) {
    const horoscopeId = params.id
    const data = request.only([
      'name',
      'describes',
      'primary_number',
      'secondary_number',
      'lucky_number',
      'tags'
    ])

    _.assign(data, { id: horoscopeId })
    const rules = HoroscopeValidator.rules().word_update
    const messages = HoroscopeValidator.messages()

    const validation = await Validator.validate(data, rules, messages)

    if (validation.fails()) {
      return response.status(400).json(Helper.validateMessage(validation.messages()[0].message))
    }

    const result = await this.HoroscopeFunctionRepository.updateAll(data)
    return response.status(200).json({
      message: 'update.successful'
    })
  }
  
  async delete({ response, params }) {
    const horoscopeId = params.id

    const rules = HoroscopeValidator.rules().word_delete
    const messages = HoroscopeValidator.messages()

    const validation = await Validator.validate(horoscopeId, rules, messages)

    if (validation.fails()) {
      return response.status(400).json(Helper.validateMessage(validation.messages()[0].message))
    }

    const result = await this.HoroscopeFunctionRepository.deleteWithRelations(horoscopeId)
    if (!result) return response.status(400).json({
      message: 'delete.failed'
    })

    return response.status(200).json({
      message: 'delete.successful'
    })
    
  }
}

module.exports = HoroscopeController

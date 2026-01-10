'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')

class HoroscopeFunctionRepository {

  static get inject() {
    return [
      'App/Repositories/Horoscope/HoroscopeRepository',
      'App/Repositories/Horoscope/HoroscopeTagRepository',
      'App/Repositories/Horoscope/HoroscopeDescribeRepository',
    ]
  }

  constructor(HoroscopeRepository, HoroscopeTagRepository, HoroscopeDescribeRepository) {
    this.HoroscopeRepository = HoroscopeRepository
    this.HoroscopeTagRepository = HoroscopeTagRepository
    this.HoroscopeDescribeRepository = HoroscopeDescribeRepository
  }

  async search(query) {
    let results= await this.HoroscopeRepository
      .browse({ name: query })
      .with('describe')
      .fetch()
    results = results.toJSON()

    if (_.isEmpty(results)) {
      results = await this.HoroscopeTagRepository
        .browse({ tag: query })
        .with('word', (builder) => {
          builder
            .with('describe')
          })
        .fetch()
      results = results.toJSON()

      if (_.isEmpty(results)) {
        results = await this.HoroscopeDescribeRepository
          .browse({ type: describe, detail: query })
          .with('word', (builder) => {
            builder
              .with('describe')
            })
          .fetch()
        results = results.toJSON()
      }

      results = _.map(results, 'word')
    }
    return results
  }

  async createOrUpdate(data) {
    const horoscopeData = _.pick(data, ['name', 'primary_number', 'secondary_number', 'lucky_number'])
    let word = await this.HoroscopeRepository.createOrUpdate(horoscopeData)

    if (!word) return false
    const horoscopeId = word.result.id
    const horoscopeDescribeData = _.pick(data, ['describes'])
    const horoscopeTagData = _.pick(data, ['tags'])

    _.each(horoscopeDescribeData.describes, async (obj) => {
      const createData = {
        horoscope_id: horoscopeId,
        type: obj.type,
        detail: obj.detail,
        order: obj.order
      }
      await this.HoroscopeDescribeRepository.createOrUpdate(createData)
    })

    if(!_.isEmpty(horoscopeTagData)) {
      _.each(horoscopeTagData.tags, async (obj) => {
        await this.HoroscopeTagRepository.createOrUpdate({ horoscope_id: horoscopeData.id, tag: obj })
      })
    }
  }

  async updateAll(data) {
    const horoscopeData = _.pick(data, ['id', 'name', 'primary_number', 'secondary_number', 'lucky_number'])    
    const horoscopeDescribeData = _.pick(data, ['describes'])
    const horoscopeTagData = _.pick(data, ['tags'])

    await this.HoroscopeRepository.updateById(horoscopeData.id, horoscopeData.name)
    _.each(horoscopeDescribeData.describes, async (obj) => {
      const createData = {
        horoscope_id: horoscopeData.id,
        type: obj.type,
        detail: obj.detail,
        order: obj.order
      }
      await this.HoroscopeDescribeRepository.createOrUpdate(createData)
    })


    if(!_.isEmpty(horoscopeTagData)) {
      _.each(horoscopeTagData.tags, async (obj) => {
        await this.HoroscopeTagRepository.createOrUpdate({ horoscope_id: horoscopeData.id, tag: obj })
      })
    }
  }

  async deleteWithRelations(id) {
    const word = await this.HoroscopeRepository.find(id)
    if (!word) return false

    await word.describe().delete()
    await word.tag().delete()
    await word.delete()
    return true
  }
}

module.exports = HoroscopeFunctionRepository

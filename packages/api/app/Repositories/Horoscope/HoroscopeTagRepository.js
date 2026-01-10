'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')

class HoroscopeTagRepository {

  static get inject() {
    return [
      'App/Models/HoroscopeTag',
    ]
  }

  constructor(HoroscopeTag) {
    this.HoroscopeTag = HoroscopeTag
  }

  async createOrUpdate(data) {
    const tagData = _.pick(data, [
      'horoscope_id',
      'tag',
    ])

    const filters = {
      horoscope_id: tagData.horoscope_id,
      tag: tagData.tag
    }

    let horoscopeTag = await this.browse(filters).first()
    if(!horoscopeTag) return await this.HoroscopeTag.create(tagData)

    horoscopeTag.merge(tagData)

    if(await horoscopeTag.save()) return horoscopeTag
    return false
  }

  async findBy(key, value) {
    return await this.HoroscopeTag.findBy(key, value)
  }

  browse(filters = {}) {

    let query = this.HoroscopeTag.query()

    if (_.result(filters, 'select')) {
      query.select(filters.select)
    }

    if (_.result(filters, 'horoscope_id')) {
      query.where('horoscope_id', filters.horoscope_id)
    }

    if (_.result(filters, 'tag')) {
      query.where('tag', filters.tag)
    }

    return query
  }

}

module.exports = HoroscopeTagRepository

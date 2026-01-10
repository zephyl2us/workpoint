'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')

class HoroscopeRepository {

  static get inject() {
    return [
      'App/Models/Horoscope',
    ]
  }

  constructor(Horoscope) {
    this.Horoscope = Horoscope
  }

  async createOrUpdate(data) {
    const horoscopeData = _.pick(data, ['name', 'primary_number', 'secondary_number', 'lucky_number'])

    let horoscope = await this.findBy('name', horoscopeData.name)
    if(!horoscope) {
      horoscope = await this.Horoscope.create(horoscopeData)
      return {
        result: horoscope,
        message: 'success'
      }
    }

    horoscope.merge(horoscopeData)

    if(await horoscope.save()) return {
      result: horoscope,
      message: 'success'
    }
    return {
      result: horoscope,
      message: 'no_update'
    }
  }

  async find(id) {
    return await this.Horoscope.find(id)
  }

  async findBy(key, value) {
    return await this.Horoscope.findBy(key, value)
  }

  browse(filters = {}) {

    let query = this.Horoscope.query()

    if (_.result(filters, 'select')) {
      query.select(filters.select)
    }

    if (_.result(filters, 'name')) {
      query.where('name', 'LIKE', `%${filters.name}%`)
    }

    return query
  }

  async updateById(id, data) {
    const updateData = _.pick(data, ['name', 'primary_number', 'secondary_number', 'lucky_number'])
    let word = await this.find(id)
    if (!word) return false

    word.merge(updateData)
    return await word.save()
  }

}

module.exports = HoroscopeRepository

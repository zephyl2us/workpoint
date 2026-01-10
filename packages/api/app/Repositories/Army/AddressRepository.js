'use strict'

const _ = use('lodash')
const Redis = use('Redis')
const moment = use('moment')
const Database = use('Database')


class AddressRepository {

  static get inject() {
    return [
      'App/Models/Province',
      'App/Models/District',
      'App/Models/Tambon',
    ]
  }

  constructor(Province, District, Tambon) {
    this.Redis = Redis.connection('temp')
    this.Province = Province
    this.District = District
    this.Tambon = Tambon
  }

  async random() {
    const list = await this.Tambon.query()
      .with('district', (builder) => {
        builder.with('province')
      })
      .orderByRaw('RAND()')
      .limit(1)
      .fetch()
    return list.toJSON()
  }

  async all() {
		const cacheKey = `address`
		let cached = await this.Redis.get(cacheKey)

		if (!cached) {
      let list = await this.Province.query()
        .with('district', (builder) => {
          builder.with('tambon', (builder2) => {
            builder2.orderBy('name')
          })
          .orderBy('name')
        })
        .orderBy('name')
        .fetch()

      list = list.toJSON()
			cached = JSON.stringify(list)
      await this.Redis.set(cacheKey, cached)
    }

		const result = JSON.parse(cached)
    return result
  }
}

module.exports = AddressRepository

'use strict'

const _ = use('lodash')
const Redis = use('Redis')
const moment = use('moment')
const Helper = use('App/Helper')


class GenreRepository {

  static get inject() {
    return [
      'App/Models/MdbGenre',
    ]
  }

  constructor(MdbGenre) {
    this.Genre = MdbGenre

    this.Redis = Redis.connection('temp')
    this.cacheMovieDuration = 30 * 60
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('MdbGenre', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
    return await this.Genre.find(id)
	}

	async findBy(field, value) {
		return await this.Genre.findBy(field, value)
	}

  async create(data) {
    data.slug = _.replace(_.lowerCase(data.name), ' ', '_')

    const genre = await this.Genre.create(data)
    return genre
  }

  async fetch () {
		const cacheKey = `movie:master.movie:genres`
		let cached = await this.Redis.get(cacheKey)

		if (!cached) {
      let genres = await this.Genre.query().fetch()

			cached = JSON.stringify(genres)
      const pipeline = this.Redis.pipeline()
      pipeline.set(cacheKey, cached)
      pipeline.expire(cacheKey, this.cacheMovieDuration)
      await pipeline.exec()
    }

		const result = JSON.parse(cached)

    return result
  }

  // async update(genre, data) {

  //   if (_.has(data, 'original_name')) {
  //     genre.original_name = data.original_name
  //   }

  //   if (_.has(data, 'name')) {
  //     genre.name = data.name
  //   }

  //   if (await genre.save()) {
  //     return genre
  //   }

  //   return false
  // }
}

module.exports = GenreRepository

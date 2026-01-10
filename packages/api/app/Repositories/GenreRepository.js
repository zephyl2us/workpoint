'use strict'

const _ = use('lodash')
const Redis = use('Redis')
const moment = use('moment')


class GenreRepository {

  static get inject() {
    return [
      'App/Models/Genre',
    ]
  }

  constructor(Genre) {
    this.Genre = Genre
  }

  browse(filters, options = {mode: 'write'}) {

    let query = this.Genre.query()

    if (_.result(filters, 'select')) {
      query.select(filters.select)
    }

    if (_.result(filters, 'id')) {
      query.where('id', filters.id)
    }

    if (_.result(filters, 'ref_id')) {
      query.where('ref_id', filters.ref_id)
    }

    if (_.result(filters, 'original_name')) {
      query.where('original_name', filters.original_name)
    }

    if (_.result(filters, 'name')) {
      query.where('name', filters.name)
    }

    return query
  }

	async find(id) {
    return await this.Genre.findOrFail(id)
	}

	async findBy(field, value) {
		return await this.Genre.findByOrFail(field, value)
	}

  async create(data) {
    const genre = await this.Genre.create(data)
    return genre
  }

  async update(genre, data) {

    if (_.has(data, 'original_name')) {
      genre.original_name = data.original_name
    }

    if (_.has(data, 'name')) {
      genre.name = data.name
    }

    if (await genre.save()) {
      return genre
    }

    return false
  }
}

module.exports = GenreRepository

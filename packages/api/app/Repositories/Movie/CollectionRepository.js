'use strict'

const _ = use('lodash')
const Redis = use('Redis')
const moment = use('moment')
const Helper = use('App/Helper')


class CollectionRepository {

  static get inject() {
    return [
      'App/Models/MdbCollection',
    ]
  }

  constructor(MdbCollection) {
    this.Collection = MdbCollection
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('MdbCollection', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
    return await this.Collection.find(id)
	}

	async findBy(field, value) {
		return await this.Collection.findBy(field, value)
	}

  async create(data) {
    const collection = await this.Collection.create(data)
    return collection
  }

  async create(data) {
    let collection = new this.Collection()

    collection = _.assign(collection, _.pick(data, [
      'ref_id',
      'original_name',
      'name',
      'poster_path',
      'backdrop_path',
    ]))


    if(await collection.save()) {
      return collection
    }
    return false
  }

  async update(collection, data) {

    collection = _.assign(collection, _.pick(data, [
      'name',
      'poster_path',
      'backdrop_path',
      'parts'
    ]))
    
    if (await collection.save()) {
      return collection
    }

    return false
  }
}

module.exports = CollectionRepository

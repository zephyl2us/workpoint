'use strict'

const _ = use('lodash')
const Redis = use('Redis')
const moment = use('moment')
const Helper = use('App/Helper')


class PersonRepository {

  static get inject() {
    return [
      'App/Models/MdbPerson',
    ]
  }

  constructor(MdbPerson) {
    this.Person = MdbPerson
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('MdbPerson', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
    return await this.Person.find(id)
	}

	async findBy(field, value) {
		return await this.Person.findBy(field, value)
	}

  // async create(data) {
  //   const person = await this.Person.create(data)
  //   return person
  // }

  async create(data) {
    let person = new this.Person()

    person = _.assign(person, _.pick(data, [
      'ref_id',
      'imdb_id',
      'original_name',
      'name',
      'gender',
      'birthday',
      'place_of_birth',
      'deathday',
      'original_biography',
      'biography',
      'profile_path',
      'popularity',
    ]))


    if(await person.save()) {
      return person
    }
    return false
  }

  async update(person, data) {

    person = _.assign(person, _.pick(data, [
      'name',
      'gender',
      'birthday',
      'place_of_birth',
      'deathday',
      'biography',
      'profile_path',
      'popularity',
    ]))
    
    if (await person.save()) {
      return person
    }

    return false
  }
  // async update(person, data) {

  //   if (_.has(data, 'original_name')) {
  //     person.original_name = data.original_name
  //   }

  //   if (_.has(data, 'name')) {
  //     person.name = data.name
  //   }

  //   if (await person.save()) {
  //     return person
  //   }

  //   return false
  // }
}

module.exports = PersonRepository

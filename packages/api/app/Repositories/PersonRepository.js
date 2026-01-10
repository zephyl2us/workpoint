'use strict'

const _ = use('lodash')
const Redis = use('Redis')
const moment = use('moment')


class PersonRepository {

  static get inject() {
    return [
      'App/Models/Person',
    ]
  }

  constructor(Person) {
    this.Person = Person
    this.picUri = 'https://image.tmdb.org/t/p/original'
  }

  browse(filters, options = {mode: 'write'}) {

    let query = this.Person.query()

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
    return await this.Person.findOrFail(id)
	}

	async findBy(field, value) {
		return await this.Person.findByOrFail(field, value)
	}

  // async create(data) {
  //   const person = await this.Person.create(data)
  //   return person
  // }

  async jobCreate(data) {
    let person = new this.Person()
    const refId = data.id
    if(refId) {
      person.ref_id = refId
    }

    const name = data.name
    if(name) {
      person.name = name
    }

    const gender = data.gender
    if(gender) {
      person.gender = (gender == 1 ? 'female' : 'male')
    }

    const biography = data.biography
    if(biography) {
      person.biography = biography
    }

    const birthday = data.birthday
    if(birthday) {
      person.birthday = birthday
    }

    const deathday = data.deathday
    if(deathday) {
      person.deathday = deathday
    }

    const placeOfBirth = data.place_of_birth
    if(placeOfBirth) {
      person.place_of_birth = placeOfBirth
    }

    const role = data.known_for_department
    if(role) {
      person.role = (role == 'Acting' ? 'actor' : 'director')
    }

    const profilePath = data.profile_path
    if(profilePath) {
      person.profile_path = this.picUri + profilePath
    }

    if(await person.save()) {
      return person
    }

    return false
  }

  async jobUpdate(person, data) {
    if(_.has(data, 'id')) {
      person.ref_id = data.id
    }

    if(_.has(data, 'name')) {
      person.name = data.name
    }

    if(_.has(data, 'gender')) {
      person.gender = (data.gender == 1 ? 'female' : 'male')
    }

    if(_.has(data, 'biography')) {
      person.biography = data.biography
    }

    if(_.has(data, 'birthday')) {
      person.birthday = data.birthday
    }

    if(_.has(data, 'deathday')) {
      person.deathday = data.deathday
    }

    if(_.has(data, 'place_of_birth')) {
      person.place_of_birth = data.place_of_birth
    }

    if(_.has(data, 'role')) {
      person.role = data.known_for_department
    }

    if(_.has(data, 'profilePath')) {
      person.profile_path = this.picUri + data.profile_path
    }

    if(await person.save()) {
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

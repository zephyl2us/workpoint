'use strict'

const _ = use('lodash')
const Redis = use('Redis')
const moment = use('moment')
const Database = use('Database')


class IdentityRepository {

  static get inject() {
    return [
      'App/Models/AntIdentity',
    ]
  }

  constructor(AntIdentity) {
    this.AntIdentity = AntIdentity
  }

  browse(filters) {
    let query = this.AntIdentity.query()

    if(_.result(filters, 'name')) {
      query.where('name', filters.name)
    }
    
    if(_.result(filters, 'name_en')) {
      query.where('name_en', filters.name_en)
    }
    
    if(_.result(filters, 'type')) {
      query.where('type', filters.type)
    }
    
    if(_.result(filters, 'gender')) {
      query.where('gender', filters.gender)
    }
    
    return query
  }

  async create(data) {
    const dataCreate = _.pick(data, ['name', 'name_en', 'type', 'gender'])
    let find = await this.browse(dataCreate).fetch()
    find = find.toJSON()
    if (!_.isEmpty(find)) return
    return await this.AntIdentity.create(dataCreate)
  }

  async random() {
    const randomGender = _.random(0, 1) ? 'male' : 'female'
    const firstName = await this.browse({ type: 'firstname', gender: randomGender }).orderByRaw('RAND()').first()
    const nickName = await this.browse({ type: 'nickname', gender: randomGender }).orderByRaw('RAND()').first()
    const lastName = await this.browse({ type: 'lastname' }).orderByRaw('RAND()').first()

    return {
      first_name: {
        th: firstName.name,
        en: firstName.name_en
      },
      last_name: {
        th: lastName.name,
        en: lastName.name_en
      },
      nick_name: {
        th: nickName.name,
        en: nickName.name_en
      },
      gender: randomGender
    }
  }
}

module.exports = IdentityRepository

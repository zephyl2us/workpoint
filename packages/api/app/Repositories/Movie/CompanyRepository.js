'use strict'

const _ = use('lodash')
const Redis = use('Redis')
const moment = use('moment')
const Helper = use('App/Helper')


class CompanyRepository {

  static get inject() {
    return [
      'App/Models/MdbCompany',
    ]
  }

  constructor(MdbCompany) {
    this.Company = MdbCompany
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('MdbCompany', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
    return await this.Company.find(id)
	}

	async findBy(field, value) {
		return await this.Company.findBy(field, value)
	}

  async create(data) {
    let company = new this.Company()

    company = _.assign(company, _.pick(data, [
      'ref_id',
      'name',
      'headquarters',
      'origin_country',
      'homepage',
      'logo_path',
    ]))


    if(await company.save()) {
      return company
    }
    return false
  }

  async update(company, data) {

    company = _.assign(company, _.pick(data, [
      'headquarters',
      'origin_country',
      'homepage',
      'logo_path',
    ]))
    
    if (await company.save()) {
      return company
    }

    return false
  }
}

module.exports = CompanyRepository

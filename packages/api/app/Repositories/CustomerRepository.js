'use strict'

const _ = use('lodash')
const Bull = use('Bull')
const Config = use('Config')
const moment = use('moment')

class CustomerRepository {

  static get inject() {
    return [
      'App/Models/Customer'
    ]
  }

  constructor(Customer) {
    this.Customer = Customer
  }

  browse(filters= {}) {
    let query = this.Customer.query()

    if(_.result(filters, 'select')) {
      query.select(filters.select)
    }

    if(_.result(filters, 'first_name')) {
      query.where('first_name', filters.first_name)
    }

    if(_.result(filters, 'last_name')) {
      query.where('last_name', filters.last_name)
    }

    if(_.result(filters, 'phone')) {
      query.where('phone', filters.phone)
    }

    return query
  }

  async create(data) {
    const createData = _.pick(data, [
      'first_name',
      'last_name',
      'phone'
    ])

    const exists = await this.browse({ phone: createData.phone }).first()
    if (exists) return false

    await this.Customer.create(createData)
  }

  async jobCreate(obj) {
    const data = this.nameCracker(obj)

    if (!data) return
    if (obj.length > 3) return
    if (/[A-Za-z]/.exec(_.get(data, 'first_name'))) return
    if (!this.phoneValidate(_.get(data, 'phone'))) return

    // console.log(data)

    // return data
    await this.create(data)
  }

  phoneValidate(number) {
    return /\d{10}/g.exec(number) && number.length === 10
  }

  modifyPhone(number) {
    if (_.size(number) === 9) number = '0' + number
    if (_.size(number) === 11 && _.join(_.slice(number, 0, 2), '') === '66') number = '0' + _.join(_.slice(number, -9), '')

    return number
  }

  nameCracker(collection) {
    const charReplace = (text, regex = /[\.\- \/\\+,]/g, replacement = '') => {
      return _.replace(text, regex, replacement)
    }

    if (_.size(collection) == 1) {
      const phone = _.get(collection, '0')

      return {
        first_name: null,
        last_name: null,
        phone: this.modifyPhone(charReplace(phone))
      }
    }

    if (_.size(collection) == 2) {
      const split = _.compact(_.split(collection[0], ' '))
      let firstName = _.get(split, '0')
      let lastName = _.get(split, '1') || null
      let phone = _.get(collection, '1')

      firstName = charReplace(firstName, /^(นาย|นางสาว|นาง|น\.ส\.)/g)

      return {
        first_name: charReplace(firstName),
        last_name: charReplace(lastName),
        phone: this.modifyPhone(charReplace(phone))
      }
    }

    if (_.size(collection) == 3) {
      let firstName = _.get(collection, '0')
      let lastName = _.get(collection, '1') || null
      let phone = _.get(collection, '2')

      firstName = charReplace(firstName, /^(นาย|นางสาว|นาง|น\.ส\.)/g)

      return {
        first_name: charReplace(firstName),
        last_name: charReplace(lastName),
        phone: this.modifyPhone(charReplace(phone))
      }
    }
    return false
  }

}

module.exports = CustomerRepository

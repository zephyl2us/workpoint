'use strict'

const _ = use('lodash')
const moment = use('moment')
const Redis = use('Redis')
const Helper = make('App/Helper')
const CustomerRepository = make('App/Repositories/CustomerRepository')

class CustomerCreation {
  // static get connection() {
  //   return "remote";
  // }

  constructor() {
  }

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'CustomerCreation-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job
		try {

      const customer = data.customer
      const item = _.split(customer, ',')
      await CustomerRepository.jobCreate(item)

		} catch (e) {
			console.log(e)
		}
  }

  async onCompleted(job, result) {
    // console.log('Job Compleate...', result)
  }
}

module.exports = CustomerCreation

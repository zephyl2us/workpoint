'use strict'

const _ = use('lodash')
const Helper = make('App/Helper')

class BullTest {
  // static get connection() {
  //   return "remote";
  // }

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'BullTest-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    

    const { data } = job

    // console.log('job: ', data)

    // console.log('Start job: ', data)

    return data
  }

  async onCompleted(job, result) {
    console.log('Job Compleate...', result)
  }
}

module.exports = BullTest

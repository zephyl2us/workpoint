'use strict'

const Helper = make('App/Helper')
const Logger = use('Logger')
const _ = use('lodash')

class KueLogger {

  // static get connection() {
  //   return "remote";
  // }

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true
    }
  }

  static get key () {
    return 'KueLogger'
  }

  async handle (job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    try {
      const { data } = job
      const { title, ...messages } = data
      Logger.info(title, messages)
    } catch (e) {
      // console.log(e)
    }
  }
}

module.exports = KueLogger


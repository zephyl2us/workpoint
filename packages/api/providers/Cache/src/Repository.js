'use strict'

const _ = require('lodash')
const Util = require('adonis-cache/src/Util')
const BaseRepository = require('adonis-cache/src/Stores/Repository')

class Repository extends BaseRepository {

  async model (model, key, minutes, closure) {
    const memory = await this.get(key)

		// if (key == 'user:permission:2') {
		// 	console.log('cache', memory)
		// }

    if (!memory) {
      const fetch = await Util.valueOf(closure)

			// if (key == 'user:permission:2') {
			// 	console.log('fetch', fetch)
			// }

      if (!_.isNull(fetch)) {
        this.put(key, fetch['$attributes'], minutes)
      }
      return fetch
    }
    let theModel = new model()
    Object.assign(theModel, {
      '$attributes': _.cloneDeep(memory),
      '$originalAttributes': _.cloneDeep(memory),
      '$persisted': true
    })

		// if (key == 'user:permission:2') {
		// 	console.log('model', theModel)
		// }

    return theModel
  }

}

module.exports = Repository

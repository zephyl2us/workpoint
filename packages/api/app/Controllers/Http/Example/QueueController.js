'use strict'

const _ = use('lodash')
const Bull = use('Bull')
const BullTestJob = use('App/Jobs/BullTest')

class QueueController {

	async bullTest () {
		const data = {
			bull: 'Test Data'
		}

		Bull.add(BullTestJob.key, data)

		const delayAsSeconds = 5 * 1000
		
		Bull.schedule(BullTestJob.key, data, delayAsSeconds)

		return 'Bull Test'
	}
}

module.exports = QueueController

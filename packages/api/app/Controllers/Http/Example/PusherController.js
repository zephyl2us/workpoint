'use strict'

const _ = use('lodash')
const Pusher = use('Pusher')

class PusherController {

	async pusherTest () {
		const data = {
			id: 1
		}

		Pusher.trigger(`lottery`, 'result-update', data)

		return 'Pusher'
	}
}

module.exports = PusherController

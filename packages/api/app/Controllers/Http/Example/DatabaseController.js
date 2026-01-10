'use strict'

const _ = use('lodash')
const Database = use('Database')

class QueueController {

	async mySqlTest () {
		return await Database.table('users').select('*')
	}
}

module.exports = QueueController

'use strict'

const Model = require('../Lottery')

class Lottery extends Model {
	static get connection () {
		return 'mysql_read'
	}

  category () {
    return this.belongsTo('App/Models/Read/LotteryCategory')
	}
}

module.exports = Lottery

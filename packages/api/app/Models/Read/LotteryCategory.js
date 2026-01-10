'use strict'

const Model = require('../LotteryCategory')

class LotteryCategory extends Model {
	static get connection () {
		return 'mysql_read'
	}

  lottery () {
    return this.hasOne('App/Models/Read/Lottery')
	}
}

module.exports = LotteryCategory

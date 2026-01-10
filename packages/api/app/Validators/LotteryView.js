'use strict'

const { formatters } = use('Validator')

class LotteryView {
  get rules () {
    return {
			'date': 'date_format:YYYY-MM-DD',

		}
  }

  async fails (errorMessages) {
    return this.ctx.response.badRequest(errorMessages)
  }
}

module.exports = LotteryView

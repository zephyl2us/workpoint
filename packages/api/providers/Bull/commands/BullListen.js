'use strict'

const { Command } = require('@adonisjs/ace')
const Bull = use("Rocketseat/Bull")

class BullListen extends Command {

  static get signature () {
		return 'bull:listen { --accepts=@value : Files to accept } { --rejects=@value : Files to reject }'
	}

  static get description () {
    return 'Processing jobs with bull'
  }

  async handle (args, options) {
    Bull.process(options)
  }
}

module.exports = BullListen

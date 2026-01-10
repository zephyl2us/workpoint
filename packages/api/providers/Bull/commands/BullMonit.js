'use strict'

const { Command } = require('@adonisjs/ace')
const Bull = use("Rocketseat/Bull")

class BullMonit extends Command {

  static get signature () {
    return `
      bull:monit
      { --port=@value : listing port }
    `
  }

  static get description () {
    return 'Monitor jobs with bull'
  }

  async handle (args, options) {
    const port = options.port || 9999
    Bull.ui(port)
  }
}

module.exports = BullMonit

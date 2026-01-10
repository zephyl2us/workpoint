'use strict'

const { Command } = require('@adonisjs/ace')
const _ = use('lodash')
const moment = use('moment')
const rp = use('request-promise')
const Bull = use('Bull')
const AdsPowerJob = use('App/Jobs/AdsPower')
// const AdsPowerOpenJob = use('App/Jobs/AdsPowerOpen')
// const AdsPowerCloseJob = use('App/Jobs/AdsPowerClose')
const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')
const ArmyAntBotRepository = make('App/Repositories/ArmyAntBotRepository')

const apiUrl = 'http://10.1.0.99:50325'

class ArmyAntMapping extends Command {
  static get signature () {
    return 'ant:stop'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {
    const datetime = moment().format('YYYY-MM-DD HH:mm:ss')

    const filters = {}
    let antBots = await ArmyAntBotRepository.browse({ filters: filters })
      .where('status','running')
      .where('stopped_at', '<', datetime)
      .whereNotNull('stopped_at')
      .with('ant')
      .fetch()

    antBots = antBots.toJSON()

    for(let i = 0; i < _.size(antBots); i++) {
      const antBot = antBots[i]

      const adsPowerId = _.get(antBot, 'ant.adspower_id')
      Bull.add(AdsPowerJob.key, {
        kind: 'close',
        ant_bot: antBot,
        user_id: adsPowerId,
      })
    }
  }

}

module.exports = ArmyAntMapping

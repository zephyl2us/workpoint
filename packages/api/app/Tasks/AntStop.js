'use strict'

const _ = use('lodash')
const moment = use('moment')
const Task = use('Task')
const Helper = use('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const Bull = use('Bull')
const AdsPowerJob = use('App/Jobs/AdsPower')
const GoLoginJob = use('App/Jobs/GoLogin')
const ArmyAntBotRepository = make('App/Repositories/ArmyAntBotRepository')

class AntStop extends Task {
  static get schedule () {
    return '*/5 * * * * *'
  }

  async handle () {
    // this.info('Task AntStop handle')
    if(Helper.isDevMode()) console.log('Scheduler : Ant Stop every 30 Second (15,45)')

    try {
      const cacheKey = `request_start:adspower_stop`
      const hasCache = await ArmyAntBotRepository.hasRequestCache(cacheKey)

      if(hasCache) {
        if(Helper.isDevMode()) console.log('AdsPower stop is in Queue')
        return
      }

      const datetime = moment().format('YYYY-MM-DD HH:mm:ss')
  
      const filter = {}
      let antBot = await ArmyAntBotRepository.browse({ filter: filter, sort: 'stopped_at|asc' })
        .where('status','running')
        .where('stopped_at', '<', datetime)
        .whereNotNull('stopped_at')
        .with('ant')
        .first()
  
      // antBots = antBots.toJSON()

      if(!antBot) {
        if(cacheKey) await ArmyAntBotRepository.clearRequestCache(cacheKey)
        return
      }

      antBot = antBot.toJSON()

      
      const adsPowerId = _.get(antBot, 'ant.adspower_id')
      Bull.add(AdsPowerJob.key, {
        kind: 'close',
        server: antBot.server,
        ant_bot: antBot,
        user_id: adsPowerId,
        cache_key: cacheKey
      })

      // for(let i = 0; i < _.size(antBots); i++) {
      //   const antBot = antBots[i]
  
      //   const adsPowerId = _.get(antBot, 'ant.adspower_id')
      //   Bull.add(AdsPowerJob.key, {
      //     kind: 'close',
      //     server: antBot.server,
      //     ant_bot: antBot,
      //     user_id: adsPowerId,
      //   })

      //   // const goLoginId = _.get(antBot, 'ant.gologin_id')
      //   // Bull.add(GoLoginJob.key, {
      //   //   kind: 'close',
      //   //   server: antBot.server,
      //   //   ant_bot: antBot,
      //   //   profileId: goLoginId,
      //   // })
      // }
    } catch (e) {
			const dataLogs = {
        title: 'AntStop-Task',
        path: 'App/Tasks/AntStop',
        channel: 'tasks',
        message: e.message,
				data: e,
      }
			LogRepository.fire(dataLogs)
    }
  }
}

module.exports = AntStop
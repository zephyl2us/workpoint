'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const GoLoginRepository = make('App/Repositories/GoLoginRepository')
const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')
const ArmyAntBotRepository = make('App/Repositories/ArmyAntBotRepository')
const ArmyAntProxyRepository = make('App/Repositories/ArmyAntProxyRepository')

class GoLogin {
  // static get connection() {
  //   return "remote";
  // }

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'GoLogin-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))

    // const startTime = moment().unix()
    const { data } = job
    const kind = data.kind
    const server = _.get(data, 'server') || null

    // await new Promise(r => setTimeout(r, 1000))

		try {

      if(kind === 'open') {
        const response = await GoLoginRepository.openBrowser(data)
        if(response) {
          const id = _.get(data, 'ant_bot.id')
          const proxy = _.get(data, 'proxy') || null
          const armyAntProxyId = _.get(data, 'army_ant_proxy_id') || null

          let antBot = await ArmyAntBotRepository.findBy('id', id)

          const botData = {
            server: server,
            army_ant_proxy_id: armyAntProxyId,
            proxy: proxy,
            status: 'running',
            start_at: moment().format('YYYY-MM-DD HH:mm:ss')
          }
          // console.log(botData)

          await ArmyAntBotRepository.update(antBot, botData)
          // console.log('updated')
          await ArmyAntBotRepository.createActivityById(id, {
            action: 'browser_start'
          })

        }
      } else if(kind === 'close') {
        const response = await GoLoginRepository.closeBrowser(data)
        
        const id = _.get(data, 'ant_bot.id')
        let antBot = await ArmyAntBotRepository.findBy('id', id)
        // console.log(antBot)

        await ArmyAntBotRepository.createActivityById(id, {
          action: 'browser_stop'
        })
        const activities = await ArmyAntBotRepository.getActivityById(id)
        
        let payload = antBot.payload
        payload.activities = activities

        await ArmyAntBotRepository.update(antBot, {
          status: 'stopped',
          payload: payload,
          stopped_at: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        const proxyId = _.get(antBot, 'army_ant_proxy_id')
        if(proxyId) {
          const proxy = await ArmyAntProxyRepository.findBy('id', proxyId)
          const updateProxy = await ArmyAntProxyRepository.update(proxy, {
            available_at: moment().add(1, 'minutes').format('YYYY-MM-DD HH:mm:ss')
          })

          await ArmyAntProxyRepository.rotationProxy(proxy)
        }
      // } else if(kind === 'create') {
      //   const createUser = await GoLoginRepository.createUser(data)
      } else if(kind === 'update') {
        const updateUser = await GoLoginRepository.updateUser(data)
      }

      await new Promise(r => setTimeout(r, 1000))
      const endTime = moment().unix()

      
		} catch (e) {
			const dataLogs = {
				title: 'GoLogin-job',
				path: 'app/Jobs',
				channel: 'kue',
				message: e.message,
				data: e,
				params: data
			}
			LogRepository.fire(dataLogs)
		}
  }

  async onCompleted(job, result) {
    // console.log('Job Compleate...', result)
  }
}

module.exports = GoLogin

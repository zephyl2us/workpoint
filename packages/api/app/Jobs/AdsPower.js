'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const AdsPowerRepository = make('App/Repositories/AdsPowerRepository')
const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')
const ArmyAntBotRepository = make('App/Repositories/ArmyAntBotRepository')
const ArmyAntProxyRepository = make('App/Repositories/ArmyAntProxyRepository')

class AdsPower {
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
    return 'AdsPower-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))

    // const startTime = moment().unix()
    const { data } = job
    const kind = data.kind
    const server = _.get(data, 'server') || null
    const cacheKey = _.get(data, 'cache_key') || null

    // await new Promise(r => setTimeout(r, 1000))

		try {

      if(kind === 'open') {
        const adsPowerId = _.get(data, 'user_id')
        const armyAntProxyId = _.get(data, 'army_ant_proxy_id') || null
        const proxyServer = _.get(data, 'proxy') || null
        const splitProxy = _.split(proxyServer, ':')
        const proxyHost = splitProxy[0]
        const proxyPort = splitProxy[1]

        const updateAdsPowerUser = await AdsPowerRepository.updateUser({
          user_id: adsPowerId,
          open_urls: [],
          user_proxy_config: {
            proxy_soft: 'other',
            proxy_type: 'http',
            proxy_host: proxyHost,
            proxy_port: proxyPort
          }
        })
        
        if(!updateAdsPowerUser) {
          if(Helper.isDevMode()) console.log('Can\'t update proxy.')
          return
        }
  
        const availableAt = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss')
        const proxy = await ArmyAntProxyRepository.findBy('id', armyAntProxyId)
        const updateProxy = await ArmyAntProxyRepository.update(proxy, {
          available_at: availableAt
        })
  
        await new Promise(r => setTimeout(r, 1000))

        const response = await AdsPowerRepository.openBrowser(data)
        if(response) {
          const id = _.get(data, 'ant_bot.id')

          let antBot = await ArmyAntBotRepository.findBy('id', id)

          const botData = {
            server: server,
            army_ant_proxy_id: armyAntProxyId,
            proxy: proxyServer,
            status: 'running',
            start_at: moment().format('YYYY-MM-DD HH:mm:ss')
          }
          // console.log(botData)

          await ArmyAntBotRepository.update(antBot, botData)
          // console.log('updated')
          await ArmyAntBotRepository.createActivityById(id, {
            action: 'adspower_start'
          })
        }

        // await new Promise(r => setTimeout(r, 1000))
        // if(cacheKey) await ArmyAntBotRepository.clearRequestCache(cacheKey)

      } else if(kind === 'close') {
        const response = await AdsPowerRepository.closeBrowser(data)
        // console.log(data)

        // if(!response) {
        //   return
        // }

        await new Promise(r => setTimeout(r, 1000))

        const statusBrowser = await AdsPowerRepository.statusBrowser(data)

        const status = _.get(statusBrowser, 'data.status')

        if(!_.eq(status, 'Inactive')) {
          return
        }
        
        const id = _.get(data, 'ant_bot.id')
        let antBot = await ArmyAntBotRepository.findBy('id', id)
        // console.log(antBot)

        await ArmyAntBotRepository.createActivityById(id, {
          action: 'adspower_stop'
        })
        const activities = await ArmyAntBotRepository.getActivityById(id)
        
        let payload = antBot.payload
        payload.activities = activities

        await ArmyAntBotRepository.update(antBot, {
          status: 'stopped',
          payload: payload,
          stopped_at: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        const proxyId = antBot.army_ant_proxy_id
        if(proxyId) {
          const proxy = await ArmyAntProxyRepository.findBy('id', proxyId)
          const updateProxy = await ArmyAntProxyRepository.update(proxy, {
            available_at: moment().add(1, 'minutes').format('YYYY-MM-DD HH:mm:ss')
          })

          await ArmyAntProxyRepository.rotationProxy(proxy)
        }
      // } else if(kind === 'create') {
      //   const createUser = await AdsPowerRepository.createUser(data)
      } else if(kind === 'update') {
        const updateUser = await AdsPowerRepository.updateUser(data)
      }

      // await new Promise(r => setTimeout(r, 1000))
      // const endTime = moment().unix()
		} catch (e) {
      if(cacheKey) await ArmyAntBotRepository.clearRequestCache(cacheKey)
			const dataLogs = {
				title: 'AdsPower-job',
				path: 'app/Jobs',
				channel: 'kue',
				message: e.message,
				data: e,
				params: data
			}
			LogRepository.fire(dataLogs)
    } finally {
      if(cacheKey) await ArmyAntBotRepository.clearRequestCache(cacheKey)
    }
  }

  async onCompleted(job, result) {
    // console.log('Job Compleate...', result)
  }
}

module.exports = AdsPower

'use strict'

const _ = use('lodash')
const moment = use('moment')
const Task = use('Task')
const Helper = use('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const Bull = use('Bull')
// const GoLoginJob = use('App/Jobs/GoLogin')
// const GoLoginRepository = make('App/Repositories/GoLoginRepository')
const AdsPowerJob = use('App/Jobs/AdsPower')
const AdsPowerRepository = make('App/Repositories/AdsPowerRepository')
const ArmyAntBotRepository = make('App/Repositories/ArmyAntBotRepository')
const ArmyAntProxyRepository = make('App/Repositories/ArmyAntProxyRepository')

class AntStart extends Task {
  static get schedule () {
    return '*/2 * * * * *'
  }

  async handle () {
    // this.info('Task AntStart handle')
    if(Helper.isDevMode()) console.log('Scheduler : Ant Start every 2 Second')

    try {
      const cacheKey = `request_start:adspower_start`
      const hasCache = await ArmyAntBotRepository.hasRequestCache(cacheKey)

      if(hasCache) {
        if(Helper.isDevMode()) console.log('AdsPower start is in Queue')
        return
      }
      
      const filter = {
        status: 'ready'
      }
  
      let antBot = await ArmyAntBotRepository.browse({ filter, sort: 'id:asc' }).with('ant').first()
      // console.log(antBot)
  
      if(!antBot) {
        if(Helper.isDevMode()) console.log('Not Found.')
        if(cacheKey) await ArmyAntBotRepository.clearRequestCache(cacheKey)
        return
      }
      antBot = antBot.toJSON()
  
      const config = await ArmyAntBotRepository.getConfig()
      const automation = _.get(config, 'automation') || false
  
      if(automation !== true) {
        if(Helper.isDevMode()) console.log('Automation is disabled.')
        if(cacheKey) await ArmyAntBotRepository.clearRequestCache(cacheKey)
        return
      }
  
      const availableProxy = await ArmyAntProxyRepository.getAvailableProxy()

      if(!availableProxy) {
        if(Helper.isDevMode()) console.log('No available proxy.')
        if(cacheKey) await ArmyAntBotRepository.clearRequestCache(cacheKey)
        return
      }
      // console.log(availableProxy)

      const availableServer = await ArmyAntBotRepository.getAvailableServer()
  
      if(!availableServer) {
        if(Helper.isDevMode()) console.log('No available server.')
        if(cacheKey) await ArmyAntBotRepository.clearRequestCache(cacheKey)
        return
      }
  
      const adsPowerId = _.get(antBot, 'ant.adspower_id')
      const goLoginId = _.get(antBot, 'ant.gologin_id')
      const antId = _.get(antBot, 'ant.id')
      const firstName = _.get(antBot, 'ant.first_name_en')
      const lastName = _.get(antBot, 'ant.last_name_en')
      // console.log(goLoginId)

      // await ArmyAntProxyRepository.rotation(availableProxy)

      const proxyHost = _.get(availableProxy, 'ip')
      const proxyPort = _.get(availableProxy, 'port')

      // GoLogin
      // const updateGoLoginUser = await GoLoginRepository.updateUser({
      //   id: goLoginId,
      //   name: `[${antId}] ${firstName} ${lastName}`,
      //   browserType: 'chrome',
      //   os: 'lin',
      //   startUrl: null,
      //   navigator: {
      //     userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
      //     resolution: '384x857',
      //     language: 'en-GB,en-US;q=0.9,en;q=0.8',
      //     platform: 'Android OS',
      //     doNotTrack: true
      //   },
      //   fonts: {
      //       families: [
      //         'Roberto',
      //         'FreeSans',
      //         'FreeSerif'
      //       ],
      //       enableMasking: false,
      //       enableDomRect: true
      //   },
      //   proxy: {
      //       mode: 'http',
      //       host: proxyHost,
      //       port: proxyPort,
      //       username: '',
      //       password: ''
      //   },
      //   chromeExtensions: [
      //     'aadlckelcockpdgplkdllgokjnckncll'
      //   ]
      // })
      // 
      // if(!updateGoLoginUser) {
      //   if(Helper.isDevMode()) console.log('Can\'t update proxy.')
      //   return
      // }

      const proxyId = _.get(availableProxy, 'id')

      // const updateAdsPowerUser = await AdsPowerRepository.updateUser({
      //   user_id: adsPowerId,
      //   open_urls: [],
      //   user_proxy_config: {
      //     proxy_soft: 'other',
      //     proxy_type: 'http',
      //     proxy_host: proxyHost,
      //     proxy_port: proxyPort
      //   }
      // })
      
      // if(!updateAdsPowerUser) {
      //   if(Helper.isDevMode()) console.log('Can\'t update proxy.')
      //   return
      // }

      // const availableAt = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss')
      // const proxyId = _.get(availableProxy, 'id')
      // const proxy = await ArmyAntProxyRepository.findBy('id', proxyId)
      // const updateProxy = await ArmyAntProxyRepository.update(proxy, {
      //   available_at: availableAt
      // })

      // console.log(updateProxy)

      // console.log(updateGoLoginUser)
  
      const proxyServer = `${proxyHost}:${proxyPort}`
      Bull.add(AdsPowerJob.key, {
        kind: 'open',
        server: availableServer.name,
        army_ant_proxy_id: proxyId,
        proxy: proxyServer,
        ant_bot: antBot,
        user_id: adsPowerId,
        open_tabs: 1,
        cache_key: cacheKey
      })
      // Bull.add(GoLoginJob.key, {
      //   kind: 'open',
      //   server: availableServer.name,
      //   army_ant_proxy_id: proxyId,
      //   proxy: proxyServer,
      //   ant_bot: antBot,
      //   profileId: goLoginId,
      //   open_tabs: 1
      // })
  
    } catch (e) {
			const dataLogs = {
        title: 'AntStart-Task',
        path: 'App/Tasks/AntStart',
        channel: 'tasks',
        message: e.message,
				data: e,
      }
			LogRepository.fire(dataLogs)
    }
  }
}

module.exports = AntStart
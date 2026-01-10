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
// const AdsPowerRepository = make('App/Repositories/AdsPowerRepository')

class ArmyAntStarter extends Command {
  static get signature () {
    return 'ant:start'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {

    const filter = {
      status: 'ready'
    }

    let antBot = await ArmyAntBotRepository.browse({ filter, sort: 'id:asc' }).with('ant').first()
    // console.log(antBot)

    if(!antBot) {
      // console.log('Not Found.')
      return
    }
    antBot = antBot.toJSON()

    const config = await ArmyAntBotRepository.getConfig()
    const automation = _.get(config, 'automation') || false

    if(automation !== true) {
      // console.log('Automation is disabled.')
      return
    }

    const availableServer = await ArmyAntBotRepository.getAvailableServer()

    if(!availableServer) {
      // console.log('No available server.')
      return
    }

    const adsPowerId = _.get(antBot, 'ant.adspower_id')
    // console.log(adsPowerId)

    Bull.add(AdsPowerJob.key, {
      kind: 'open',
      server: availableServer.name,
      ant_bot: antBot,
      user_id: adsPowerId,
    })

    // console.log(availableServer)

    // await ArmyAntPowerRepository.startAutomation()
    // const ant = await ArmyAntBotRepository.getAntAutomation()
    // if(!ant) {
    //   console.log(`No available ant.`)
    //   return
    // }

    // Bull.add(AdsPowerOpenJob.key, {
    //   user: ant,
    //   ant_power: antPower,
    //   server: availableServer,
    //   open_urls: ['https://www.facebook.com']
    // })
  }

}

module.exports = ArmyAntStarter

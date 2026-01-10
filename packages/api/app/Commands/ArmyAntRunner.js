'use strict'

const { Command } = require('@adonisjs/ace')
const _ = use('lodash')
const moment = use('moment')
const rp = use('request-promise')
const Bull = use('Bull')
// const AdsPowerOpenJob = use('App/Jobs/AdsPowerOpen')
// const AdsPowerCloseJob = use('App/Jobs/AdsPowerClose')
const ArmyAntRepository = make('App/Repositories/ArmyAntRepository')
const ArmyAntBotRepository = make('App/Repositories/ArmyAntBotRepository')

class ArmyAntMapping extends Command {
  static get signature () {
    return 'ant:runner'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {

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

    // console.log(availableServer)

    const ant = await ArmyAntBotRepository.getAntAutomation()
    if(!ant) {
      // console.log(`No available ant.`)
      return
    }

    // console.log(ant)

    const antId = ant.id
    const antPower = await ArmyAntBotRepository.createAutomationByAntId(antId)

    if(!antPower) {
      // console.log(`Cann't create automation.`)
      return
    }
  }

}

module.exports = ArmyAntMapping
